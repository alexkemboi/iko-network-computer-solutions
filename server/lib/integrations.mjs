/*
 * Outbound integrations: Africa's Talking (bulk SMS), M-Pesa Express (STK push)
 * settings and M-Pesa B2C (bulk payments).
 *
 * Settings are managed in the portal (Settings → Integrations) and fall back to
 * server/.env — see ./integration-settings.mjs. Every call reads the current
 * values, so saved changes apply immediately.
 */
import crypto from "node:crypto";
import { integrationSettings } from "./integration-settings.mjs";

const env = (k, d = "") => (process.env[k] ?? d).toString().trim();

// ============================================================================
// M-Pesa (Daraja) — shared by STK push (mpesa-server.mjs) and B2C
// ============================================================================
const DARAJA_HOSTS = { sandbox: "https://sandbox.safaricom.co.ke", production: "https://api.safaricom.co.ke" };

/** Current M-Pesa Express configuration (includes secrets — server use only). */
export const mpesaConfig = () => {
  const s = integrationSettings.effective("mpesa");
  const mode = s.environment === "sandbox" ? "sandbox" : "production";
  const host = DARAJA_HOSTS[mode];
  // Explicit URL overrides in server/.env only apply to the environment they were
  // written for; switching environment in the portal uses Safaricom's standard URLs.
  const envMode = env("MPESA_ENV", "production") === "sandbox" ? "sandbox" : "production";
  const override = (k) => (mode === envMode ? env(k) : "");
  return {
    mode,
    urls: {
      oauth: override("MPESA_OAUTH_URL") || `${host}/oauth/v1/generate`,
      stkPush: override("MPESA_STKPUSH_URL") || `${host}/mpesa/stkpush/v1/processrequest`,
      stkQuery: override("MPESA_STKQUERY_URL") || `${host}/mpesa/stkpushquery/v1/query`,
    },
    consumerKey: s.consumerKey,
    consumerSecret: s.consumerSecret,
    shortcode: s.shortcode,
    passkey: s.passkey,
    // CustomerPayBillOnline (Paybill) or CustomerBuyGoodsOnline (Till)
    transactionType: s.transactionType,
    // Paybill: same as shortcode. Buy Goods: your Till number.
    partyB: s.partyB || s.shortcode,
    callbackUrl: s.callbackUrl,
    callbackSecret: s.callbackSecret,
    accountReference: s.accountReference, // optional fixed account ref (Paybill)
    maxAmount: Number(s.maxAmount) || 250000,
    envOverrides: mode === envMode && Boolean(env("MPESA_OAUTH_URL") || env("MPESA_STKPUSH_URL") || env("MPESA_STKQUERY_URL")),
  };
};

/** Labels of required M-Pesa Express settings that are missing. */
export const mpesaMissing = () => integrationSettings.check("mpesa").missing;

/**
 * Request a Daraja OAuth token. Used for checkout/payouts and by the portal's
 * "Test connection" (which passes `fresh` to skip any cache).
 */
export async function darajaToken({ oauthUrl, consumerKey, consumerSecret }) {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const r = await fetch(`${oauthUrl}?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  const text = await r.text();
  let j = {};
  try {
    j = JSON.parse(text);
  } catch {
    /* Daraja sometimes returns empty/HTML on bad credentials */
  }
  if (!r.ok || !j.access_token) {
    throw Object.assign(new Error(`Daraja rejected the consumer key/secret (HTTP ${r.status}${j.errorMessage ? `: ${j.errorMessage}` : ""}).`), {
      status: 502,
      httpStatus: r.status,
    });
  }
  return { token: j.access_token, expiresIn: Number(j.expires_in || 3599) };
}

// ============================================================================
// Africa's Talking — SMS
// ============================================================================
export const smsConfig = () => {
  const s = integrationSettings.effective("sms");
  const sandbox = s.environment === "sandbox";
  return {
    provider: s.provider,
    username: s.username || (sandbox ? "sandbox" : ""),
    apiKey: s.apiKey,
    senderId: s.senderId,
    url:
      s.apiUrl ||
      (sandbox ? "https://api.sandbox.africastalking.com" : "https://api.africastalking.com") +
        "/version1/messaging",
    sandbox,
  };
};

export const smsReady = () => {
  const c = smsConfig();
  return Boolean(c.username && c.apiKey);
};

/**
 * Send one message to many numbers (≤ 1000 per call).
 * Returns [{ number, status, statusCode, messageId, cost }] and a summary message.
 */
export async function sendSms({ to, message, from }) {
  const c = smsConfig();
  if (!c.username || !c.apiKey)
    throw Object.assign(new Error("SMS isn't set up yet. Add the Africa's Talking username and API key under Settings → Integrations → SMS."), { status: 503 });
  const body = new URLSearchParams({
    username: c.username,
    to: to.map((p) => (p.startsWith("+") ? p : `+${p}`)).join(","),
    message,
    bulkSMSMode: "1",
  });
  const sender = from || c.senderId;
  if (sender) body.set("from", sender);

  const r = await fetch(c.url, {
    method: "POST",
    headers: {
      apiKey: c.apiKey,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const text = await r.text();
  let j = {};
  try {
    j = JSON.parse(text);
  } catch {
    /* AT returns plain text for some errors */
  }
  if (!r.ok || !j.SMSMessageData) {
    throw Object.assign(new Error(integrationSettings.redact("sms", `Africa's Talking error (${r.status}): ${text.slice(0, 200)}`)), {
      status: 502,
      httpStatus: r.status,
    });
  }
  return { summary: j.SMSMessageData.Message, recipients: j.SMSMessageData.Recipients || [] };
}

// ============================================================================
// M-Pesa B2C — payouts to customers' phones
// ============================================================================
export const b2cConfig = () => {
  const s = integrationSettings.effective("mpesa");
  const mpesa = mpesaConfig();
  const host = DARAJA_HOSTS[mpesa.mode];
  const resultUrl = s.b2cResultUrl;
  const secret = s.callbackSecret;
  const withSecret = (u) => (u && secret ? `${u.replace(/\/+$/, "")}/${encodeURIComponent(secret)}` : u);
  const envMode = env("MPESA_ENV", "production") === "sandbox" ? "sandbox" : "production";
  const override = (k) => (mpesa.mode === envMode ? env(k) : "");
  return {
    oauthUrl: override("MPESA_B2C_OAUTH_URL") || override("MPESA_OAUTH_URL") || `${host}/oauth/v1/generate`,
    url: override("MPESA_B2C_URL") || `${host}/mpesa/b2c/v3/paymentrequest`,
    consumerKey: s.b2cConsumerKey || s.consumerKey,
    consumerSecret: s.b2cConsumerSecret || s.consumerSecret,
    shortcode: s.b2cShortcode,
    initiator: s.b2cInitiator,
    securityCredential: s.b2cSecurityCredential,
    commandId: s.b2cCommandId || "BusinessPayment",
    resultUrl: withSecret(resultUrl),
    timeoutUrl: withSecret(s.b2cTimeoutUrl || (resultUrl ? resultUrl.replace(/result\/?$/, "timeout") : "")),
    maxAmount: Number(s.b2cMaxAmount) || 150000,
    secret,
  };
};

/** Labels of B2C settings that are missing. */
export const b2cMissing = () => integrationSettings.check("mpesa").b2cMissing;

// Cached per credential set, so replacing the keys in the portal takes effect at once
const tokenKey = (c) => crypto.createHash("sha256").update(`${c.oauthUrl}|${c.consumerKey}|${c.consumerSecret}`).digest("hex");
let b2cToken = { token: null, expires: 0, key: "" };
async function getB2cToken() {
  const c = b2cConfig();
  const key = tokenKey(c);
  if (b2cToken.token && b2cToken.key === key && Date.now() < b2cToken.expires) return b2cToken.token;
  try {
    const { token, expiresIn } = await darajaToken(c);
    b2cToken = { token, expires: Date.now() + (expiresIn - 60) * 1000, key };
    return token;
  } catch {
    throw Object.assign(new Error("M-Pesa B2C authentication failed — check the B2C consumer key/secret."), { status: 502 });
  }
}

/** Send one B2C payment. Resolves with { originatorConversationId, conversationId } when accepted. */
export async function sendB2c({ phone, amount, remarks, occasion, commandId }) {
  const c = b2cConfig();
  const originatorConversationId = `IKX-${crypto.randomUUID()}`;
  const token = await getB2cToken();
  const r = await fetch(c.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      OriginatorConversationID: originatorConversationId,
      InitiatorName: c.initiator,
      SecurityCredential: c.securityCredential,
      CommandID: commandId || c.commandId,
      Amount: amount,
      PartyA: c.shortcode,
      PartyB: phone,
      Remarks: (remarks || "IKONEX payout").slice(0, 100),
      QueueTimeOutURL: c.timeoutUrl,
      ResultURL: c.resultUrl,
      Occassion: (occasion || "").slice(0, 100),
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || String(j.ResponseCode) !== "0") {
    if (r.status === 401) b2cToken = { token: null, expires: 0, key: "" };
    throw Object.assign(new Error(j.errorMessage || j.ResponseDescription || `B2C request failed (${r.status})`), {
      status: 502,
      daraja: j,
    });
  }
  return {
    originatorConversationId: j.OriginatorConversationID || originatorConversationId,
    conversationId: j.ConversationID,
    description: j.ResponseDescription,
  };
}
