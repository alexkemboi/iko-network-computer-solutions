#!/usr/bin/env node
/*
 * IKONEX payments & contact API — zero dependencies (Node.js 18+).
 *
 * Endpoints
 *   POST /api/mpesa/stkpush        { phone, amount, reference, description, customerName }
 *   POST /api/mpesa/callback       Safaricom Daraja result callback (set as MPESA_CALLBACK_URL)
 *   GET  /api/mpesa/status/:id     → { status: pending|success|failed|cancelled, receipt?, resultDesc? }
 *   POST /api/contact              { name, email, phone, service, message } → saved to data/messages.jsonl
 *   GET  /api/health
 *
 * Configure with environment variables (see server/.env.example), then:
 *   node server/mpesa-server.mjs
 *
 * Your Daraja consumer key/secret and passkey must only ever live here on the
 * server — never in the React app.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- tiny .env loader (server/.env) --------------------------------------
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const cfg = {
  port: Number(process.env.PORT || 5050),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "*",
  env: process.env.MPESA_ENV === "production" ? "production" : "sandbox",
  consumerKey: process.env.MPESA_CONSUMER_KEY || "",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
  shortcode: process.env.MPESA_SHORTCODE || "",
  passkey: process.env.MPESA_PASSKEY || "",
  // CustomerPayBillOnline (Paybill) or CustomerBuyGoodsOnline (Till)
  transactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
  // For Buy Goods, PartyB is the Till number; defaults to the shortcode.
  partyB: process.env.MPESA_PARTY_B || process.env.MPESA_SHORTCODE || "",
  callbackUrl: process.env.MPESA_CALLBACK_URL || "",
};

const DARAJA =
  cfg.env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

const missing = ["consumerKey", "consumerSecret", "shortcode", "passkey", "callbackUrl"].filter(
  (k) => !cfg[k]
);

// ---- helpers --------------------------------------------------------------
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const appendJsonl = (file, obj) =>
  fs.appendFileSync(path.join(dataDir, file), JSON.stringify({ at: new Date().toISOString(), ...obj }) + "\n");

const payments = new Map(); // CheckoutRequestID -> status record

const send = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": cfg.allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });

export const normalisePhone = (input) => {
  const digits = String(input || "").replace(/[\s\-()]/g, "");
  const m = digits.match(/^(?:\+?254|0)?([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
};

const timestamp = () => {
  // Daraja expects Kenyan local time YYYYMMDDHHmmss
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
};

let tokenCache = { token: null, expires: 0 };
const getToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expires) return tokenCache.token;
  const auth = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString("base64");
  const r = await fetch(`${DARAJA}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) throw new Error(`Daraja auth failed (${r.status})`);
  const j = await r.json();
  tokenCache = { token: j.access_token, expires: Date.now() + (Number(j.expires_in) - 60) * 1000 };
  return tokenCache.token;
};

const darajaPost = async (endpoint, body) => {
  const token = await getToken();
  const r = await fetch(`${DARAJA}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.errorMessage || j.ResponseDescription || `Daraja error (${r.status})`);
  return j;
};

const password = (ts) => Buffer.from(`${cfg.shortcode}${cfg.passkey}${ts}`).toString("base64");

// ---- handlers ---------------------------------------------------------------
const stkPush = async (req, res) => {
  if (missing.length) {
    return send(res, 503, { error: `M-Pesa is not configured on the server (missing: ${missing.join(", ")}).` });
  }
  const body = await readBody(req);
  const phone = normalisePhone(body.phone);
  const amount = Number(body.amount);

  if (!phone) return send(res, 400, { error: "Enter a valid Safaricom number, e.g. 0712 345 678." });
  if (!Number.isInteger(amount) || amount < 1 || amount > 250000)
    return send(res, 400, { error: "Amount must be a whole number between 1 and 250,000 KES." });

  const ts = timestamp();
  const reference = String(body.reference || "IKONEX").replace(/[^A-Za-z0-9-]/g, "").slice(0, 12) || "IKONEX";
  const desc = String(body.description || "Payment").replace(/[^A-Za-z0-9 ]/g, "").slice(0, 13) || "Payment";

  const result = await darajaPost("/mpesa/stkpush/v1/processrequest", {
    BusinessShortCode: cfg.shortcode,
    Password: password(ts),
    Timestamp: ts,
    TransactionType: cfg.transactionType,
    Amount: amount,
    PartyA: phone,
    PartyB: cfg.partyB,
    PhoneNumber: phone,
    CallBackURL: cfg.callbackUrl,
    AccountReference: reference,
    TransactionDesc: desc,
  });

  const id = result.CheckoutRequestID;
  payments.set(id, { status: "pending", phone, amount, reference, item: body.description, customerName: body.customerName });
  appendJsonl("payments.jsonl", { event: "stk_sent", id, phone, amount, reference, item: body.description, customerName: body.customerName });

  send(res, 200, { checkoutRequestId: id, customerMessage: result.CustomerMessage });
};

const RESULT_STATUS = (code) =>
  Number(code) === 0 ? "success" : Number(code) === 1032 ? "cancelled" : "failed";

const callback = async (req, res) => {
  const body = await readBody(req);
  const cb = body?.Body?.stkCallback;
  if (cb?.CheckoutRequestID) {
    const items = Object.fromEntries(
      (cb.CallbackMetadata?.Item || []).map((i) => [i.Name, i.Value])
    );
    const record = {
      ...(payments.get(cb.CheckoutRequestID) || {}),
      status: RESULT_STATUS(cb.ResultCode),
      resultDesc: cb.ResultDesc,
      receipt: items.MpesaReceiptNumber,
    };
    payments.set(cb.CheckoutRequestID, record);
    appendJsonl("payments.jsonl", { event: "callback", id: cb.CheckoutRequestID, ...record });
  }
  // Always acknowledge so Safaricom stops retrying
  send(res, 200, { ResultCode: 0, ResultDesc: "Accepted" });
};

const status = async (_req, res, id) => {
  const known = payments.get(id);
  if (known && known.status !== "pending") {
    return send(res, 200, { status: known.status, receipt: known.receipt, resultDesc: known.resultDesc });
  }
  if (missing.length) return send(res, 200, { status: "pending" });

  // Fall back to asking Daraja directly (e.g. if the callback hasn't arrived)
  try {
    const ts = timestamp();
    const q = await darajaPost("/mpesa/stkpushquery/v1/query", {
      BusinessShortCode: cfg.shortcode,
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: id,
    });
    if (q.ResultCode === undefined) return send(res, 200, { status: "pending" });
    const st = RESULT_STATUS(q.ResultCode);
    if (known) payments.set(id, { ...known, status: st, resultDesc: q.ResultDesc });
    return send(res, 200, { status: st, resultDesc: q.ResultDesc });
  } catch {
    // Daraja returns an error while the transaction is still being processed
    return send(res, 200, { status: "pending" });
  }
};

const contact = async (req, res) => {
  const b = await readBody(req);
  const name = String(b.name || "").trim().slice(0, 120);
  const message = String(b.message || "").trim().slice(0, 5000);
  if (!name || !message || (!b.email && !b.phone)) {
    return send(res, 400, { error: "Name, message and an email or phone are required." });
  }
  appendJsonl("messages.jsonl", {
    name,
    email: String(b.email || "").slice(0, 200),
    phone: String(b.phone || "").slice(0, 40),
    service: String(b.service || "").slice(0, 200),
    message,
  });
  send(res, 200, { ok: true });
};

// ---- server -----------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "OPTIONS") return send(res, 204, {});
    if (req.method === "GET" && url.pathname === "/api/health")
      return send(res, 200, { ok: true, mpesa: missing.length ? `not configured (${missing.join(", ")})` : cfg.env });
    if (req.method === "POST" && url.pathname === "/api/mpesa/stkpush") return await stkPush(req, res);
    if (req.method === "POST" && url.pathname === "/api/mpesa/callback") return await callback(req, res);
    const m = url.pathname.match(/^\/api\/mpesa\/status\/([^/]+)$/);
    if (req.method === "GET" && m) return await status(req, res, decodeURIComponent(m[1]));
    if (req.method === "POST" && url.pathname === "/api/contact") return await contact(req, res);
    send(res, 404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: err.message || "Server error" });
  }
});

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  server.listen(cfg.port, () => {
    console.log(`IKONEX API listening on http://localhost:${cfg.port}`);
    console.log(missing.length ? `M-Pesa NOT configured — missing: ${missing.join(", ")}` : `M-Pesa: ${cfg.env}`);
  });
}

export default server;
