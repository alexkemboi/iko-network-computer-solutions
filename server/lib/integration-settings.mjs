/*
 * Integration settings (email, SMS, M-Pesa) managed from the admin portal.
 *
 * Where a value comes from, in order:
 *   1. saved in the portal (database; secrets encrypted with ./secret-box.mjs)
 *   2. the matching server/.env variable (so existing deployments keep working)
 *   3. the built-in default
 *
 * The senders (integrations.mjs, mailer.mjs, mpesa-server.mjs) read the merged
 * values through `integrationSettings.effective(name)` on every use, so a change
 * saved in the portal applies to the next email/SMS/payment without a restart.
 *
 * Secret values only ever exist decrypted in this process's memory. `view()` is
 * the only shape that leaves the server and it reports secrets as saved/not saved.
 */
import path from "node:path";
import { createSecretBox, loadMasterKey } from "./secret-box.mjs";

const PLACEHOLDER = /^(undefined|null|none|xxx+|changeme|your[_-].*|<.*>)$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOST = /^(?=.{1,253}$)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*$/;
const DIGITS = (min, max) => new RegExp(`^\\d{${min},${max}}$`);

// ---------------------------------------------------------------------------
// Field definitions. `env` is the server/.env fallback; `secret` fields are
// encrypted at rest and never returned to the browser.
// ---------------------------------------------------------------------------
const EMAIL_FIELDS = [
  { name: "provider", label: "Provider", type: "select", default: "custom", group: "Server",
    options: [
      { value: "custom", label: "Custom SMTP server" },
      { value: "gmail", label: "Google Workspace / Gmail", preset: { host: "smtp.gmail.com", port: "587", security: "starttls" } },
      { value: "office365", label: "Microsoft 365 / Outlook", preset: { host: "smtp.office365.com", port: "587", security: "starttls" } },
      { value: "zoho", label: "Zoho Mail", preset: { host: "smtp.zoho.com", port: "465", security: "ssl" } },
      { value: "sendgrid", label: "SendGrid", preset: { host: "smtp.sendgrid.net", port: "587", security: "starttls", username: "apikey" } },
    ] },
  { name: "host", label: "SMTP host", type: "host", env: "SMTP_HOST", required: true, group: "Server", placeholder: "smtp.example.com" },
  { name: "port", label: "Port", type: "number", env: "SMTP_PORT", default: "587", min: 1, max: 65535, group: "Server" },
  { name: "security", label: "Encryption", type: "select", env: "SMTP_SECURE", default: "starttls", group: "Server",
    options: [
      { value: "starttls", label: "STARTTLS (usually port 587)" },
      { value: "ssl", label: "SSL/TLS (usually port 465)" },
      { value: "none", label: "None (not recommended)" },
    ] },
  { name: "username", label: "Username", type: "text", env: "SMTP_USER", group: "Sign-in", max: 200, autocomplete: "off" },
  { name: "password", label: "Password / app password", type: "secret", env: "SMTP_PASS", group: "Sign-in" },
  { name: "fromEmail", label: "Sender email", type: "email", env: "MAIL_FROM", required: true, group: "Sender", placeholder: "no-reply@ikonexsystems.com" },
  { name: "fromName", label: "Sender name", type: "text", env: "MAIL_FROM_NAME", default: "IKONEX Systems", group: "Sender", max: 80 },
  { name: "replyTo", label: "Reply-to email", type: "email", env: "MAIL_REPLY_TO", group: "Sender", hint: "Optional. Where replies go if not the sender address." },
  { name: "notifyTo", label: "Send website enquiries to", type: "email", env: "MAIL_NOTIFY_TO", group: "Sender",
    hint: "New contact-form messages are emailed here. Leave empty to use the business email from Settings." },
];

const SMS_FIELDS = [
  { name: "provider", label: "Provider", type: "select", default: "africastalking", group: "Account",
    options: [{ value: "africastalking", label: "Africa's Talking" }] },
  { name: "environment", label: "Environment", type: "select", env: "AT_ENV", default: "production", group: "Account",
    options: [{ value: "production", label: "Live" }, { value: "sandbox", label: "Sandbox (testing, no real SMS)" }] },
  { name: "username", label: "Username", type: "text", env: "AT_USERNAME", required: true, group: "Account", max: 80,
    hint: "Your Africa's Talking app username (\"sandbox\" in the sandbox)." },
  { name: "apiKey", label: "API key", type: "secret", env: "AT_API_KEY", required: true, group: "Account" },
  { name: "senderId", label: "Sender ID", type: "text", env: "AT_SENDER_ID", group: "Sending", max: 11, pattern: "^[A-Za-z0-9 ]{1,11}$",
    hint: "Alphanumeric sender name approved by Africa's Talking (max 11). Leave empty for the shared short code." },
  { name: "apiUrl", label: "API endpoint", type: "url", env: "AT_API_URL", group: "Sending",
    hint: "Leave empty to use the standard endpoint for the selected environment." },
];

const MPESA_FIELDS = [
  { name: "environment", label: "Environment", type: "select", env: "MPESA_ENV", default: "production", group: "Daraja app",
    options: [{ value: "sandbox", label: "Sandbox (testing)" }, { value: "production", label: "Production (real money)" }] },
  { name: "consumerKey", label: "Consumer key", type: "secret", env: "MPESA_CONSUMER_KEY", required: true, group: "Daraja app" },
  { name: "consumerSecret", label: "Consumer secret", type: "secret", env: "MPESA_CONSUMER_SECRET", required: true, group: "Daraja app" },

  { name: "shortcode", label: "Business short code", type: "text", env: "MPESA_SHORTCODE", required: true, pattern: "^\\d{5,7}$", group: "M-Pesa Express (STK push)",
    hint: "Paybill number, or the Store / HO number for a Till." },
  { name: "passkey", label: "Lipa Na M-Pesa passkey", type: "secret", env: "MPESA_PASSKEY", required: true, group: "M-Pesa Express (STK push)" },
  { name: "transactionType", label: "Transaction type", type: "select", env: "MPESA_TRANSACTION_TYPE", default: "CustomerPayBillOnline", group: "M-Pesa Express (STK push)",
    options: [{ value: "CustomerPayBillOnline", label: "Paybill (CustomerPayBillOnline)" }, { value: "CustomerBuyGoodsOnline", label: "Till / Buy Goods (CustomerBuyGoodsOnline)" }] },
  { name: "partyB", label: "Till number", type: "text", env: "MPESA_PARTY_B", pattern: "^\\d{5,8}$", group: "M-Pesa Express (STK push)",
    hint: "Buy Goods only. For a Paybill leave empty — the short code is used." },
  { name: "accountReference", label: "Account reference", type: "text", env: "MPESA_ACCOUNT_REFERENCE", max: 12, group: "M-Pesa Express (STK push)",
    hint: "Optional fixed Paybill account reference (max 12 characters)." },
  { name: "maxAmount", label: "Maximum checkout amount (KES)", type: "number", env: "MPESA_MAX_AMOUNT", default: "250000", min: 1, max: 500000, group: "M-Pesa Express (STK push)" },

  { name: "callbackUrl", label: "Callback URL", type: "url", env: "MPESA_CALLBACK_URL", required: true, https: true, group: "Callbacks",
    placeholder: "https://ikonexsystems.com/api/mpesa/callback",
    hint: "Public HTTPS address of /api/mpesa/callback. The callback secret is appended automatically." },
  { name: "callbackSecret", label: "Callback secret", type: "secret", env: "MPESA_CALLBACK_SECRET", group: "Callbacks",
    hint: "Random string added to callback URLs so only Safaricom can report payments. Changing it affects payments already in progress." },

  { name: "b2cShortcode", label: "B2C short code", type: "text", env: "MPESA_B2C_SHORTCODE", pattern: "^\\d{5,7}$", group: "B2C payouts" },
  { name: "b2cInitiator", label: "Initiator name", type: "text", env: "MPESA_B2C_INITIATOR", max: 80, group: "B2C payouts",
    hint: "API operator username created on the M-Pesa org portal." },
  { name: "b2cSecurityCredential", label: "Security credential", type: "secret", env: "MPESA_B2C_SECURITY_CREDENTIAL", group: "B2C payouts",
    hint: "The initiator password encrypted with Safaricom's public certificate (from the Daraja portal)." },
  { name: "b2cCommandId", label: "Default payment type", type: "select", env: "MPESA_B2C_COMMAND_ID", default: "BusinessPayment", group: "B2C payouts",
    options: [{ value: "BusinessPayment", label: "Business payment" }, { value: "SalaryPayment", label: "Salary payment" }, { value: "PromotionPayment", label: "Promotion payment" }] },
  { name: "b2cResultUrl", label: "Result URL", type: "url", env: "MPESA_B2C_RESULT_URL", https: true, group: "B2C payouts",
    placeholder: "https://ikonexsystems.com/api/mpesa/b2c/result" },
  { name: "b2cTimeoutUrl", label: "Timeout URL", type: "url", env: "MPESA_B2C_TIMEOUT_URL", https: true, group: "B2C payouts",
    hint: "Leave empty to derive it from the result URL (…/timeout)." },
  { name: "b2cMaxAmount", label: "Maximum payout per payee (KES)", type: "number", env: "MPESA_B2C_MAX_AMOUNT", default: "150000", min: 10, max: 250000, group: "B2C payouts" },
  { name: "b2cConsumerKey", label: "B2C consumer key", type: "secret", env: "MPESA_B2C_CONSUMER_KEY", group: "B2C payouts",
    hint: "Only if B2C uses a separate Daraja app. Otherwise the keys above are used." },
  { name: "b2cConsumerSecret", label: "B2C consumer secret", type: "secret", env: "MPESA_B2C_CONSUMER_SECRET", group: "B2C payouts" },
];

export const DEFINITIONS = {
  email: { title: "Email", fields: EMAIL_FIELDS },
  sms: { title: "SMS", fields: SMS_FIELDS },
  mpesa: { title: "M-Pesa", fields: MPESA_FIELDS },
};
export const INTEGRATION_NAMES = Object.keys(DEFINITIONS);

const fieldsOf = (name) => {
  const def = DEFINITIONS[name];
  if (!def) throw Object.assign(new Error("Unknown integration."), { status: 404 });
  return def.fields;
};
const label = (name, field) => fieldsOf(name).find((f) => f.name === field)?.label || field;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
/** Format check for one submitted value (non-empty). Returns an error message or null. */
export function validateField(field, value) {
  const v = String(value);
  if (/[\r\n\0]/.test(v)) return "Must be a single line.";
  if (v.length > (field.max || (field.type === "secret" ? 4000 : 500))) return `Must be at most ${field.max || 500} characters.`;
  switch (field.type) {
    case "number": {
      const n = Number(v);
      if (!/^\d+$/.test(v) || n < (field.min ?? 0) || n > (field.max ?? Infinity)) return `Enter a whole number from ${field.min ?? 0} to ${field.max}.`;
      break;
    }
    case "email":
      if (!EMAIL.test(v)) return "Enter a valid email address.";
      break;
    case "host":
      if (!HOST.test(v)) return "Enter a host name such as smtp.example.com (no http:// or port).";
      break;
    case "url": {
      let u;
      try {
        u = new URL(v);
      } catch {
        return "Enter a full URL, e.g. https://example.com/path.";
      }
      if (field.https && u.protocol !== "https:") return "Must start with https:// (Safaricom only calls HTTPS URLs).";
      if (!["http:", "https:"].includes(u.protocol)) return "Must be an http(s) URL.";
      if (u.username || u.password) return "Don't put credentials in the URL.";
      break;
    }
    case "select":
      if (!field.options.some((o) => o.value === v)) return "Choose one of the listed options.";
      break;
    default:
  }
  if (field.pattern && !new RegExp(field.pattern).test(v)) {
    if (field.name.toLowerCase().includes("shortcode")) return "Short codes are 5–7 digits.";
    if (field.name === "partyB") return "Enter the Till number (digits only).";
    if (field.name === "senderId") return "Letters, numbers and spaces only (max 11).";
    return "Invalid format.";
  }
  return null;
}

/**
 * Whole-configuration checks on merged values.
 * `errors` make the integration unusable (and block saving M-Pesa in production);
 * `warnings` are shown but don't block.
 */
export function checkConfig(name, c) {
  const missing = fieldsOf(name).filter((f) => f.required && !c[f.name]).map((f) => f.label);
  const errors = [];
  const warnings = [];
  const extra = {};
  if (name === "email") {
    if (c.username && !c.password) warnings.push("A username is set but no password.");
    if (c.security === "none") warnings.push("Email is sent without encryption.");
    if (c.security === "ssl" && c.port === "587") warnings.push("Port 587 normally uses STARTTLS, not SSL/TLS.");
    if (c.security === "starttls" && c.port === "465") warnings.push("Port 465 normally uses SSL/TLS, not STARTTLS.");
  }
  if (name === "sms") {
    if (c.environment === "sandbox" && c.username && c.username !== "sandbox") warnings.push('Sandbox accounts use the username "sandbox".');
  }
  if (name === "mpesa") {
    if (c.shortcode && !/^\d{5,7}$/.test(c.shortcode)) errors.push("Business short code should be 5–7 digits.");
    if (c.passkey && c.passkey.length < 30)
      errors.push("The passkey looks too short — the Lipa Na M-Pesa passkey is a long string (usually 64 characters) from Safaricom's go-live email.");
    if (!["CustomerPayBillOnline", "CustomerBuyGoodsOnline"].includes(c.transactionType))
      errors.push("Transaction type must be Paybill (CustomerPayBillOnline) or Till (CustomerBuyGoodsOnline).");
    if (c.transactionType === "CustomerBuyGoodsOnline" && (!c.partyB || c.partyB === c.shortcode))
      warnings.push("Till (Buy Goods): set the Till number, and use the Store / HO number as the business short code.");
    if (c.callbackUrl && !/^https:\/\//.test(c.callbackUrl)) errors.push("Callback URL must start with https:// (Safaricom only calls HTTPS URLs).");
    if (!c.callbackSecret) warnings.push("Set a callback secret so only Safaricom (who knows the secret URL) can report payments.");
    const b2cNeed = {
      b2cShortcode: c.b2cShortcode,
      b2cInitiator: c.b2cInitiator,
      b2cSecurityCredential: c.b2cSecurityCredential,
      b2cResultUrl: c.b2cResultUrl,
      consumerKey: c.b2cConsumerKey || c.consumerKey,
      consumerSecret: c.b2cConsumerSecret || c.consumerSecret,
    };
    extra.b2cMissing = Object.entries(b2cNeed).filter(([, v]) => !v).map(([k]) => label(name, k));
    if (Boolean(c.b2cConsumerKey) !== Boolean(c.b2cConsumerSecret)) errors.push("Set both the B2C consumer key and secret, or neither.");
  }
  return { configured: !missing.length && !errors.length, missing, errors, warnings, ...extra };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
const httpError = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });
const context = (name) => `ikonex:integration:${name}`;
const iso = (v) => (v instanceof Date ? v.toISOString() : v || null);

export function createIntegrationSettings({ env = process.env } = {}) {
  let repo = null;
  let box = null;
  let keySource = null;
  let reloadTimer = null;
  // name -> { values: {non-secret}, secrets: {secret}, meta: {...}, decryptError }
  const state = Object.fromEntries(INTEGRATION_NAMES.map((n) => [n, { values: {}, secrets: {}, meta: {}, decryptError: null }]));

  const envValue = (field) => {
    if (!field.env) return "";
    const v = String(env[field.env] ?? "").trim();
    return v && !PLACEHOLDER.test(v) ? v : "";
  };
  const stored = (name, field) => {
    const s = state[name];
    return (field.type === "secret" ? s.secrets[field.name] : s.values[field.name]) || "";
  };

  /** Merged configuration used by the senders. Includes decrypted secrets — server use only. */
  const effective = (name) =>
    Object.fromEntries(fieldsOf(name).map((f) => [f.name, stored(name, f) || envValue(f) || f.default || ""]));

  const sourceOf = (name, f) => (stored(name, f) ? "portal" : envValue(f) ? "env" : f.default ? "default" : null);

  const applyRow = (row) => {
    const name = row.Integration;
    if (!state[name]) return;
    const s = state[name];
    let values = {};
    try {
      values = JSON.parse(row.ConfigJson || "{}");
    } catch {
      values = {};
    }
    let secrets = {};
    let decryptError = null;
    if (row.SecretsEnc) {
      try {
        secrets = JSON.parse(box.open(row.SecretsEnc, context(name)));
      } catch (err) {
        decryptError = err.message;
        console.warn(`Integration settings: saved ${name} credentials can't be used — ${err.message} Falling back to server/.env.`);
      }
    }
    s.values = values;
    s.secrets = secrets;
    s.decryptError = decryptError;
    s.sealed = row.SecretsEnc || null;
    s.meta = {
      updatedAt: iso(row.UpdatedAt),
      updatedBy: row.UpdatedByName || null,
      lastTestAt: iso(row.LastTestAt),
      lastTestOk: row.LastTestOk === null || row.LastTestOk === undefined ? null : Boolean(Number(row.LastTestOk)),
      lastTestMessage: row.LastTestMessage || null,
      lastSuccessAt: iso(row.LastSuccessAt),
    };
  };

  const reload = async () => {
    if (!repo) return;
    for (const row of await repo.getIntegrationConfigs()) applyRow(row);
  };

  const requireRepo = () => {
    if (!repo || !box) throw httpError(503, "The database isn't connected, so integration settings can't be saved right now.");
  };

  /** Replace secret values in a message (e.g. a provider error) before it is shown or logged. */
  const redact = (name, text) => {
    let out = String(text ?? "");
    const c = effective(name);
    for (const f of fieldsOf(name)) {
      const v = c[f.name];
      if (f.type === "secret" && v && v.length >= 4) out = out.split(v).join("[hidden]");
    }
    return out;
  };

  return {
    /** Connect to the database and load saved settings. */
    async attach(nextRepo, { dataDir, reloadMs = 30000 } = {}) {
      const master = loadMasterKey({ dataDir, env });
      box = createSecretBox(master.key);
      keySource = master.source;
      if (master.created) console.log(`Integration settings: generated an encryption key in ${path.join(dataDir, "settings-key")} (back this file up, or set IKONEX_SETTINGS_KEY).`);
      repo = nextRepo;
      await reload();
      // Pick up changes saved by other API processes
      clearInterval(reloadTimer);
      if (reloadMs) {
        reloadTimer = setInterval(() => reload().catch(() => {}), reloadMs);
        reloadTimer.unref?.();
      }
    },
    detach() {
      clearInterval(reloadTimer);
      repo = null;
    },
    reload,
    effective,
    redact,
    check: (name) => checkConfig(name, effective(name)),

    /** Browser-safe description of one integration: never contains secret values. */
    view(name) {
      const s = state[name];
      const c = effective(name);
      const fields = fieldsOf(name).map(({ env: envName, ...f }) => ({ ...f, envName: envName || null }));
      const values = {};
      const inherited = {};
      const secrets = {};
      const sources = {};
      for (const f of fieldsOf(name)) {
        sources[f.name] = sourceOf(name, f);
        if (f.type === "secret") {
          secrets[f.name] = { saved: Boolean(s.secrets[f.name]), fromEnv: Boolean(envValue(f)) };
        } else {
          values[f.name] = s.values[f.name] || "";
          inherited[f.name] = envValue(f) || f.default || "";
        }
      }
      const status = checkConfig(name, c);
      if (s.decryptError) status.errors = [`Saved credentials can't be decrypted: ${s.decryptError} Re-enter them to fix this.`, ...status.errors];
      return {
        name,
        title: DEFINITIONS[name].title,
        fields,
        values,
        inherited,
        secrets,
        sources,
        status,
        ...s.meta,
        storage: { database: Boolean(repo), keySource },
      };
    },

    /**
     * Save changes. `values` holds the fields being set (empty string = remove the
     * portal value and fall back to server/.env); a secret left empty keeps its saved
     * value; `clear` lists secrets to remove. Returns the changed field names.
     */
    async save(name, { values = {}, clear = [] } = {}, user) {
      requireRepo();
      const fields = fieldsOf(name);
      const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
      const s = state[name];
      const nextValues = { ...s.values };
      const nextSecrets = s.decryptError ? {} : { ...s.secrets };
      const fieldErrors = {};
      const changed = [];

      for (const [key, raw] of Object.entries(values || {})) {
        const f = byName[key];
        if (!f) continue;
        const v = typeof raw === "string" ? raw.trim() : raw === null || raw === undefined ? "" : String(raw);
        if (f.type === "secret") {
          if (!v) continue; // empty = keep the saved secret
          const err = validateField(f, v);
          if (err) fieldErrors[key] = err;
          else if (nextSecrets[key] !== v) {
            nextSecrets[key] = v;
            changed.push(key);
          }
        } else {
          if (v) {
            const err = validateField(f, v);
            if (err) {
              fieldErrors[key] = err;
              continue;
            }
          }
          if ((nextValues[key] || "") !== v) {
            if (v) nextValues[key] = v;
            else delete nextValues[key];
            changed.push(key);
          }
        }
      }
      for (const key of Array.isArray(clear) ? clear : []) {
        if (byName[key]?.type === "secret" && nextSecrets[key]) {
          delete nextSecrets[key];
          changed.push(key);
        }
      }
      if (Object.keys(fieldErrors).length) throw httpError(400, "Some settings need fixing.", { fields: fieldErrors });
      if (!changed.length && !s.decryptError) return { changed: [] };

      // Validate the configuration as it will be after saving
      const merged = Object.fromEntries(fields.map((f) => [f.name, (f.type === "secret" ? nextSecrets[f.name] : nextValues[f.name]) || envValue(f) || f.default || ""]));
      const result = checkConfig(name, merged);
      if (name === "mpesa" && merged.environment === "production" && (result.missing.length || result.errors.length)) {
        const reasons = [...result.missing.map((m) => `${m} is required`), ...result.errors];
        throw httpError(400, `Production M-Pesa needs a complete, valid configuration: ${reasons.join("; ")}.`, { problems: reasons });
      }

      const sealed = Object.keys(nextSecrets).length ? box.seal(JSON.stringify(nextSecrets), context(name)) : null;
      await repo.saveIntegrationConfig({ integration: name, configJson: JSON.stringify(nextValues), secretsEnc: sealed, userId: user?.Id ?? null });
      await repo.addIntegrationAudit({
        integration: name,
        action: "update",
        fields: changed.map((k) => (byName[k].type === "secret" && !nextSecrets[k] ? `${k} (removed)` : byName[k].type === "secret" ? `${k} (replaced)` : k)).join(", "),
        userId: user?.Id ?? null,
        userEmail: user?.Email ?? null,
        detail: null,
      });
      await reload();
      return { changed };
    },

    /** Store the outcome of a connection test (message must already be redacted). */
    async recordTest(name, { ok, message }, user) {
      fieldsOf(name);
      requireRepo();
      const clean = redact(name, message).slice(0, 300);
      await repo.recordIntegrationTest({ integration: name, ok, message: clean });
      await repo.addIntegrationAudit({ integration: name, action: "test", fields: null, userId: user?.Id ?? null, userEmail: user?.Email ?? null, detail: `${ok ? "Passed" : "Failed"}: ${clean}`.slice(0, 300) });
      await reload();
    },

    async auditLog({ integration, limit = 30 } = {}) {
      requireRepo();
      if (integration) fieldsOf(integration);
      return repo.listIntegrationAudit({ integration, limit: Math.min(Math.max(Number(limit) || 30, 1), 200) });
    },
  };
}

/** Shared instance used by the API process. */
export const integrationSettings = createIntegrationSettings();
