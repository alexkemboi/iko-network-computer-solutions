/*
 * Encryption at rest for integration credentials (AES-256-GCM).
 *
 * The master key never goes into the database. It comes from, in order:
 *   1. IKONEX_SETTINGS_KEY — 32 random bytes as 64 hex chars or base64
 *      (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
 *      Put it in your process manager / secrets store, or server/.env.
 *   2. server/data/settings-key — generated on first use (mode 600, git-ignored),
 *      the same way the session secret is handled.
 *
 * Sealed values look like  v1.<keyId>.<iv>.<tag>.<ciphertext>  (base64url parts).
 * The key id is a fingerprint, so a value sealed with a different key is detected
 * and reported instead of failing with a cryptic error. Each value is bound to a
 * context string (e.g. the integration name) via AES-GCM additional data, so a
 * sealed blob can't be copied onto another row.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const VERSION = "v1";

const parseKey = (raw) => {
  const text = String(raw || "").trim();
  if (/^[0-9a-f]{64}$/i.test(text)) return Buffer.from(text, "hex");
  const b64 = Buffer.from(text, "base64");
  if (b64.length === 32) return b64;
  throw new Error("IKONEX_SETTINGS_KEY must be 32 bytes, given as 64 hex characters or base64.");
};

const fingerprint = (key) => crypto.createHash("sha256").update("ikonex-settings-key:").update(key).digest("hex").slice(0, 12);

/** Load (or create) the master key. `dataDir` is where the generated key file lives. */
export function loadMasterKey({ dataDir, env = process.env } = {}) {
  if (env.IKONEX_SETTINGS_KEY) return { key: parseKey(env.IKONEX_SETTINGS_KEY), source: "environment" };
  if (!dataDir) throw new Error("No IKONEX_SETTINGS_KEY and no data directory for a generated key.");
  const file = path.join(dataDir, "settings-key");
  try {
    return { key: parseKey(fs.readFileSync(file, "utf8")), source: "file" };
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
  fs.mkdirSync(dataDir, { recursive: true });
  const key = crypto.randomBytes(32);
  // "wx" fails if another process created the file first; then use that one
  try {
    fs.writeFileSync(file, key.toString("base64") + "\n", { mode: 0o600, flag: "wx" });
  } catch (err) {
    if (err.code === "EEXIST") return { key: parseKey(fs.readFileSync(file, "utf8")), source: "file" };
    throw err;
  }
  return { key, source: "file", created: true };
}

export function createSecretBox(key) {
  if (!Buffer.isBuffer(key) || key.length !== 32) throw new Error("Secret box key must be 32 bytes.");
  const keyId = fingerprint(key);

  return {
    keyId,
    /** Encrypt a UTF-8 string, bound to `context`. */
    seal(plaintext, context = "") {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
      cipher.setAAD(Buffer.from(String(context)));
      const ct = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
      return [VERSION, keyId, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ct.toString("base64url")].join(".");
    },
    /** Decrypt a sealed string. Throws with `code` = WRONG_KEY | CORRUPT. */
    open(sealed, context = "") {
      const parts = String(sealed || "").split(".");
      if (parts.length !== 5 || parts[0] !== VERSION) throw Object.assign(new Error("Encrypted value is not in a recognised format."), { code: "CORRUPT" });
      const [, id, iv, tag, ct] = parts;
      if (id !== keyId)
        throw Object.assign(new Error("Credentials were encrypted with a different settings key (IKONEX_SETTINGS_KEY changed?)."), { code: "WRONG_KEY" });
      try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
        decipher.setAAD(Buffer.from(String(context)));
        decipher.setAuthTag(Buffer.from(tag, "base64url"));
        return Buffer.concat([decipher.update(Buffer.from(ct, "base64url")), decipher.final()]).toString("utf8");
      } catch {
        throw Object.assign(new Error("Encrypted credentials failed their integrity check."), { code: "CORRUPT" });
      }
    },
  };
}
