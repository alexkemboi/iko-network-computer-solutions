/*
 * Unit tests: credential encryption and the integration settings store.
 * Run with:  npm run test:server
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { createSecretBox, loadMasterKey } from "../lib/secret-box.mjs";
import { createIntegrationSettings, validateField, checkConfig, DEFINITIONS } from "../lib/integration-settings.mjs";
import { connectDb } from "../lib/db.mjs";
import { ensureSchema } from "../lib/schema.mjs";
import { makeRepo } from "../lib/repo.mjs";

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "ikonex-settings-"));
const randomKey = () => crypto.randomBytes(32).toString("base64");

const MPESA_SANDBOX = {
  environment: "sandbox",
  consumerKey: "CK-sandbox-1234567890",
  consumerSecret: "CS-sandbox-abcdefghij",
  shortcode: "174379",
  passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  callbackUrl: "https://example.com/api/mpesa/callback",
  callbackSecret: "cb-secret-xyz-987",
};

async function makeStore({ env = {}, key = randomKey(), file } = {}) {
  const dbFile = file || path.join(tmpDir(), "test.db");
  process.env.DB_FILE = dbFile;
  const db = await connectDb("sqlite");
  await ensureSchema(db);
  const repo = makeRepo(db);
  const admin = await repo.createUser({ fullName: "Ada Admin", email: "ada@example.com", phone: null, role: "admin", passwordHash: "x" });
  const store = createIntegrationSettings({ env: { IKONEX_SETTINGS_KEY: key, ...env } });
  await store.attach(repo, { dataDir: tmpDir(), reloadMs: 0 });
  return { store, repo, db, dbFile, admin, key };
}

describe("secret box", () => {
  test("round-trips and binds the value to its context", () => {
    const box = createSecretBox(crypto.randomBytes(32));
    const sealed = box.seal("s3cr3t-value", "ikonex:integration:sms");
    assert.ok(!sealed.includes("s3cr3t-value"));
    assert.equal(box.open(sealed, "ikonex:integration:sms"), "s3cr3t-value");
    assert.throws(() => box.open(sealed, "ikonex:integration:mpesa"), { code: "CORRUPT" });
  });

  test("detects tampering and a different key", () => {
    const box = createSecretBox(crypto.randomBytes(32));
    const sealed = box.seal("hello", "ctx");
    const parts = sealed.split(".");
    parts[4] = Buffer.from("tampered").toString("base64url");
    assert.throws(() => box.open(parts.join("."), "ctx"), { code: "CORRUPT" });
    assert.throws(() => createSecretBox(crypto.randomBytes(32)).open(sealed, "ctx"), { code: "WRONG_KEY" });
  });

  test("uses IKONEX_SETTINGS_KEY, otherwise generates a key file outside the database", () => {
    const hex = crypto.randomBytes(32).toString("hex");
    assert.equal(loadMasterKey({ env: { IKONEX_SETTINGS_KEY: hex } }).key.toString("hex"), hex);
    assert.throws(() => loadMasterKey({ env: { IKONEX_SETTINGS_KEY: "too-short" } }), /32 bytes/);

    const dir = tmpDir();
    const first = loadMasterKey({ dataDir: dir, env: {} });
    assert.equal(first.created, true);
    assert.ok(fs.existsSync(path.join(dir, "settings-key")));
    assert.deepEqual(loadMasterKey({ dataDir: dir, env: {} }).key, first.key);
  });
});

describe("validation", () => {
  const field = (integration, name) => DEFINITIONS[integration].fields.find((f) => f.name === name);

  test("checks formats", () => {
    assert.equal(validateField(field("email", "host"), "smtp.gmail.com"), null);
    assert.match(validateField(field("email", "host"), "https://smtp.gmail.com"), /host name/);
    assert.match(validateField(field("email", "port"), "70000"), /whole number/);
    assert.match(validateField(field("email", "fromEmail"), "not-an-email"), /valid email/);
    assert.match(validateField(field("mpesa", "callbackUrl"), "http://example.com/cb"), /https/);
    assert.match(validateField(field("mpesa", "shortcode"), "12ab"), /5–7 digits/);
    assert.match(validateField(field("sms", "senderId"), "WAY-TOO-LONG-ID"), /at most 11/);
    assert.match(validateField(field("mpesa", "environment"), "staging"), /listed options/);
    assert.match(validateField(field("email", "username"), "a\r\nb"), /single line/);
  });

  test("reports missing settings and blocking errors", () => {
    const r = checkConfig("mpesa", { environment: "production", transactionType: "CustomerPayBillOnline", passkey: "short" });
    assert.ok(r.missing.includes("Consumer key"));
    assert.ok(r.errors.some((e) => /passkey/i.test(e)));
    assert.equal(r.configured, false);
  });
});

describe("integration settings store", () => {
  let ctx;
  before(async () => {
    ctx = await makeStore({ env: { SMTP_HOST: "smtp.from-env.example", SMTP_PASS: "env-password" } });
  });

  test("falls back to server/.env values until something is saved in the portal", () => {
    assert.equal(ctx.store.effective("email").host, "smtp.from-env.example");
    assert.equal(ctx.store.effective("email").port, "587"); // built-in default
    const view = ctx.store.view("email");
    assert.equal(view.sources.host, "env");
    assert.equal(view.secrets.password.fromEnv, true);
    assert.equal(view.secrets.password.saved, false);
  });

  test("saves, encrypts secrets at rest and never exposes them in the view", async () => {
    const { changed } = await ctx.store.save("mpesa", { values: MPESA_SANDBOX }, ctx.admin);
    assert.ok(changed.includes("passkey"));
    assert.equal(ctx.store.effective("mpesa").passkey, MPESA_SANDBOX.passkey);

    const raw = new DatabaseSync(ctx.dbFile).prepare("SELECT ConfigJson, SecretsEnc FROM IntegrationConfigs WHERE Integration='mpesa'").get();
    for (const secret of [MPESA_SANDBOX.consumerKey, MPESA_SANDBOX.consumerSecret, MPESA_SANDBOX.passkey, MPESA_SANDBOX.callbackSecret]) {
      assert.ok(!raw.SecretsEnc.includes(secret), "secret stored in plain text");
      assert.ok(!raw.ConfigJson.includes(secret), "secret stored in the config JSON");
    }
    assert.match(raw.ConfigJson, /174379/); // non-secret values stay readable

    const json = JSON.stringify(ctx.store.view("mpesa"));
    for (const secret of [MPESA_SANDBOX.consumerKey, MPESA_SANDBOX.consumerSecret, MPESA_SANDBOX.passkey, MPESA_SANDBOX.callbackSecret]) {
      assert.ok(!json.includes(secret), "secret leaked in view");
    }
    assert.equal(ctx.store.view("mpesa").secrets.passkey.saved, true);
  });

  test("keeps a saved secret when left empty, replaces it when typed, removes it when cleared", async () => {
    await ctx.store.save("mpesa", { values: { passkey: "", shortcode: "600000" } }, ctx.admin);
    assert.equal(ctx.store.effective("mpesa").passkey, MPESA_SANDBOX.passkey);

    const newPasskey = "x".repeat(64);
    await ctx.store.save("mpesa", { values: { passkey: newPasskey } }, ctx.admin);
    assert.equal(ctx.store.effective("mpesa").passkey, newPasskey);

    await ctx.store.save("mpesa", { clear: ["callbackSecret"] }, ctx.admin);
    assert.equal(ctx.store.effective("mpesa").callbackSecret, "");
    assert.equal(ctx.store.view("mpesa").secrets.callbackSecret.saved, false);
  });

  test("an empty non-secret value falls back to server/.env again", async () => {
    await ctx.store.save("email", { values: { host: "smtp.portal.example" } }, ctx.admin);
    assert.equal(ctx.store.effective("email").host, "smtp.portal.example");
    await ctx.store.save("email", { values: { host: "" } }, ctx.admin);
    assert.equal(ctx.store.effective("email").host, "smtp.from-env.example");
  });

  test("rejects invalid values and incomplete production M-Pesa settings", async () => {
    await assert.rejects(ctx.store.save("email", { values: { port: "99999" } }, ctx.admin), (err) => err.status === 400 && /whole number/.test(err.fields.port));
    await assert.rejects(
      ctx.store.save("mpesa", { values: { environment: "production", passkey: "short-passkey" } }, ctx.admin),
      (err) => err.status === 400 && /Production M-Pesa/.test(err.message)
    );
    assert.equal(ctx.store.effective("mpesa").environment, "sandbox"); // nothing was saved
  });

  test("audit log names the admin and the settings, never the values", async () => {
    await ctx.store.save("sms", { values: { username: "ikonex", apiKey: "atsk_supersecret_123" } }, ctx.admin);
    await ctx.store.recordTest("sms", { ok: false, message: "Provider said: bad key atsk_supersecret_123" }, ctx.admin);
    const log = await ctx.store.auditLog({ integration: "sms" });
    const update = log.find((e) => e.eventType === "update");
    assert.equal(update.userEmail, "ada@example.com");
    assert.match(update.fields, /apiKey \(replaced\)/);
    assert.ok(!JSON.stringify(log).includes("atsk_supersecret_123"), "secret value in the audit log");
    assert.match(log.find((e) => e.eventType === "test").detail, /\[hidden\]/);
    assert.equal(ctx.store.view("sms").lastTestOk, false);
  });

  test("records the last successful test", async () => {
    await ctx.store.recordTest("sms", { ok: true, message: "ok" }, ctx.admin);
    const v = ctx.store.view("sms");
    assert.equal(v.lastTestOk, true);
    assert.ok(v.lastSuccessAt);
  });

  test("credentials sealed with another key are reported and fall back to server/.env", async () => {
    const other = createIntegrationSettings({ env: { IKONEX_SETTINGS_KEY: randomKey(), AT_API_KEY: "env-at-key" } });
    await other.attach(ctx.repo, { dataDir: tmpDir(), reloadMs: 0 });
    assert.equal(other.effective("sms").apiKey, "env-at-key");
    assert.ok(other.view("sms").status.errors.some((e) => /different settings key/.test(e)));
  });
});
