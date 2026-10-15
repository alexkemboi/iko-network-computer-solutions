/*
 * End-to-end: the portal's Integrations API drives the real senders.
 * Runs the API in-process on SQLite with Safaricom / Africa's Talking replaced
 * by a fake fetch and SMTP replaced by a fake transport. Nothing leaves the machine.
 *
 * Run with:  npm run test:server
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

// ---- isolated environment (set before the API modules load) -----------------
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ikonex-api-"));
for (const k of Object.keys(process.env)) if (/^(MPESA_|AT_|SMTP_|MAIL_|DB_|PG)/.test(k)) delete process.env[k];
Object.assign(process.env, {
  DB_CLIENT: "sqlite",
  DB_FILE: path.join(dir, "api.db"),
  IKONEX_ENV_FILE: path.join(dir, "missing.env"), // don't read the developer's server/.env
  IKONEX_DATA_DIR: dir,
  IKONEX_API_EMBEDDED: "1",
  IKONEX_SETTINGS_KEY: crypto.randomBytes(32).toString("base64"),
  MPESA_B2C_DELAY_MS: "0",
});

// ---- fake outside world ---------------------------------------------------
const realFetch = globalThis.fetch;
const calls = [];
let atResponse = () => ({ status: 201, body: { SMSMessageData: { Message: "Sent to 1/1 Total Cost: KES 0.8000", Recipients: [{ number: "+254712345678", status: "Success", statusCode: 101, messageId: "ATXid_1", cost: "KES 0.8000" }] } } });
let checkout = 0;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith("http://127.0.0.1")) return realFetch(url, opts);
  calls.push({ url: u, opts });
  let r;
  if (u.includes("/oauth/v1/generate")) r = { body: { access_token: `token-${calls.length}`, expires_in: "3599" } };
  else if (u.includes("/stkpush/v1/processrequest")) {
    checkout += 1;
    r = { body: { MerchantRequestID: `m-${checkout}`, CheckoutRequestID: `ws_CO_TEST_${checkout}`, ResponseCode: "0", CustomerMessage: "Success" } };
  } else if (u.includes("africastalking.com")) r = atResponse(opts);
  else throw new TypeError("fetch failed");
  return new Response(typeof r.body === "string" ? r.body : JSON.stringify(r.body), { status: r.status || 200, headers: { "Content-Type": "application/json" } });
};

const mailer = await import("../lib/mailer.mjs");
const sentMail = [];
let transportOptions = null;
mailer.setTransportFactory((options) => {
  transportOptions = options;
  return {
    verify: async () => true,
    sendMail: async (m) => {
      sentMail.push(m);
      return { messageId: "<test@ikonex>", accepted: [m.to], rejected: [] };
    },
    close() {},
  };
});

const { handleRequest, ready } = await import("../mpesa-server.mjs");
const { b2cConfig, smsConfig } = await import("../lib/integrations.mjs");

// ---- tiny HTTP client --------------------------------------------------------
let base;
const server = http.createServer(handleRequest);
const call = async (method, p, body, cookie) => {
  const r = await realFetch(base + p, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  return { status: r.status, text, body: text ? JSON.parse(text) : {}, cookie: (r.headers.get("set-cookie") || "").split(";")[0] };
};
const lastCall = (part) => [...calls].reverse().find((c) => c.url.includes(part));
const basicUser = (c) => Buffer.from(c.opts.headers.Authorization.replace("Basic ", ""), "base64").toString().split(":")[0];

const SECRETS = {
  consumerKey: "CK-portal-key-111111",
  consumerSecret: "CS-portal-secret-222222",
  passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  callbackSecret: "portal-callback-secret-333",
  apiKey: "atsk_portal_api_key_444444",
  password: "smtp-app-password-555",
  b2cSecurityCredential: "SECURITY-CREDENTIAL-666666",
};

let admin, staff, customer;

describe("Integrations API", () => {
  before(async () => {
    await ready;
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${server.address().port}`;

    admin = (await call("POST", "/api/auth/signup", { fullName: "Ada Admin", email: "ada@example.com", password: "Passw0rd1" })).cookie;
    customer = (await call("POST", "/api/auth/signup", { fullName: "Cara Customer", email: "cara@example.com", password: "Passw0rd1" })).cookie;
    await call("POST", "/api/portal/users", { fullName: "Sam Staff", email: "sam@example.com", role: "staff", password: "Passw0rd1" }, admin);
    staff = (await call("POST", "/api/auth/login", { email: "sam@example.com", password: "Passw0rd1" })).cookie;
    assert.ok(admin && customer && staff);
  });
  after(() => server.close());

  test("only administrators can view or change integration settings", async () => {
    assert.equal((await call("GET", "/api/portal/integrations")).status, 401);
    for (const cookie of [staff, customer]) {
      assert.equal((await call("GET", "/api/portal/integrations", undefined, cookie)).status, 403);
      assert.equal((await call("PUT", "/api/portal/integrations/sms", { values: { username: "x" } }, cookie)).status, 403);
      assert.equal((await call("POST", "/api/portal/integrations/sms/test", { to: "0712345678" }, cookie)).status, 403);
      assert.equal((await call("GET", "/api/portal/integrations/audit", undefined, cookie)).status, 403);
    }
    const r = await call("GET", "/api/portal/integrations", undefined, admin);
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body.integrations), ["email", "sms", "mpesa"]);
  });

  test("M-Pesa settings saved in the portal are used for checkout and callbacks", async () => {
    const save = await call("PUT", "/api/portal/integrations/mpesa", {
      values: {
        environment: "sandbox",
        consumerKey: SECRETS.consumerKey,
        consumerSecret: SECRETS.consumerSecret,
        shortcode: "174379",
        passkey: SECRETS.passkey,
        callbackUrl: "https://shop.example.com/api/mpesa/callback",
        callbackSecret: SECRETS.callbackSecret,
      },
    }, admin);
    assert.equal(save.status, 200, save.text);
    for (const v of Object.values(SECRETS)) assert.ok(!save.text.includes(v), "secret in save response");
    assert.equal(save.body.integration.status.configured, true);

    const push = await call("POST", "/api/mpesa/stkpush", { phone: "0712345678", amount: 10, description: "Test item" });
    assert.equal(push.status, 200, push.text);
    const oauth = lastCall("/oauth/v1/generate");
    assert.ok(oauth.url.startsWith("https://sandbox.safaricom.co.ke/"));
    assert.equal(basicUser(oauth), SECRETS.consumerKey);
    const stk = JSON.parse(lastCall("/stkpush/").opts.body);
    assert.equal(stk.BusinessShortCode, "174379");
    assert.equal(stk.CallBackURL, `https://shop.example.com/api/mpesa/callback/${SECRETS.callbackSecret}`);
    const ts = stk.Timestamp;
    assert.equal(stk.Password, Buffer.from(`174379${SECRETS.passkey}${ts}`).toString("base64"));

    // Callback: wrong secret ignored, the saved secret accepted
    const id = push.body.checkoutRequestId;
    const result = { Body: { stkCallback: { CheckoutRequestID: id, ResultCode: 0, ResultDesc: "ok", CallbackMetadata: { Item: [{ Name: "Amount", Value: 10 }, { Name: "MpesaReceiptNumber", Value: "TEST123" }] } } } };
    await call("POST", "/api/mpesa/callback/wrong-secret", result);
    assert.equal((await call("GET", `/api/mpesa/status/${id}`)).body.status, "pending");
    await call("POST", `/api/mpesa/callback/${SECRETS.callbackSecret}`, result);
    assert.equal((await call("GET", `/api/mpesa/status/${id}`)).body.status, "success");
  });

  test("replacing a credential takes effect on the next payment without a restart", async () => {
    const r = await call("PUT", "/api/portal/integrations/mpesa", { values: { consumerKey: "CK-replaced-777777" } }, admin);
    assert.deepEqual(r.body.changed, ["consumerKey"]);
    const push = await call("POST", "/api/mpesa/stkpush", { phone: "0722000111", amount: 5, description: "Another item" });
    assert.equal(push.status, 200, push.text);
    assert.equal(basicUser(lastCall("/oauth/v1/generate")), "CK-replaced-777777");
  });

  test("production M-Pesa can't be saved with an incomplete configuration", async () => {
    const r = await call("PUT", "/api/portal/integrations/mpesa", { values: { environment: "production", passkey: "too-short-passkey" } }, admin);
    assert.equal(r.status, 400);
    assert.match(r.body.error, /Production M-Pesa/);
    const bad = await call("PUT", "/api/portal/integrations/mpesa", { values: { shortcode: "12" } }, admin);
    assert.equal(bad.status, 400);
  });

  test("Test Connection signs in to Daraja with the saved keys", async () => {
    const r = await call("POST", "/api/portal/integrations/mpesa/test", {}, admin);
    assert.equal(r.body.ok, true, r.text);
    assert.match(r.body.message, /accepted the consumer key/);
    assert.ok(r.body.integration.lastSuccessAt);
  });

  test("SMS uses the saved Africa's Talking account and reports failures without the key", async () => {
    await call("PUT", "/api/portal/integrations/sms", { values: { environment: "sandbox", username: "sandbox", apiKey: SECRETS.apiKey, senderId: "IKONEX" } }, admin);
    assert.equal(smsConfig().apiKey, SECRETS.apiKey);

    const ok = await call("POST", "/api/portal/integrations/sms/test", { to: "0712345678" }, admin);
    assert.equal(ok.body.ok, true, ok.text);
    const sent = lastCall("africastalking.com");
    assert.ok(sent.url.startsWith("https://api.sandbox.africastalking.com/"));
    assert.equal(sent.opts.headers.apiKey, SECRETS.apiKey);
    assert.equal(new URLSearchParams(sent.opts.body).get("from"), "IKONEX");

    atResponse = () => ({ status: 401, body: `The supplied authentication is invalid (key ${SECRETS.apiKey})` });
    const failed = await call("POST", "/api/portal/integrations/sms/test", { to: "0712345678" }, admin);
    assert.equal(failed.body.ok, false);
    assert.ok(!failed.text.includes(SECRETS.apiKey), "API key echoed back to the browser");
    assert.match(failed.body.tip, /API key/);
    assert.equal(failed.body.integration.lastTestOk, false);
    assert.ok(failed.body.integration.lastSuccessAt, "last successful test kept");

    const bad = await call("POST", "/api/portal/integrations/sms/test", { to: "12345" }, admin);
    assert.equal(bad.status, 400);
  });

  test("email settings are used for test emails and enquiry notifications", async () => {
    const save = await call("PUT", "/api/portal/integrations/email", {
      values: { host: "smtp.example.com", port: "465", security: "ssl", username: "mailer@example.com", password: SECRETS.password, fromEmail: "no-reply@example.com", fromName: "IKONEX", notifyTo: "sales@example.com" },
    }, admin);
    assert.equal(save.status, 200, save.text);

    const t = await call("POST", "/api/portal/integrations/email/test", { to: "ada@example.com" }, admin);
    assert.equal(t.body.ok, true, t.text);
    assert.deepEqual([transportOptions.host, transportOptions.port, transportOptions.secure], ["smtp.example.com", 465, true]);
    assert.equal(transportOptions.auth.pass, SECRETS.password);
    assert.equal(sentMail.at(-1).to, "ada@example.com");

    await call("POST", "/api/contact", { name: "Visitor", email: "visitor@example.com", message: "Please call me", service: "Training" });
    await new Promise((r) => setTimeout(r, 100));
    const notice = sentMail.at(-1);
    assert.equal(notice.to, "sales@example.com");
    assert.equal(notice.replyTo, "visitor@example.com");
    assert.match(notice.text, /Please call me/);
  });

  test("B2C payouts read the saved initiator settings", async () => {
    assert.equal((await call("GET", "/api/portal/payouts", undefined, admin)).body.ready, false);
    await call("PUT", "/api/portal/integrations/mpesa", {
      values: { b2cShortcode: "600999", b2cInitiator: "apiop", b2cSecurityCredential: SECRETS.b2cSecurityCredential, b2cResultUrl: "https://shop.example.com/api/mpesa/b2c/result" },
    }, admin);
    const payouts = await call("GET", "/api/portal/payouts", undefined, admin);
    assert.equal(payouts.body.ready, true, payouts.text);
    const c = b2cConfig();
    assert.equal(c.securityCredential, SECRETS.b2cSecurityCredential);
    assert.equal(c.timeoutUrl, `https://shop.example.com/api/mpesa/b2c/timeout/${SECRETS.callbackSecret}`);
  });

  test("no secret appears in any settings response or the audit log", async () => {
    const all = await call("GET", "/api/portal/integrations", undefined, admin);
    const audit = await call("GET", "/api/portal/integrations/audit?limit=200", undefined, admin);
    const settings = await call("GET", "/api/portal/settings", undefined, admin);
    for (const text of [all.text, audit.text, settings.text]) {
      for (const v of Object.values(SECRETS)) assert.ok(!text.includes(v), `secret leaked: ${v.slice(0, 6)}…`);
    }
    const updates = audit.body.audit.filter((e) => e.eventType === "update");
    assert.ok(updates.length >= 4);
    assert.ok(updates.every((e) => e.userEmail === "ada@example.com"));
    assert.ok(updates.some((e) => /passkey \(replaced\)/.test(e.fields)));
    assert.equal(all.body.integrations.mpesa.secrets.passkey.saved, true);
  });
});
