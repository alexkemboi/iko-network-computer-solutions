/*
 * Passwords (scrypt) and sessions (HMAC-signed, HttpOnly cookie). No external deps.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }, (err, key) => {
      if (err) return reject(err);
      resolve(`scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`);
    });
  });

export const verifyPassword = (password, stored) =>
  new Promise((resolve) => {
    try {
      const [scheme, N, r, p, saltB64, keyB64] = String(stored).split("$");
      if (scheme !== "scrypt") return resolve(false);
      const expected = Buffer.from(keyB64, "base64");
      crypto.scrypt(
        password,
        Buffer.from(saltB64, "base64"),
        expected.length,
        { N: Number(N), r: Number(r), p: Number(p) },
        (err, key) => resolve(!err && crypto.timingSafeEqual(key, expected))
      );
    } catch {
      resolve(false);
    }
  });

/** Password rules shown to users on sign-up */
export const passwordProblem = (pw) => {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Use letters and at least one number.";
  return null;
};

// ---- session secret ---------------------------------------------------------
let secret = null;
export const sessionSecret = (dataDir) => {
  if (secret) return secret;
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) {
    secret = process.env.AUTH_SECRET;
    return secret;
  }
  // Generate once and keep it in server/data (git-ignored) so sessions survive restarts
  const file = path.join(dataDir, "session-secret");
  try {
    secret = fs.readFileSync(file, "utf8").trim();
  } catch {
    secret = crypto.randomBytes(48).toString("hex");
    fs.writeFileSync(file, secret, { mode: 0o600 });
  }
  return secret;
};

const b64url = (buf) => Buffer.from(buf).toString("base64url");

export const SESSION_COOKIE = "ikx_session";
export const SESSION_DAYS = 7;

export const signSession = (payload, key) => {
  const body = b64url(JSON.stringify({ ...payload, exp: Date.now() + SESSION_DAYS * 864e5 }));
  const sig = crypto.createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${sig}`;
};

export const readSession = (token, key) => {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", key).update(body).digest("base64url");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
};

export const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf("=");
        return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
      })
  );

export const sessionCookie = (token, { secure }) =>
  `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
    SESSION_DAYS * 86400
  }${secure ? "; Secure" : ""}`;

export const clearCookie = ({ secure }) =>
  `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
