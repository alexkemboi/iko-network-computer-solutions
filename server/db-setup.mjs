#!/usr/bin/env node
/*
 * Create / update the IKONEX database on SQL Server.
 *
 *   npm run db:setup
 *   npm run db:setup -- --admin you@example.com "Your Name" "YourPassw0rd"
 *
 * - creates the database named in DB_NAME (default "ikonex") if it doesn't exist
 * - creates or updates all tables (safe to run again)
 * - loads the website's products and services into the catalogue (first run only)
 * - optionally creates an admin account (otherwise the first person to sign up becomes admin)
 */
process.env.IKONEX_API_EMBEDDED = "1";
process.env.IKONEX_NO_DB_INIT = "1"; // this script does the setup itself
await import("./mpesa-server.mjs"); // loads server/.env

const { connectDb, dbConfigured } = await import("./lib/db.mjs");
const { ensureSchema } = await import("./lib/schema.mjs");
const { makeRepo } = await import("./lib/repo.mjs");
const { hashPassword, passwordProblem } = await import("./lib/auth.mjs");
const fs = await import("node:fs");
const path = await import("node:path");
const { fileURLToPath } = await import("node:url");

const here = path.dirname(fileURLToPath(import.meta.url));
const ok = (m) => console.log(`  ✔ ${m}`);
const bad = (m) => console.log(`  ✘ ${m}`);

console.log("\nIKONEX · database setup\n");

if (!dbConfigured()) {
  bad("Database settings missing. Add these to server/.env:");
  console.log(`
    DB_SERVER=localhost
    DB_INSTANCE=SQLEXPRESS
    DB_NAME=ikonex
    DB_USER=ikonex_app
    DB_PASSWORD=<the password you chose>
`);
  process.exit(1);
}

let db;
try {
  db = await connectDb();
  ok(`Connected to ${db.describe}`);
} catch (e) {
  bad(`Could not connect: ${e.message}`);
  console.log(`
  Checklist for SQL Server Express (see server/README.md → "Database"):
   • SQL Server Configuration Manager → SQL Server Network Configuration →
     Protocols for SQLEXPRESS → TCP/IP = Enabled, then restart "SQL Server (SQLEXPRESS)"
   • Service "SQL Server Browser" running (needed for DB_INSTANCE=SQLEXPRESS),
     or set DB_PORT to the instance's fixed TCP port instead
   • Mixed-mode authentication on, and the SQL login from server/db/create-login.sql exists
`);
  process.exit(1);
}

await ensureSchema(db);
ok("Tables are up to date");

const repo = makeRepo(db);
const seed = JSON.parse(fs.readFileSync(path.join(here, "lib", "catalog-seed.json"), "utf8"));
const added = await repo.seedCatalog(seed);
ok(added ? `Loaded ${added} products & services from the website` : `Catalogue already has ${await repo.countCatalog()} items`);

const i = process.argv.indexOf("--admin");
if (i > -1) {
  const [email, fullName, password] = process.argv.slice(i + 1, i + 4);
  const problem = !email || !fullName ? "Usage: --admin email \"Full Name\" password" : passwordProblem(password);
  if (problem) {
    bad(problem);
  } else if (await repo.findUserByEmail(email)) {
    const u = await repo.findUserByEmail(email);
    await repo.updateUser(u.Id, { role: "admin", isActive: true, passwordHash: await hashPassword(password) });
    ok(`Existing user ${email} is now an admin (password updated)`);
  } else {
    await repo.createUser({ fullName, email, phone: null, role: "admin", passwordHash: await hashPassword(password) });
    ok(`Admin account created for ${email}`);
  }
} else {
  const n = await repo.countUsers();
  console.log(n ? `  • ${n} user account(s) exist` : "  • No accounts yet — the first person to sign up becomes the admin");
}

await db.close();
console.log("\nDone. Start the site with `npm start` and open http://localhost:3000/#/login\n");
process.exit(0);
