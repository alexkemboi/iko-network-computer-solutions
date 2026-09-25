/*
 * IKONEX portal API: accounts, dashboard data, orders & payments records,
 * catalogue (products/services), users, settings, bulk SMS and bulk payments.
 *
 * Mounted by mpesa-server.mjs. Everything here needs the database; when it isn't
 * connected the routes answer 503 with the reason and the public site keeps working.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDb, dbConfigured } from "./db.mjs";
import { ensureSchema } from "./schema.mjs";
import { makeRepo } from "./repo.mjs";
import {
  hashPassword,
  verifyPassword,
  passwordProblem,
  sessionSecret,
  signSession,
  readSession,
  parseCookies,
  sessionCookie,
  clearCookie,
  SESSION_COOKIE,
} from "./auth.mjs";
import { smsConfig, smsReady, sendSms, b2cConfig, b2cMissing, sendB2c } from "./integrations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedItems = JSON.parse(fs.readFileSync(path.join(__dirname, "catalog-seed.json"), "utf8"));

const ROLES = ["admin", "staff", "customer"];
const PERMS = {
  viewAll: ["admin", "staff"], // see everyone's orders/payments
  manageOrders: ["admin", "staff"],
  manageCatalog: ["admin", "staff"],
  deleteCatalog: ["admin"],
  sendSms: ["admin", "staff"],
  payouts: ["admin"],
  users: ["admin"],
  settings: ["admin"],
  messages: ["admin", "staff"],
};
const can = (user, perm) => Boolean(user && PERMS[perm].includes(user.Role || user.role));

const EDITABLE_SETTINGS = [
  "business_name",
  "business_email",
  "business_phone",
  "business_address",
  "sms_default_sender",
  "sms_signature",
  "payouts_require_second_approver",
];

const publicUser = (u) =>
  u && {
    id: u.Id,
    fullName: u.FullName,
    email: u.Email,
    phone: u.Phone,
    role: u.Role,
    isActive: Boolean(u.IsActive),
    createdAt: u.CreatedAt instanceof Date ? u.CreatedAt.toISOString() : u.CreatedAt,
    lastLoginAt: u.LastLoginAt instanceof Date ? u.LastLoginAt.toISOString() : u.LastLoginAt,
  };

const httpError = (status, message) => Object.assign(new Error(message), { status });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createPortal({ dataDir, send, readBody, clientIp, rateLimited, normalisePhone, appendJsonl, corsHeaders }) {
  let db = null;
  let repo = null;
  let dbError = dbConfigured() ? "connecting…" : "Database not configured (set DB_SERVER, DB_USER, DB_PASSWORD in server/.env).";

  // ---------------------------------------------------------------- startup
  const init = async () => {
    if (!dbConfigured() || process.env.IKONEX_NO_DB_INIT) return;
    try {
      db = await connectDb();
      await ensureSchema(db);
      repo = makeRepo(db);
      const seeded = await repo.seedCatalog(seedItems);
      dbError = null;
      console.log(`Database connected: ${db.describe}${seeded ? ` (seeded ${seeded} products/services)` : ""}`);
    } catch (err) {
      dbError = `Database connection failed: ${err.message}`;
      db = null;
      repo = null;
      console.error(dbError);
    }
  };
  const ready = init();

  const status = () => ({ connected: Boolean(repo), error: dbError, describe: db?.describe });

  // ---------------------------------------------------------------- helpers
  const json = (res, code, body, headers = {}) => {
    res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store", ...corsHeaders, ...headers });
    res.end(JSON.stringify(body));
  };
  const isSecure = (req) =>
    process.env.COOKIE_SECURE === "true" || String(req.headers["x-forwarded-proto"] || "").includes("https");

  const currentUser = async (req) => {
    if (!repo) return null;
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    const s = readSession(token, sessionSecret(dataDir));
    if (!s) return null;
    const u = await repo.findUserById(s.uid);
    return u && u.IsActive ? u : null;
  };

  const requireJson = (req) => {
    // Blocks cross-site form posts (CSRF): browsers can't send JSON cross-site without CORS approval
    if (!String(req.headers["content-type"] || "").includes("application/json"))
      throw httpError(415, "Send JSON (Content-Type: application/json).");
  };

  const pageParams = (url) => ({
    page: url.searchParams.get("page"),
    pageSize: url.searchParams.get("pageSize"),
    search: (url.searchParams.get("q") || "").trim().slice(0, 80) || undefined,
    status: url.searchParams.get("status") || undefined,
  });

  const settingsWithDefaults = async () => ({
    business_name: "IKONEX Systems",
    business_email: "info@ikonexsystems.com",
    business_phone: "+254 787 088 567",
    business_address: "Nairobi, Kenya",
    sms_default_sender: smsConfig().senderId || "",
    sms_signature: "",
    payouts_require_second_approver: "false",
    ...(await repo.getSettings()),
  });

  // ======================================================= checkout hooks
  // Called by the STK push flow in mpesa-server.mjs (all best-effort).
  const hooks = {
    /** Enforce the catalogue price when the item has one; returns the amount to charge */
    async priceFor(itemName, requested) {
      if (!repo || !itemName) return requested;
      try {
        const items = await repo.listCatalog({ search: itemName, activeOnly: true });
        const match = items.find((i) => i.name.toLowerCase() === String(itemName).toLowerCase());
        return match && match.price ? Math.round(match.price) : requested;
      } catch {
        return requested;
      }
    },
    async orderStarted(req, { phone, amount, body }) {
      if (!repo) return null;
      try {
        const user = await currentUser(req);
        const order = await repo.createOrder({
          userId: user?.Id,
          customerName: String(body.customerName || user?.FullName || "Customer").slice(0, 120),
          phone,
          itemName: String(body.description || "Order").slice(0, 160),
          section: body.section ? String(body.section).slice(0, 80) : null,
          category: body.category ? String(body.category).slice(0, 80) : null,
          amount,
          notes: body.notes ? String(body.notes).slice(0, 1000) : null,
        });
        return order;
      } catch (e) {
        console.error("Could not record order:", e.message);
        return null;
      }
    },
    async paymentRequested(order, { checkoutRequestId, merchantRequestId, phone, amount }) {
      if (!repo) return;
      try {
        await repo.createPayment({ orderId: order?.id, checkoutRequestId, merchantRequestId, phone, amount });
      } catch (e) {
        console.error("Could not record payment:", e.message);
      }
    },
    async paymentRejected(order, message) {
      if (!repo || !order) return;
      try {
        await repo.setOrderStatus(order.id, "failed", `Payment request rejected: ${message}`.slice(0, 1000));
      } catch {
        /* ignore */
      }
    },
    async paymentSettled(checkoutRequestId, result) {
      if (!repo) return;
      try {
        await repo.settlePayment(checkoutRequestId, result);
      } catch (e) {
        console.error("Could not update payment:", e.message);
      }
    },
    async contact(message) {
      if (!repo) return false;
      try {
        await repo.createContact(message);
        return true;
      } catch {
        return false;
      }
    },
  };

  // =========================================================== bulk SMS
  // Split pasted recipient lists on new lines / commas / semicolons. A chunk that
  // isn't a phone number as a whole (e.g. "0712 345 678 0722 111 222") is split on spaces too.
  const splitRecipients = (text) =>
    String(text || "")
      .split(/[\n\r,;]+/)
      .flatMap((chunk) => (normalisePhone(chunk) || !chunk.trim() ? [chunk] : chunk.trim().split(/\s+/)));

  const normaliseMany = (list) => {
    const good = new Set();
    const bad = [];
    for (const raw of list) {
      const p = normalisePhone(raw);
      if (p) good.add(p);
      else if (String(raw).trim()) bad.push(String(raw).trim());
    }
    return { phones: [...good], invalid: bad };
  };

  const deliverCampaign = async (campaignId, message, senderId) => {
    const queued = await repo.queuedSms(campaignId);
    const costs = [];
    for (let i = 0; i < queued.length; i += 500) {
      const chunk = queued.slice(i, i + 500);
      try {
        const { summary, recipients } = await sendSms({ to: chunk.map((m) => m.phone), message, from: senderId });
        costs.push(summary);
        const byNumber = new Map(recipients.map((r) => [String(r.number).replace(/^\+/, ""), r]));
        for (const m of chunk) {
          const r = byNumber.get(m.phone);
          const ok = r && [100, 101, 102].includes(Number(r.statusCode));
          await repo.updateSms(m.id, {
            status: r ? (ok ? "Sent" : r.status || "Failed") : "Failed",
            providerMessageId: r?.messageId && r.messageId !== "None" ? r.messageId : null,
            cost: r?.cost,
            error: ok ? null : r ? r.status : "No response for this number",
          });
        }
      } catch (e) {
        for (const m of chunk) await repo.updateSms(m.id, { status: "failed", error: e.message.slice(0, 300) });
      }
    }
    await repo.setCampaignCost(campaignId, costs.map((c) => c.replace(/^.*Total Cost:\s*/i, "")).join(" + ").slice(0, 40) || null);
    await repo.refreshCampaign(campaignId, "sent");
    appendJsonl("sms.jsonl", { event: "campaign_sent", campaignId, recipients: queued.length });
  };

  // ========================================================= bulk payments
  const processBatch = async (batchId) => {
    const batch = await repo.getBatch(batchId);
    for (const item of batch.items.filter((i) => i.status === "pending")) {
      try {
        const r = await sendB2c({
          phone: item.phone,
          amount: Math.round(item.amount),
          remarks: batch.title,
          commandId: batch.commandId,
        });
        await repo.updatePayout(item.id, { status: "sent", originatorConversationId: r.originatorConversationId, conversationId: r.conversationId, resultDesc: r.description });
      } catch (e) {
        await repo.updatePayout(item.id, { status: "failed", resultDesc: e.message.slice(0, 300) });
      }
      await sleep(Number(process.env.MPESA_B2C_DELAY_MS || 400)); // stay under Daraja's rate limits
    }
    await repo.refreshBatch(batchId);
    appendJsonl("payouts.jsonl", { event: "batch_processed", batchId });
  };

  const parsePayoutItems = (items) => {
    const max = b2cConfig().maxAmount;
    const out = [];
    const errors = [];
    (Array.isArray(items) ? items : []).forEach((it, idx) => {
      const phone = normalisePhone(it.phone);
      const amount = Number(it.amount);
      const line = idx + 1;
      if (!phone) errors.push(`Row ${line}: "${it.phone}" is not a valid Safaricom number.`);
      else if (!Number.isInteger(amount) || amount < 10 || amount > max)
        errors.push(`Row ${line}: amount must be a whole number between 10 and ${max.toLocaleString()} KES.`);
      else out.push({ phone, amount, name: String(it.name || "").slice(0, 120) || null });
    });
    return { items: out, errors };
  };

  // ============================================================== routes
  const routes = [];
  const route = (method, pattern, handler, { auth = true, perm = null } = {}) => {
    const keys = [];
    const re = new RegExp(
      "^" + pattern.replace(/:([a-z]+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "/?$"
    );
    routes.push({ method, re, keys, handler, auth, perm });
  };

  // ---- auth -------------------------------------------------------------
  route(
    "POST",
    "/api/auth/signup",
    async ({ req, res }) => {
      requireJson(req);
      if (rateLimited(`signup:${clientIp(req)}`, 5, 60 * 60 * 1000)) throw httpError(429, "Too many sign-ups from this network. Try again later.");
      const b = await readBody(req);
      const fullName = String(b.fullName || "").trim().slice(0, 120);
      const email = String(b.email || "").trim().toLowerCase();
      const phoneRaw = String(b.phone || "").trim();
      const phone = phoneRaw ? normalisePhone(phoneRaw) : null;
      if (!fullName) throw httpError(400, "Please enter your full name.");
      if (!EMAIL_RE.test(email)) throw httpError(400, "Please enter a valid email address.");
      if (phoneRaw && !phone) throw httpError(400, "Enter a valid Safaricom number, e.g. 0712 345 678.");
      const pwErr = passwordProblem(b.password);
      if (pwErr) throw httpError(400, pwErr);
      if (await repo.findUserByEmail(email)) throw httpError(409, "An account with this email already exists. Log in instead.");
      const first = (await repo.countUsers()) === 0;
      const user = await repo.createUser({
        fullName,
        email,
        phone,
        passwordHash: await hashPassword(b.password),
        role: first ? "admin" : "customer",
      });
      await repo.touchLogin(user.Id);
      appendJsonl("audit.jsonl", { event: "signup", userId: user.Id, role: user.Role });
      json(res, 201, { user: publicUser(user), firstAdmin: first }, {
        "Set-Cookie": sessionCookie(signSession({ uid: user.Id }, sessionSecret(dataDir)), { secure: isSecure(req) }),
      });
    },
    { auth: false }
  );

  route(
    "POST",
    "/api/auth/login",
    async ({ req, res }) => {
      requireJson(req);
      const ip = clientIp(req);
      if (rateLimited(`login:${ip}`, 10, 15 * 60 * 1000)) throw httpError(429, "Too many login attempts. Wait 15 minutes and try again.");
      const b = await readBody(req);
      const user = await repo.findUserByEmail(String(b.email || "").trim());
      const ok = user && (await verifyPassword(String(b.password || ""), user.PasswordHash));
      if (!ok) throw httpError(401, "Incorrect email or password.");
      if (!user.IsActive) throw httpError(403, "This account has been deactivated. Contact the administrator.");
      await repo.touchLogin(user.Id);
      json(res, 200, { user: publicUser(user) }, {
        "Set-Cookie": sessionCookie(signSession({ uid: user.Id }, sessionSecret(dataDir)), { secure: isSecure(req) }),
      });
    },
    { auth: false }
  );

  route(
    "POST",
    "/api/auth/logout",
    async ({ req, res }) => json(res, 200, { ok: true }, { "Set-Cookie": clearCookie({ secure: isSecure(req) }) }),
    { auth: false }
  );

  route("GET", "/api/auth/me", async ({ res, user }) => json(res, 200, { user: publicUser(user) }));

  route("PUT", "/api/auth/profile", async ({ req, res, user }) => {
    requireJson(req);
    const b = await readBody(req);
    const fullName = String(b.fullName || "").trim().slice(0, 120);
    const phoneRaw = String(b.phone || "").trim();
    const phone = phoneRaw ? normalisePhone(phoneRaw) : null;
    if (!fullName) throw httpError(400, "Please enter your full name.");
    if (phoneRaw && !phone) throw httpError(400, "Enter a valid Safaricom number, e.g. 0712 345 678.");
    json(res, 200, { user: publicUser(await repo.updateUser(user.Id, { fullName, phone })) });
  });

  route("POST", "/api/auth/password", async ({ req, res, user }) => {
    requireJson(req);
    const b = await readBody(req);
    if (!(await verifyPassword(String(b.currentPassword || ""), user.PasswordHash))) throw httpError(400, "Your current password is incorrect.");
    const pwErr = passwordProblem(b.newPassword);
    if (pwErr) throw httpError(400, pwErr);
    await repo.updateUser(user.Id, { passwordHash: await hashPassword(b.newPassword) });
    json(res, 200, { ok: true });
  });

  // ---- public catalogue (prices for the website) ---------------------------
  route(
    "GET",
    "/api/catalog",
    async ({ res }) => {
      const items = await repo.listCatalog({ activeOnly: true });
      json(res, 200, { items: items.map((i) => ({ kind: i.kind, name: i.name, section: i.section, category: i.category, price: i.price })) });
    },
    { auth: false }
  );

  // ---- dashboard ---------------------------------------------------------
  route("GET", "/api/portal/overview", async ({ res, user }) => {
    json(res, 200, await repo.overview({ userId: can(user, "viewAll") ? null : user.Id }));
  });

  // ---- orders ------------------------------------------------------------
  route("GET", "/api/portal/orders", async ({ res, user, url }) => {
    const p = pageParams(url);
    json(res, 200, await repo.listOrders({ ...p, userId: can(user, "viewAll") ? null : user.Id }));
  });
  route("GET", "/api/portal/orders/:id", async ({ res, user, params }) => {
    const order = await repo.getOrder(Number(params.id));
    if (!order || (!can(user, "viewAll") && order.userId !== user.Id)) throw httpError(404, "Order not found.");
    json(res, 200, { order });
  });
  route(
    "PATCH",
    "/api/portal/orders/:id",
    async ({ req, res, params }) => {
      requireJson(req);
      const b = await readBody(req);
      const allowed = ["pending", "paid", "processing", "completed", "failed", "cancelled"];
      if (!allowed.includes(b.status)) throw httpError(400, "Invalid status.");
      const order = await repo.setOrderStatus(Number(params.id), b.status, b.notes !== undefined ? String(b.notes).slice(0, 1000) : undefined);
      if (!order) throw httpError(404, "Order not found.");
      json(res, 200, { order });
    },
    { perm: "manageOrders" }
  );

  // ---- payments ----------------------------------------------------------
  route("GET", "/api/portal/payments", async ({ res, user, url }) => {
    json(res, 200, await repo.listPayments({ ...pageParams(url), userId: can(user, "viewAll") ? null : user.Id }));
  });

  // ---- catalogue ----------------------------------------------------------
  const catalogBody = (b, kind) => {
    const name = String(b.name || "").trim().slice(0, 160);
    if (!name) throw httpError(400, "Name is required.");
    const price = b.price === "" || b.price === null || b.price === undefined ? null : Number(b.price);
    if (price !== null && (!Number.isFinite(price) || price < 0)) throw httpError(400, "Price must be a positive number or empty.");
    return {
      kind,
      name,
      section: String(b.section || "").trim().slice(0, 80) || null,
      category: String(b.category || "").trim().slice(0, 80) || null,
      description: String(b.description || "").trim().slice(0, 1000) || null,
      price,
      isActive: b.isActive !== false,
    };
  };
  route("GET", "/api/portal/catalog", async ({ res, url }) => {
    const kind = url.searchParams.get("kind");
    json(res, 200, { rows: await repo.listCatalog({ kind: ["product", "service"].includes(kind) ? kind : undefined, search: pageParams(url).search }) });
  }, { perm: "manageCatalog" });
  route("POST", "/api/portal/catalog", async ({ req, res }) => {
    requireJson(req);
    const b = await readBody(req);
    const kind = b.kind === "product" ? "product" : "service";
    json(res, 201, { item: await repo.createCatalog(catalogBody(b, kind)) });
  }, { perm: "manageCatalog" });
  route("PUT", "/api/portal/catalog/:id", async ({ req, res, params }) => {
    requireJson(req);
    const existing = await repo.getCatalog(Number(params.id));
    if (!existing) throw httpError(404, "Item not found.");
    const b = await readBody(req);
    json(res, 200, { item: await repo.updateCatalog(existing.id, catalogBody(b, existing.kind)) });
  }, { perm: "manageCatalog" });
  route("DELETE", "/api/portal/catalog/:id", async ({ res, params }) => {
    await repo.deleteCatalog(Number(params.id));
    json(res, 200, { ok: true });
  }, { perm: "deleteCatalog" });

  // ---- users -------------------------------------------------------------
  route("GET", "/api/portal/users", async ({ res, url }) => {
    const p = pageParams(url);
    const role = url.searchParams.get("role");
    json(res, 200, await repo.listUsers({ ...p, role: ROLES.includes(role) ? role : undefined }));
  }, { perm: "users" });
  route("POST", "/api/portal/users", async ({ req, res }) => {
    requireJson(req);
    const b = await readBody(req);
    const email = String(b.email || "").trim().toLowerCase();
    const phoneRaw = String(b.phone || "").trim();
    const phone = phoneRaw ? normalisePhone(phoneRaw) : null;
    if (!String(b.fullName || "").trim()) throw httpError(400, "Full name is required.");
    if (!EMAIL_RE.test(email)) throw httpError(400, "Enter a valid email address.");
    if (phoneRaw && !phone) throw httpError(400, "Enter a valid Safaricom number.");
    if (!ROLES.includes(b.role)) throw httpError(400, "Choose a role.");
    const pwErr = passwordProblem(b.password);
    if (pwErr) throw httpError(400, pwErr);
    if (await repo.findUserByEmail(email)) throw httpError(409, "A user with this email already exists.");
    const u = await repo.createUser({ fullName: String(b.fullName).trim().slice(0, 120), email, phone, role: b.role, passwordHash: await hashPassword(b.password) });
    json(res, 201, { user: publicUser(u) });
  }, { perm: "users" });
  route("PATCH", "/api/portal/users/:id", async ({ req, res, params, user }) => {
    requireJson(req);
    const id = Number(params.id);
    const target = await repo.findUserById(id);
    if (!target) throw httpError(404, "User not found.");
    const b = await readBody(req);
    const fields = {};
    if (b.fullName !== undefined) fields.fullName = String(b.fullName).trim().slice(0, 120);
    if (b.phone !== undefined) {
      const phone = b.phone ? normalisePhone(b.phone) : null;
      if (b.phone && !phone) throw httpError(400, "Enter a valid Safaricom number.");
      fields.phone = phone;
    }
    if (b.role !== undefined) {
      if (!ROLES.includes(b.role)) throw httpError(400, "Invalid role.");
      fields.role = b.role;
    }
    if (b.isActive !== undefined) fields.isActive = Boolean(b.isActive);
    if (id === user.Id && (fields.role && fields.role !== "admin" || fields.isActive === false))
      throw httpError(400, "You can't remove your own admin access or deactivate yourself.");
    json(res, 200, { user: publicUser(await repo.updateUser(id, fields)) });
  }, { perm: "users" });
  route("POST", "/api/portal/users/:id/password", async ({ req, res, params }) => {
    requireJson(req);
    const b = await readBody(req);
    const pwErr = passwordProblem(b.password);
    if (pwErr) throw httpError(400, pwErr);
    const target = await repo.findUserById(Number(params.id));
    if (!target) throw httpError(404, "User not found.");
    await repo.updateUser(target.Id, { passwordHash: await hashPassword(b.password) });
    json(res, 200, { ok: true });
  }, { perm: "users" });

  // ---- settings ----------------------------------------------------------
  route("GET", "/api/portal/settings", async ({ res }) => {
    const sms = smsConfig();
    json(res, 200, {
      settings: await settingsWithDefaults(),
      integrations: {
        database: { connected: true, describe: db.describe },
        mpesaExpress: { ready: !mpesaMissing().length, missing: mpesaMissing() },
        b2c: { ready: !b2cMissing().length, missing: b2cMissing(), shortcode: b2cConfig().shortcode, commandId: b2cConfig().commandId, maxAmount: b2cConfig().maxAmount },
        sms: { ready: smsReady(), username: sms.username, senderId: sms.senderId, sandbox: sms.sandbox },
      },
    });
  }, { perm: "settings" });
  route("PUT", "/api/portal/settings", async ({ req, res }) => {
    requireJson(req);
    const b = await readBody(req);
    for (const key of EDITABLE_SETTINGS) {
      if (b[key] !== undefined) await repo.setSetting(key, String(b[key]).slice(0, 1000));
    }
    json(res, 200, { settings: await settingsWithDefaults() });
  }, { perm: "settings" });

  // ---- contact messages ----------------------------------------------------
  route("GET", "/api/portal/messages", async ({ res, url }) => {
    json(res, 200, await repo.listContacts(pageParams(url)));
  }, { perm: "messages" });

  // ---- bulk SMS ----------------------------------------------------------
  route("GET", "/api/portal/sms", async ({ res, url }) => {
    json(res, 200, { ...(await repo.listCampaigns(pageParams(url))), ready: smsReady() });
  }, { perm: "sendSms" });
  route("GET", "/api/portal/sms/:id", async ({ res, params }) => {
    const c = await repo.getCampaign(Number(params.id));
    if (!c) throw httpError(404, "Campaign not found.");
    json(res, 200, { campaign: c });
  }, { perm: "sendSms" });
  route("POST", "/api/portal/sms/preview", async ({ req, res }) => {
    requireJson(req);
    const b = await readBody(req);
    const list = b.audience && b.audience !== "custom" ? await repo.phonesForAudience(b.audience) : splitRecipients(b.recipients);
    const { phones, invalid } = normaliseMany(list);
    json(res, 200, { count: phones.length, invalid: invalid.slice(0, 50), invalidCount: invalid.length });
  }, { perm: "sendSms" });
  route("POST", "/api/portal/sms", async ({ req, res, user }) => {
    requireJson(req);
    if (!smsReady()) throw httpError(503, "Bulk SMS isn't set up yet: add AT_USERNAME and AT_API_KEY to server/.env.");
    const b = await readBody(req);
    const settings = await settingsWithDefaults();
    const body = String(b.message || "").trim();
    if (!body) throw httpError(400, "Write a message first.");
    const signature = String(settings.sms_signature || "").trim();
    const message = signature && !body.endsWith(signature) ? `${body}\n${signature}` : body;
    if (message.length > 918) throw httpError(400, "Message is too long (max 918 characters = 6 SMS).");
    const list = b.audience && b.audience !== "custom" ? await repo.phonesForAudience(b.audience) : splitRecipients(b.recipients);
    const { phones, invalid } = normaliseMany(list);
    if (!phones.length) throw httpError(400, "No valid Safaricom numbers to send to.");
    if (phones.length > 10000) throw httpError(400, "Send to at most 10,000 numbers at a time.");
    const senderId = String(b.senderId || settings.sms_default_sender || "").trim().slice(0, 11) || null;
    const id = await repo.createCampaign({ message, senderId, audience: b.audience || "custom", phones, userId: user.Id });
    appendJsonl("sms.jsonl", { event: "campaign_created", id, by: user.Id, recipients: phones.length });
    deliverCampaign(id, message, senderId).catch((e) => console.error("SMS campaign failed:", e.message));
    json(res, 202, { campaign: await repo.getCampaign(id), invalidCount: invalid.length });
  }, { perm: "sendSms" });

  // ---- bulk payments -----------------------------------------------------
  route("GET", "/api/portal/payouts", async ({ res, url }) => {
    json(res, 200, { ...(await repo.listBatches(pageParams(url))), ready: !b2cMissing().length, missing: b2cMissing(), maxAmount: b2cConfig().maxAmount });
  }, { perm: "payouts" });
  route("GET", "/api/portal/payouts/:id", async ({ res, params }) => {
    const b = await repo.getBatch(Number(params.id));
    if (!b) throw httpError(404, "Batch not found.");
    json(res, 200, { batch: b });
  }, { perm: "payouts" });
  route("POST", "/api/portal/payouts/validate", async ({ req, res }) => {
    requireJson(req);
    const b = await readBody(req);
    const { items, errors } = parsePayoutItems(b.items);
    json(res, 200, { items, errors, total: items.reduce((a, i) => a + i.amount, 0) });
  }, { perm: "payouts" });
  route("POST", "/api/portal/payouts", async ({ req, res, user }) => {
    requireJson(req);
    const b = await readBody(req);
    const title = String(b.title || "").trim().slice(0, 160);
    if (!title) throw httpError(400, "Give the batch a title, e.g. \"September commissions\".");
    const commandId = ["BusinessPayment", "SalaryPayment", "PromotionPayment"].includes(b.commandId) ? b.commandId : b2cConfig().commandId;
    const { items, errors } = parsePayoutItems(b.items);
    if (errors.length) throw httpError(400, errors.slice(0, 5).join(" "));
    if (!items.length) throw httpError(400, "Add at least one payee.");
    if (items.length > 1000) throw httpError(400, "At most 1,000 payees per batch.");
    const batch = await repo.createBatch({ title, commandId, items, userId: user.Id });
    appendJsonl("payouts.jsonl", { event: "batch_created", id: batch.id, by: user.Id, total: batch.totalAmount, count: batch.itemCount });
    json(res, 201, { batch });
  }, { perm: "payouts" });
  route("POST", "/api/portal/payouts/:id/approve", async ({ req, res, params, user }) => {
    requireJson(req);
    const missingB2c = b2cMissing();
    if (missingB2c.length) throw httpError(503, `M-Pesa B2C isn't set up: add ${missingB2c.join(", ")} to server/.env.`);
    const b = await readBody(req);
    const batch = await repo.getBatch(Number(params.id));
    if (!batch) throw httpError(404, "Batch not found.");
    if (batch.status !== "draft") throw httpError(409, `This batch is already ${batch.status}.`);
    if (Number(b.confirmTotal) !== Number(batch.totalAmount))
      throw httpError(400, `Type the exact batch total (KES ${Number(batch.totalAmount).toLocaleString()}) to confirm.`);
    const settings = await settingsWithDefaults();
    if (settings.payouts_require_second_approver === "true" && batch.createdBy === user.Id)
      throw httpError(403, "A different admin must approve this batch (two-person approval is on in Settings).");
    await repo.setBatchStatus(batch.id, "processing", user.Id);
    appendJsonl("payouts.jsonl", { event: "batch_approved", id: batch.id, by: user.Id, total: batch.totalAmount });
    processBatch(batch.id).catch((e) => console.error("Payout batch failed:", e.message));
    json(res, 202, { batch: await repo.getBatch(batch.id) });
  }, { perm: "payouts" });
  route("POST", "/api/portal/payouts/:id/cancel", async ({ res, params, user }) => {
    const batch = await repo.getBatch(Number(params.id));
    if (!batch) throw httpError(404, "Batch not found.");
    if (batch.status !== "draft") throw httpError(409, "Only draft batches can be cancelled.");
    await repo.setBatchStatus(batch.id, "cancelled");
    appendJsonl("payouts.jsonl", { event: "batch_cancelled", id: batch.id, by: user.Id });
    json(res, 200, { batch: await repo.getBatch(batch.id) });
  }, { perm: "payouts" });

  // ---- provider callbacks (public, secret-protected) ------------------------
  const secretOk = (given) => {
    const s = process.env.MPESA_CALLBACK_SECRET;
    return !s || given === s;
  };
  const b2cCallback = (kind) => async ({ req, res, params }) => {
    if (!secretOk(params.secret)) return json(res, 200, { ResultCode: 0, ResultDesc: "Accepted" });
    const body = await readBody(req).catch(() => ({}));
    const r = body?.Result || {};
    const oc = r.OriginatorConversationID;
    const payout = oc ? await repo.findPayoutByOriginator(oc) : null;
    if (payout && payout.status !== "success") {
      const ok = kind === "result" && Number(r.ResultCode) === 0;
      await repo.updatePayout(payout.id, {
        status: ok ? "success" : "failed",
        transactionId: r.TransactionID,
        resultCode: r.ResultCode,
        resultDesc: kind === "timeout" ? "Request timed out in M-Pesa's queue" : r.ResultDesc,
        conversationId: r.ConversationID,
      });
      await repo.refreshBatch(payout.batchId);
      appendJsonl("payouts.jsonl", { event: `b2c_${kind}`, payoutId: payout.id, code: r.ResultCode, tx: r.TransactionID });
    }
    json(res, 200, { ResultCode: 0, ResultDesc: "Accepted" });
  };
  route("POST", "/api/mpesa/b2c/result", b2cCallback("result"), { auth: false });
  route("POST", "/api/mpesa/b2c/result/:secret", b2cCallback("result"), { auth: false });
  route("POST", "/api/mpesa/b2c/timeout", b2cCallback("timeout"), { auth: false });
  route("POST", "/api/mpesa/b2c/timeout/:secret", b2cCallback("timeout"), { auth: false });

  const smsDelivery = async ({ req, res, params }) => {
    if (!secretOk(params.secret)) return json(res, 200, { ok: true });
    const raw = await new Promise((resolve) => {
      let s = "";
      req.on("data", (c) => (s += c));
      req.on("end", () => resolve(s));
    });
    const f = String(req.headers["content-type"] || "").includes("json") ? JSON.parse(raw || "{}") : Object.fromEntries(new URLSearchParams(raw));
    if (f.id) {
      const status = f.status === "Success" ? "Delivered" : ["Failed", "Rejected"].includes(f.status) ? "Failed" : f.status || "Sent";
      await repo.updateSmsByProviderId(f.id, status, f.failureReason);
    }
    json(res, 200, { ok: true });
  };
  route("POST", "/api/sms/delivery", smsDelivery, { auth: false });
  route("POST", "/api/sms/delivery/:secret", smsDelivery, { auth: false });

  // ---- dispatcher ------------------------------------------------------------
  let mpesaMissing = () => [];
  const handles = (pathname) =>
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/portal/") ||
    pathname === "/api/catalog" ||
    pathname.startsWith("/api/sms/") ||
    pathname.startsWith("/api/mpesa/b2c/");

  const handle = async (req, res, url) => {
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    let methodMatched = false;
    for (const r of routes) {
      const m = pathname.match(r.re);
      if (!m) continue;
      methodMatched = true;
      if (r.method !== req.method) continue;
      await ready;
      if (!repo) {
        json(res, 503, { error: dbError || "Database not connected.", database: false });
        return true;
      }
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      try {
        const user = r.auth ? await currentUser(req) : null;
        if (r.auth && !user) json(res, 401, { error: "Please log in." });
        else if (r.perm && !can(user, r.perm)) json(res, 403, { error: "You don't have access to this." });
        else await r.handler({ req, res, user, url, params });
      } catch (err) {
        if (res.headersSent) {
          console.error(err);
          return true;
        }
        const code = err.status && err.status < 600 ? err.status : 500;
        if (code >= 500) console.error(err);
        json(res, code, { error: code >= 500 && !err.status ? "Something went wrong. Please try again." : err.message });
      }
      return true;
    }
    if (methodMatched) {
      json(res, 405, { error: "Method not allowed." });
      return true;
    }
    return false;
  };

  return {
    ready,
    status,
    handles,
    handle,
    hooks,
    setMpesaMissing: (fn) => {
      mpesaMissing = fn;
    },
  };
}
