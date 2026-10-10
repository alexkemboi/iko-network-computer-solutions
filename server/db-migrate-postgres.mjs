#!/usr/bin/env node
/*
 * Copy the IKONEX database from SQL Server to PostgreSQL.
 *
 *   npm run db:migrate-pg            copy every table (skips tables that already have rows)
 *   npm run db:migrate-pg -- --force empty the Postgres tables first, then copy
 *
 * Source: SQL Server from DB_SERVER / DB_PORT / DB_INSTANCE / DB_NAME / DB_USER / DB_PASSWORD
 * Target: PostgreSQL from PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
 * Ids are kept, so orders still point at the right users and payments at the right orders.
 * SQL Server is only read, never changed.
 */
process.env.IKONEX_API_EMBEDDED = "1";
process.env.IKONEX_NO_DB_INIT = "1";
await import("./mpesa-server.mjs"); // loads server/.env

const { connectDb } = await import("./lib/db.mjs");
const { ensureSchema, TABLE_ORDER } = await import("./lib/schema.mjs");

const ok = (m) => console.log(`  ✔ ${m}`);
const bad = (m) => console.log(`  ✘ ${m}`);
const force = process.argv.includes("--force");
const sourceClient = process.env.MIGRATE_SOURCE || "mssql";

console.log("\nIKONEX · copy database to PostgreSQL\n");

let src, dst;
try {
  src = await connectDb(sourceClient);
  ok(`Source: ${src.describe}`);
} catch (e) {
  bad(`Could not connect to SQL Server: ${e.message}`);
  process.exit(1);
}
try {
  dst = await connectDb("postgres");
  ok(`Target: ${dst.describe}`);
} catch (e) {
  bad(`Could not connect to PostgreSQL: ${e.message}`);
  console.log(`
  Check that PostgreSQL is installed and running, and that server/.env has
    PGHOST=localhost  PGPORT=5432  PGDATABASE=ikonex  PGUSER=postgres  PGPASSWORD=<your password>
`);
  process.exit(1);
}

await ensureSchema(dst);
ok("PostgreSQL tables are ready");

const count = async (db, t) => Number((await db.query(`SELECT COUNT(*) AS n FROM ${t}`))[0].n);

if (force) {
  await dst.exec(`TRUNCATE ${[...TABLE_ORDER].reverse().join(", ")} RESTART IDENTITY CASCADE`);
  ok("Emptied the PostgreSQL tables (--force)");
}

const client = await dst.pool.connect();
let failed = false;
try {
  await client.query("BEGIN");
  for (const table of TABLE_ORDER) {
    const rows = await src.query(`SELECT * FROM ${table}`);
    const existing = Number((await client.query(`SELECT COUNT(*) AS n FROM ${table}`)).rows[0].n);
    if (existing > 0) {
      console.log(`  • ${table}: skipped — PostgreSQL already has ${existing} row(s) (use --force to replace)`);
      continue;
    }
    for (const row of rows) {
      const cols = Object.keys(row);
      const values = cols.map((c) => {
        const v = row[c];
        if (typeof v === "boolean") return v ? 1 : 0;
        if (v instanceof Date) return v.toISOString().replace("T", " ").replace("Z", "");
        return v;
      });
      await client.query(
        `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map((_, i) => "$" + (i + 1)).join(", ")})`,
        values
      );
    }
    if (table !== "Settings")
      await client.query(
        `SELECT setval(pg_get_serial_sequence('${table.toLowerCase()}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`
      );
    console.log(`  ✔ ${table}: copied ${rows.length} row(s)`);
  }
  await client.query("COMMIT");
} catch (e) {
  failed = true;
  await client.query("ROLLBACK");
  bad(`Copy failed, nothing was saved to PostgreSQL: ${e.message}`);
} finally {
  client.release();
}

if (!failed) {
  console.log("\n  Check (SQL Server → PostgreSQL):");
  let mismatch = false;
  for (const t of TABLE_ORDER) {
    const [a, b] = [await count(src, t), await count(dst, t)];
    if (a !== b) mismatch = true;
    console.log(`    ${(a === b ? "✔" : "≠")} ${t.padEnd(16)} ${String(a).padStart(5)} → ${b}`);
  }
  console.log(
    mismatch
      ? "\n  Some counts differ (tables that were skipped keep their PostgreSQL rows)."
      : "\nDone. With DB_CLIENT=postgres in server/.env, run `npm start` — the app now uses PostgreSQL.\n"
  );
}
await src.close();
await dst.close();
process.exit(failed ? 1 : 0);
