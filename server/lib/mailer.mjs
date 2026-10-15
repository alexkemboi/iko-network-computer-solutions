/*
 * Outbound email over SMTP (nodemailer), configured in the portal
 * (Settings → Integrations → Email) with server/.env fallbacks — see
 * ./integration-settings.mjs. The transport is rebuilt whenever the saved
 * settings change, so no restart is needed.
 */
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { integrationSettings } from "./integration-settings.mjs";

let createTransport = (options) => nodemailer.createTransport(options);
/** Tests swap the SMTP transport for a fake one. */
export const setTransportFactory = (factory) => {
  createTransport = factory || ((options) => nodemailer.createTransport(options));
  cached = { key: null, transport: null };
};

export const emailConfig = () => integrationSettings.effective("email");
export const emailReady = () => integrationSettings.check("email").configured;

const transportOptions = (c) => ({
  host: c.host,
  port: Number(c.port) || 587,
  secure: c.security === "ssl",
  requireTLS: c.security === "starttls",
  ignoreTLS: c.security === "none",
  auth: c.username ? { user: c.username, pass: c.password } : undefined,
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  tls: { minVersion: "TLSv1.2" },
});

let cached = { key: null, transport: null };
const transport = () => {
  const c = emailConfig();
  // Fingerprint of the settings (hashed so credentials aren't kept as a plain cache key)
  const key = crypto.createHash("sha256").update(JSON.stringify(c)).digest("hex");
  if (cached.key !== key) {
    cached.transport?.close?.();
    cached = { key, transport: createTransport(transportOptions(c)) };
  }
  return { c, transport: cached.transport };
};

const fail = (err) => {
  // nodemailer errors can echo the SMTP conversation; keep secrets out of it
  const message = integrationSettings.redact("email", err?.message || String(err));
  return Object.assign(new Error(message), { status: 502, code: err?.code, responseCode: err?.responseCode });
};

/** Send one email. `to` is a string or list of addresses. */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  const status = integrationSettings.check("email");
  if (!status.configured) {
    throw Object.assign(new Error(`Email isn't set up yet (missing: ${[...status.missing, ...status.errors].join(", ")}).`), { status: 503 });
  }
  const { c, transport: t } = transport();
  try {
    const info = await t.sendMail({
      from: c.fromName ? { name: c.fromName, address: c.fromEmail } : c.fromEmail,
      to,
      replyTo: replyTo || c.replyTo || undefined,
      subject,
      text,
      html,
    });
    return { messageId: info.messageId, accepted: info.accepted || [], rejected: info.rejected || [] };
  } catch (err) {
    throw fail(err);
  }
}

/** Check the SMTP connection and sign-in without sending anything. */
export async function verifyEmail() {
  const { transport: t } = transport();
  try {
    await t.verify();
  } catch (err) {
    throw fail(err);
  }
}

/** Plain-language hints for common SMTP failures. */
export const emailTroubleshooting = (err) => {
  const m = `${err?.code || ""} ${err?.responseCode || ""} ${err?.message || ""}`;
  if (/EAUTH|535|534|Invalid login|Username and Password/i.test(m))
    return "The server rejected the username or password. Gmail and Microsoft 365 need an app password (or SMTP AUTH enabled) rather than your normal password.";
  if (/ETIMEDOUT|ECONNREFUSED|ESOCKET|EHOSTUNREACH|timeout/i.test(m))
    return "Couldn't reach the SMTP server. Check the host and port, and that the server's firewall allows outgoing connections on that port.";
  if (/ENOTFOUND|EDNS/i.test(m)) return "The SMTP host name doesn't exist. Check it for typos.";
  if (/wrong version number|ssl|tls|certificate/i.test(m))
    return "Encryption didn't match the port. Use SSL/TLS with port 465, or STARTTLS with port 587.";
  if (/sender|from address|not owned|550|553|554/i.test(m))
    return "The server refused the sender address. Use an address your SMTP account is allowed to send from.";
  return null;
};
