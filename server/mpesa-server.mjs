#!/usr/bin/env node
/*
 * IKONEX API — M-Pesa Express (Lipa Na M-Pesa Online / STK push) + contact form.
 * Zero dependencies. Requires Node.js 18+ (built-in fetch).
 *
 * Flow
 *   1. Website  → POST /api/mpesa/stkpush { phone, amount, ... }
 *   2. Server   → Daraja OAuth token → Daraja STK push  → customer's phone shows the PIN prompt
 *   3. Safaricom → POST /api/mpesa/callback/<secret>   (payment result)
 *   4. Website  → GET  /api/mpesa/status/:id  (polls; falls back to Daraja STK Query)
 *
 * Endpoints
 *   POST /api/mpesa/stkpush
 *   POST /api/mpesa/callback[/<MPESA_CALLBACK_SECRET>]
 *   GET  /api/mpesa/status/:checkoutRequestId
 *   POST /api/contact
 *   GET  /api/health
 *
 * Configure in server/.env (see server/.env.example), then:  node server/mpesa-server.mjs
 * Daraja keys and the passkey must ONLY live on the server — never in the React app.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (typeof fetch !== "function") {
  console.error("Node.js 18 or newer is required (built-in fetch). Current:", process.version);
  process.exit(1);
}

// ---- tiny .env loader (server/.env) --------------------------------------
// Later lines win over earlier ones (so a value you add at the bottom of the
// file overrides the template value above it). Real environment variables
// (e.g. set by pm2/systemd) still take priority over the file.
const envFile = process.env.IKONEX_ENV_FILE || path.join(__dirname, ".env");
export const envDuplicates = [];
if (fs.existsSync(envFile)) {
  const fromFile = {};
  const text = fs.readFileSync(envFile, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue;
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^(["'])(.*)\1$/, "$2");
    if (m[1] in fromFile && fromFile[m[1]] !== value) envDuplicates.push(m[1]);
    fromFile[m[1]] = value;
  }
  for (const [k, v] of Object.entries(fromFile)) if (!(k in process.env)) process.env[k] = v;
}

const env = (k, d = "") => (process.env[k] || d).trim();

const PRODUCTION_URLS = {
  oauth: "https://api.safaricom.co.ke/oauth/v1/generate",
  stkPush: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  stkQuery: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
};
const SANDBOX_URLS = {
  oauth: "https://sandbox.safaricom.co.ke/oauth/v1/generate",
  stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  stkQuery: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
};

const mode = env("MPESA_ENV", "production") === "sandbox" ? "sandbox" : "production";
const defaults = mode === "sandbox" ? SANDBOX_URLS : PRODUCTION_URLS;

const cfg = {
  port: Number(env("PORT", "5050")),
  host: env("HOST", "127.0.0.1"),
  allowedOrigin: env("ALLOWED_ORIGIN", "*"),
  trustProxy: env("TRUST_PROXY", "true") === "true",
  mode,
  urls: {
    oauth: env("MPESA_OAUTH_URL", defaults.oauth),
    stkPush: env("MPESA_STKPUSH_URL", defaults.stkPush),
    stkQuery: env("MPESA_STKQUERY_URL", defaults.stkQuery),
  },
  consumerKey: env("MPESA_CONSUMER_KEY"),
  consumerSecret: env("MPESA_CONSUMER_SECRET"),
  shortcode: env("MPESA_SHORTCODE"),
  passkey: env("MPESA_PASSKEY"),
  // CustomerPayBillOnline (Paybill) or CustomerBuyGoodsOnline (Till)
  transactionType: env("MPESA_TRANSACTION_TYPE", "CustomerPayBillOnline"),
  // Paybill: same as shortcode. Buy Goods: your Till number.
  partyB: env("MPESA_PARTY_B") || env("MPESA_SHORTCODE"),
  callbackUrl: env("MPESA_CALLBACK_URL"),
  callbackSecret: env("MPESA_CALLBACK_SECRET"),
  accountReference: env("MPESA_ACCOUNT_REFERENCE"), // optional fixed account ref (Paybill)
  maxAmount: Number(env("MPESA_MAX_AMOUNT", "250000")),
};

const PLACEHOLDER = /^(undefined|null|none|xxx+|changeme|your[_-].*|<.*>)$/i;

const ENV_NAMES = {
  consumerKey: "MPESA_CONSUMER_KEY",
  consumerSecret: "MPESA_CONSUMER_SECRET",
  shortcode: "MPESA_SHORTCODE",
  passkey: "MPESA_PASSKEY",
  callbackUrl: "MPESA_CALLBACK_URL",
  partyB: "MPESA_PARTY_B",
};

// Values that are empty or obviously placeholders count as missing
const missing = ["consumerKey", "consumerSecret", "shortcode", "passkey", "callbackUrl"]
  .filter((k) => !cfg[k] || PLACEHOLDER.test(cfg[k]))
  .map((k) => ENV_NAMES[k]);

// Other configuration problems (reported at startup and on /api/health)
export const configProblems = [];
if (cfg.shortcode && !/^\d{5,7}$/.test(cfg.shortcode))
  configProblems.push("MPESA_SHORTCODE should be 5–7 digits.");
if (cfg.passkey && !PLACEHOLDER.test(cfg.passkey) && cfg.passkey.length < 30)
  configProblems.push("MPESA_PASSKEY looks too short — the Lipa Na M-Pesa passkey is a long string (usually 64 characters) from Safaricom's go-live email.");
if (!["CustomerPayBillOnline", "CustomerBuyGoodsOnline"].includes(cfg.transactionType))
  configProblems.push("MPESA_TRANSACTION_TYPE must be CustomerPayBillOnline or CustomerBuyGoodsOnline.");
if (cfg.transactionType === "CustomerBuyGoodsOnline" && (!env("MPESA_PARTY_B") || env("MPESA_PARTY_B") === cfg.shortcode))
  configProblems.push("Till (Buy Goods): set MPESA_PARTY_B to your Till number and MPESA_SHORTCODE to the Store/HO number.");
if (cfg.callbackUrl && !/^https:\/\//.test(cfg.callbackUrl))
  configProblems.push("MPESA_CALLBACK_URL must start with https:// (Safaricom only calls HTTPS URLs).");
if (envDuplicates.length)
  configProblems.push(`Defined more than once in server/.env (the LAST value is used): ${[...new Set(envDuplicates)].join(", ")}.`);

// ---- storage / logging ------------------------------------------------------
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const appendJsonl = (file, obj) =>
  fs.appendFileSync(
    path.join(dataDir, file),
    JSON.stringify({ at: new Date().toISOString(), ...obj }) + "\n"
  );

const maskPhone = (p) => (p ? `${p.slice(0, 6)}***${p.slice(-3)}` : p);

// CheckoutRequestID -> { status, phone, amount, ..., lastQueryAt }
const payments = new Map();

// Realtime: Server-Sent Events subscribers per CheckoutRequestID
const subscribers = new Map(); // id -> Set<res>

const FINAL = new Set(["success", "failed", "cancelled"]);

const notify = (id) => {
  const subs = subscribers.get(id);
  const record = payments.get(id);
  if (!subs || !record) return;
  const payload = `data: ${JSON.stringify(statusPayload(record))}\n\n`;
  for (const res of subs) {
    res.write(payload);
    if (FINAL.has(record.status)) res.end();
  }
  if (FINAL.has(record.status)) subscribers.delete(id);
};

// ---- helpers ---------------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": cfg.allowedOrigin,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json", ...corsHeaders });
  res.end(status === 204 ? "" : JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });

const clientIp = (req) =>
  (cfg.trustProxy && String(req.headers["x-forwarded-for"] || "").split(",")[0].trim()) ||
  req.socket.remoteAddress ||
  "unknown";

/** 07XXXXXXXX / 01XXXXXXXX / 7XXXXXXXX / +2547XXXXXXXX → 2547XXXXXXXX */
export const normalisePhone = (input) => {
  const digits = String(input || "").replace(/[\s\-()]/g, "");
  const m = digits.match(/^(?:\+?254|0)?([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
};

/** Daraja wants Kenyan local time (EAT, UTC+3) as YYYYMMDDHHmmss */
export const darajaTimestamp = (now = Date.now()) =>
  new Date(now + 3 * 60 * 60 * 1000).toISOString().replace(/[-:T]/g, "").slice(0, 14);

const password = (ts) => Buffer.from(`${cfg.shortcode}${cfg.passkey}${ts}`).toString("base64");

// Simple sliding-window rate limiter (prevents prompt-spamming a phone)
const hits = new Map();
const rateLimited = (key, limit, windowMs) => {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  return false;
};

// ---- Daraja client --------------------------------------------------------
let tokenCache = { token: null, expires: 0 };

const getToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expires) return tokenCache.token;
  const auth = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString("base64");
  const r = await fetch(`${cfg.urls.oauth}?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const text = await r.text();
  let j = {};
  try {
    j = JSON.parse(text);
  } catch {
    /* Daraja sometimes returns empty/HTML on bad credentials */
  }
  if (!r.ok || !j.access_token) {
    console.error("Daraja OAuth failed", r.status, text.slice(0, 300));
    throw Object.assign(new Error("M-Pesa authentication failed. Check the consumer key and secret."), {
      status: 502,
    });
  }
  tokenCache = {
    token: j.access_token,
    expires: Date.now() + Math.max(60, Number(j.expires_in || 3599) - 60) * 1000,
  };
  return tokenCache.token;
};

const darajaPost = async (url, body) => {
  const token = await getToken();
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) tokenCache = { token: null, expires: 0 };
  if (!r.ok || (j.ResponseCode !== undefined && String(j.ResponseCode) !== "0")) {
    const msg = j.errorMessage || j.ResponseDescription || j.CustomerMessage || `M-Pesa error (${r.status})`;
    // Problems with OUR merchant setup (keys, passkey, shortcode, callback)
    // must not be shown to customers as their fault → 502 = "unavailable".
    const merchantSide =
      r.status >= 500 ||
      r.status === 401 ||
      r.status === 404 ||
      /credential|password|passkey|shortcode|short code|merchant|callback|token|initiator|not found/i.test(msg);
    const customerSide = /phone|msisdn|partya|amount/i.test(msg) && !/credential|password/i.test(msg);
    throw Object.assign(new Error(msg), {
      status: customerSide ? 400 : merchantSide ? 502 : 400,
      daraja: j,
      httpStatus: r.status,
    });
  }
  return j;
};

const callbackUrlWithSecret = () => {
  if (!cfg.callbackSecret) return cfg.callbackUrl;
  return `${cfg.callbackUrl.replace(/\/+$/, "")}/${encodeURIComponent(cfg.callbackSecret)}`;
};

const RESULT_STATUS = (code) => {
  const c = Number(code);
  if (c === 0) return "success";
  if (c === 1032) return "cancelled"; // cancelled by user
  if (c === 1037) return "failed"; // DS timeout / phone unreachable
  return "failed";
};

const FRIENDLY_RESULT = {
  1: "The M-Pesa balance was insufficient for this payment.",
  1032: "The payment was cancelled on the phone.",
  1037: "We couldn't reach the phone. Make sure it's on and has network, then try again.",
  2001: "The M-Pesa PIN entered was incorrect.",
};

// ---- handlers ---------------------------------------------------------------
const stkPush = async (req, res) => {
  if (missing.length) {
    return send(res, 503, {
      error: `M-Pesa is not configured on the server (missing: ${missing.join(", ")}).`,
    });
  }

  const body = await readBody(req);
  const phone = normalisePhone(body.phone);
  const amount = Number(body.amount);

  if (!phone) return send(res, 400, { error: "Enter a valid Safaricom number, e.g. 0712 345 678." });
  if (!Number.isInteger(amount) || amount < 1 || amount > cfg.maxAmount) {
    return send(res, 400, {
      error: `Amount must be a whole number between 1 and ${cfg.maxAmount.toLocaleString()} KES.`,
    });
  }

  const ip = clientIp(req);
  if (rateLimited(`phone:${phone}`, 3, 5 * 60 * 1000) || rateLimited(`ip:${ip}`, 10, 10 * 60 * 1000)) {
    return send(res, 429, {
      error: "Too many payment requests. Please wait a few minutes and try again.",
    });
  }

  const ts = darajaTimestamp();
  const reference =
    (cfg.accountReference || String(body.reference || "IKONEX"))
      .replace(/[^A-Za-z0-9-]/g, "")
      .slice(0, 12) || "IKONEX";
  const desc =
    String(body.description || "Payment")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .trim()
      .slice(0, 13) || "Payment";

  const result = await darajaPost(cfg.urls.stkPush, {
    BusinessShortCode: cfg.shortcode,
    Password: password(ts),
    Timestamp: ts,
    TransactionType: cfg.transactionType,
    Amount: amount,
    PartyA: phone,
    PartyB: cfg.partyB,
    PhoneNumber: phone,
    CallBackURL: callbackUrlWithSecret(),
    AccountReference: reference,
    TransactionDesc: desc,
  });

  const id = result.CheckoutRequestID;
  const record = {
    status: "pending",
    phone,
    amount,
    reference,
    item: String(body.description || "").slice(0, 120),
    customerName: String(body.customerName || "").slice(0, 120),
    merchantRequestId: result.MerchantRequestID,
    createdAt: Date.now(),
    lastQueryAt: 0,
  };
  payments.set(id, record);
  appendJsonl("payments.jsonl", { event: "stk_sent", id, ...record });
  console.log(`STK push sent ${id} → ${maskPhone(phone)} KES ${amount} (${record.item})`);

  send(res, 200, { checkoutRequestId: id, customerMessage: result.CustomerMessage });
};

const callback = async (req, res, secret) => {
  // Always ACK Safaricom quickly, even if we ignore the payload.
  if (cfg.callbackSecret && secret !== cfg.callbackSecret) {
    console.warn("Rejected callback with wrong/missing secret from", clientIp(req));
    return send(res, 200, { ResultCode: 0, ResultDesc: "Accepted" });
  }

  const body = await readBody(req).catch(() => ({}));
  const cb = body?.Body?.stkCallback;
  const id = cb?.CheckoutRequestID;

  if (id && payments.has(id)) {
    const items = Object.fromEntries((cb.CallbackMetadata?.Item || []).map((i) => [i.Name, i.Value]));
    const known = payments.get(id);
    const status = RESULT_STATUS(cb.ResultCode);

    // Sanity check: the amount Safaricom reports must match what we requested
    const amountOk = status !== "success" || Number(items.Amount) === Number(known.amount);

    const record = {
      ...known,
      status: amountOk ? status : "failed",
      resultCode: cb.ResultCode,
      resultDesc: amountOk ? cb.ResultDesc : "Amount mismatch",
      receipt: items.MpesaReceiptNumber,
      paidPhone: items.PhoneNumber ? String(items.PhoneNumber) : undefined,
      transactionDate: items.TransactionDate,
    };
    payments.set(id, record);
    notify(id);
    appendJsonl("payments.jsonl", { event: "callback", id, ...record });
    console.log(`Callback ${id}: ${record.status}${record.receipt ? ` receipt ${record.receipt}` : ""}`);
  } else if (id) {
    console.warn("Callback for unknown CheckoutRequestID", id);
    appendJsonl("payments.jsonl", { event: "callback_unknown", id, body: cb });
  }

  send(res, 200, { ResultCode: 0, ResultDesc: "Accepted" });
};

const statusPayload = (r) => ({
  status: r.status,
  receipt: r.receipt,
  resultDesc: FRIENDLY_RESULT[Number(r.resultCode)] || r.resultDesc,
});

const status = async (_req, res, id) => {
  let known = payments.get(id);
  if (!known) {
    // e.g. the API restarted mid-payment: fall back to asking Daraja
    if (!/^ws_CO_[A-Za-z0-9_]{6,60}$/.test(id)) return send(res, 404, { error: "Unknown payment request." });
    known = { status: "pending", createdAt: 0, lastQueryAt: 0, recovered: true };
    payments.set(id, known);
  }
  if (known.status !== "pending") return send(res, 200, statusPayload(known));
  if (missing.length) return send(res, 200, { status: "pending" });

  // Callback not in yet — ask Daraja directly, but not more than every 8s
  // (STK Query is rate-limited) and only after the customer had time to act.
  const now = Date.now();
  if (now - known.createdAt < 10000 || now - known.lastQueryAt < 6000) {
    return send(res, 200, { status: "pending" });
  }
  known.lastQueryAt = now;

  try {
    const ts = darajaTimestamp();
    const q = await darajaPost(cfg.urls.stkQuery, {
      BusinessShortCode: cfg.shortcode,
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: id,
    });
    if (q.ResultCode === undefined) return send(res, 200, { status: "pending" });
    const st = RESULT_STATUS(q.ResultCode);
    const record = { ...known, status: st, resultCode: q.ResultCode, resultDesc: q.ResultDesc };
    payments.set(id, record);
    notify(id);
    appendJsonl("payments.jsonl", { event: "query", id, status: st, resultCode: q.ResultCode });
    return send(res, 200, statusPayload(record));
  } catch {
    // Daraja answers with an error while the transaction is still processing
    return send(res, 200, { status: "pending" });
  }
};

/**
 * Realtime status stream (Server-Sent Events). The browser opens this right
 * after the PIN prompt is sent and is told the result the instant Safaricom's
 * callback arrives. Falls back to polling /status on the client.
 */
const events = (req, res, id) => {
  if (!payments.has(id)) return send(res, 404, { error: "Unknown payment request." });
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // tell nginx not to buffer the stream
    ...corsHeaders,
  });
  res.write("retry: 3000\n\n");

  const record = payments.get(id);
  res.write(`data: ${JSON.stringify(statusPayload(record))}\n\n`);
  if (FINAL.has(record.status)) return res.end();

  if (!subscribers.has(id)) subscribers.set(id, new Set());
  subscribers.get(id).add(res);

  const heartbeat = setInterval(() => res.write(": ping\n\n"), 15000);
  const giveUp = setTimeout(() => res.end(), 3 * 60 * 1000);
  req.on("close", () => {
    clearInterval(heartbeat);
    clearTimeout(giveUp);
    const subs = subscribers.get(id);
    if (subs) {
      subs.delete(res);
      if (!subs.size) subscribers.delete(id);
    }
  });
};

const contact = async (req, res) => {
  const b = await readBody(req);
  const name = String(b.name || "").trim().slice(0, 120);
  const message = String(b.message || "").trim().slice(0, 5000);
  if (!name || !message || (!b.email && !b.phone)) {
    return send(res, 400, { error: "Name, message and an email or phone are required." });
  }
  if (rateLimited(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return send(res, 429, { error: "Too many messages. Please try again later." });
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

// Forget finished payments after a day to keep memory bounded
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, r] of payments) if (r.createdAt < cutoff) payments.delete(id);
}, 60 * 60 * 1000).unref();

// ---- server -----------------------------------------------------------------
export const handleRequest = async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname.replace(/\/+$/, "");
  try {
    if (req.method === "OPTIONS") return send(res, 204, {});

    if (req.method === "GET" && p === "/api/health") {
      return send(res, 200, {
        ok: true,
        mpesa: missing.length ? `not configured (missing: ${missing.join(", ")})` : cfg.mode,
        problems: configProblems,
      });
    }

    if (req.method === "POST" && p === "/api/mpesa/stkpush") return await stkPush(req, res);

    const cbMatch = p.match(/^\/api\/mpesa\/callback(?:\/([^/]+))?$/);
    if (req.method === "POST" && cbMatch) {
      return await callback(req, res, cbMatch[1] ? decodeURIComponent(cbMatch[1]) : "");
    }

    const ev = p.match(/^\/api\/mpesa\/events\/([^/]+)$/);
    if (req.method === "GET" && ev) return events(req, res, decodeURIComponent(ev[1]));

    const st = p.match(/^\/api\/mpesa\/status\/([^/]+)$/);
    if (req.method === "GET" && st) return await status(req, res, decodeURIComponent(st[1]));

    if (req.method === "POST" && p === "/api/contact") return await contact(req, res);

    send(res, 404, { error: "Not found" });
  } catch (err) {
    console.error(err.message, err.daraja ? JSON.stringify(err.daraja) : "");
    send(res, err.status && err.status < 600 ? err.status : 500, {
      error: err.message || "Server error",
    });
  }
};

const server = http.createServer(handleRequest);

/** Human-readable readiness, used by the dev server on startup */
export const mpesaReadiness = () =>
  (missing.length
    ? `NOT configured — missing or placeholder in server/.env: ${missing.join(", ")}`
    : `${cfg.mode} ready (shortcode ${cfg.shortcode}, ${cfg.transactionType})`) +
  (configProblems.length ? `\n  ⚠ ${configProblems.join("\n  ⚠ ")}` : "");

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  if (!cfg.callbackSecret && !missing.length) {
    console.warn(
      "Tip: set MPESA_CALLBACK_SECRET so only Safaricom (who knows the secret URL) can report payments."
    );
  }
  server.listen(cfg.port, cfg.host, () => {
    console.log(`IKONEX API listening on http://${cfg.host}:${cfg.port}`);
    console.log(`M-Pesa Express: ${mpesaReadiness()}`);
  });
}

export { cfg, server, missing, getToken, darajaPost, password };
export default server;
