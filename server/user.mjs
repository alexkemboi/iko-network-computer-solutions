#!/usr/bin/env node
/*
 * Create a login, or reset an existing user's password, in the IKONEX database.
 *
 *   npm run user -- list
 *   npm run user -- you@example.com "Full Name" "Passw0rd123" [admin|staff|customer]
 *
 * Existing email → password is reset (role changes only if you pass one) and the account is re-activated.
 * New email      → account is created (role defaults to customer).
 * Passwords are stored as scrypt hashes, so a user typed straight into SSMS can't log in until reset here.
 */
process.env.IKONEX_API_EMBEDDED = "1";
process.env.IKONEX_NO_DB_INIT = "1";
await import("./mpesa-server.mjs"); // loads server/.env

const { connectDb } = await import("./lib/db.mjs");
const { ensureSchema } = await import("./lib/schema.mjs");
const { makeRepo } = await import("./lib/repo.mjs");
const { hashPassword, passwordProblem } = await import("./lib/auth.mjs");

const ROLES = ["admin", "staff", "customer"];
const args = process.argv.slice(2);
const db = await connectDb();
await ensureSchema(db);
const repo = makeRepo(db);
const done = async (code) => { await db.close(); process.exit(code); };

if (!args.length || args[0] === "list") {
  const rows = await db.query("SELECT Id, Email, FullName, Role, IsActive, LastLoginAt FROM Users ORDER BY Id");
  if (!rows.length) console.log("No users yet.");
  else console.table(rows.map((r) => ({ Id: r.Id, Email: r.Email, Name: r.FullName, Role: r.Role, Active: !!r.IsActive, LastLogin: r.LastLoginAt })));
  await done(0);
}

const [email, fullName, password, role] = args;
const problem =
  !email || !password ? 'Usage: npm run user -- email "Full Name" password [admin|staff|customer]'
  : role && !ROLES.includes(role) ? `Role must be one of: ${ROLES.join(", ")}`
  : passwordProblem(password);
if (problem) { console.log(`  ✘ ${problem}`); await done(1); }

const existing = await repo.findUserByEmail(email);
if (existing) {
  await repo.updateUser(existing.Id, { passwordHash: await hashPassword(password), isActive: true, ...(role ? { role } : {}) });
  console.log(`  ✔ Password reset for ${email.toLowerCase()} (role: ${role || existing.Role}). Log in at /#/login`);
} else {
  const n = await repo.countUsers();
  const r = role || (n === 0 ? "admin" : "customer");
  await repo.createUser({ fullName: fullName || email.split("@")[0], email, phone: null, role: r, passwordHash: await hashPassword(password) });
  console.log(`  ✔ Created ${email.toLowerCase()} as ${r}. Log in at /#/login`);
}
await done(0);
