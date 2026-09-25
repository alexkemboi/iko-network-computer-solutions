/*
 * Outbound integrations: Africa's Talking (bulk SMS) and M-Pesa B2C (bulk payments).
 * Configuration comes from server/.env — see server/.env.example.
 */
import crypto from "node:crypto";

const env = (k, d = "") => (process.env[k] ?? d).toString().trim();

// ============================================================================
// Africa's Talking — SMS
// ============================================================================
export const smsConfig = () => {
  const sandbox = env("AT_ENV", "production") === "sandbox";
  return {
    username: env("AT_USERNAME", sandbox ? "sandbox" : ""),
    apiKey: env("AT_API_KEY"),
    senderId: env("AT_SENDER_ID"),
    url:
      env("AT_API_URL") ||
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
  if (!c.username || !c.apiKey) throw Object.assign(new Error("Africa's Talking is not configured (AT_USERNAME / AT_API_KEY)."), { status: 503 });
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
    throw Object.assign(new Error(`Africa's Talking error (${r.status}): ${text.slice(0, 200)}`), { status: 502 });
  }
  return { summary: j.SMSMessageData.Message, recipients: j.SMSMessageData.Recipients || [] };
}

// ============================================================================
// M-Pesa B2C — payouts to customers' phones
// ============================================================================
export const b2cConfig = () => {
  const sandbox = env("MPESA_ENV", "production") === "sandbox";
  const host = sandbox ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
  const resultUrl = env("MPESA_B2C_RESULT_URL");
  const secret = env("MPESA_CALLBACK_SECRET");
  const withSecret = (u) => (u && secret ? `${u.replace(/\/+$/, "")}/${encodeURIComponent(secret)}` : u);
  return {
    oauthUrl: env("MPESA_B2C_OAUTH_URL") || env("MPESA_OAUTH_URL") || `${host}/oauth/v1/generate`,
    url: env("MPESA_B2C_URL") || `${host}/mpesa/b2c/v3/paymentrequest`,
    consumerKey: env("MPESA_B2C_CONSUMER_KEY") || env("MPESA_CONSUMER_KEY"),
    consumerSecret: env("MPESA_B2C_CONSUMER_SECRET") || env("MPESA_CONSUMER_SECRET"),
    shortcode: env("MPESA_B2C_SHORTCODE"),
    initiator: env("MPESA_B2C_INITIATOR"),
    securityCredential: env("MPESA_B2C_SECURITY_CREDENTIAL"),
    commandId: env("MPESA_B2C_COMMAND_ID", "BusinessPayment"),
    resultUrl: withSecret(resultUrl),
    timeoutUrl: withSecret(env("MPESA_B2C_TIMEOUT_URL") || (resultUrl ? resultUrl.replace(/result\/?$/, "timeout") : "")),
    maxAmount: Number(env("MPESA_B2C_MAX_AMOUNT", "150000")),
    secret,
  };
};

export const b2cMissing = () => {
  const c = b2cConfig();
  const need = {
    MPESA_B2C_SHORTCODE: c.shortcode,
    MPESA_B2C_INITIATOR: c.initiator,
    MPESA_B2C_SECURITY_CREDENTIAL: c.securityCredential,
    MPESA_B2C_RESULT_URL: c.resultUrl,
    "MPESA_CONSUMER_KEY (or MPESA_B2C_CONSUMER_KEY)": c.consumerKey,
    "MPESA_CONSUMER_SECRET (or MPESA_B2C_CONSUMER_SECRET)": c.consumerSecret,
  };
  return Object.entries(need)
    .filter(([, v]) => !v)
    .map(([k]) => k);
};

let b2cToken = { token: null, expires: 0, key: "" };
async function getB2cToken() {
  const c = b2cConfig();
  if (b2cToken.token && b2cToken.key === c.consumerKey && Date.now() < b2cToken.expires) return b2cToken.token;
  const auth = Buffer.from(`${c.consumerKey}:${c.consumerSecret}`).toString("base64");
  const r = await fetch(`${c.oauthUrl}?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw Object.assign(new Error("M-Pesa B2C authentication failed — check the B2C consumer key/secret."), { status: 502 });
  b2cToken = { token: j.access_token, expires: Date.now() + (Number(j.expires_in || 3599) - 60) * 1000, key: c.consumerKey };
  return b2cToken.token;
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
