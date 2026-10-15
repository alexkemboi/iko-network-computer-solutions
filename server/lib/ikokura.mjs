/*
 * Read-only view of Ikokura Campaign Manager workspaces (tenants) for the
 * IKONEX admin portal. Connects straight to Ikokura's PostgreSQL database:
 *
 *   IKOKURA_DATABASE_URL=postgresql://user:pass@localhost:5432/ikokura
 *   IKOKURA_APP_URL=https://elections2027.ikonexsystems.com   # for links
 *
 * Every session is opened with default_transaction_read_only=on, so nothing
 * here can change Ikokura data. Column names follow Ikokura's Prisma schema
 * (camelCase, hence the quoted identifiers).
 */

const env = (k, d = "") => (process.env[k] ?? d).toString().trim();

export const ikokuraConfigured = () => Boolean(env("IKOKURA_DATABASE_URL"));
export const ikokuraAppUrl = () => env("IKOKURA_APP_URL", "https://elections2027.ikonexsystems.com").replace(/\/+$/, "");

const TENANT_STATUSES = ["ACTIVE", "SUSPENDED", "CLOSED"];

let poolPromise = null;
const pool = () =>
  (poolPromise ||= (async () => {
    const pg = (await import("pg")).default;
    return new pg.Pool({
      connectionString: env("IKOKURA_DATABASE_URL").replace(/[?&]schema=\w+/, ""),
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      options: "-c default_transaction_read_only=on",
    });
  })().catch((err) => {
    poolPromise = null;
    throw err;
  }));

const query = async (text, params = []) => (await (await pool()).query(text, params)).rows;

/** Workspaces with plan, subscription and usage counts, plus platform-wide totals. */
export async function listWorkspaces({ search = "", status = "", page = 1, pageSize = 20 } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(t.name ILIKE $${params.length} OR t.slug ILIKE $${params.length})`);
  }
  if (TENANT_STATUSES.includes(status)) {
    params.push(status);
    where.push(`t.status::text = $${params.length}`);
  }
  const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [{ total }] = await query(`SELECT count(*)::int AS total FROM tenants t ${filter}`, params);
  const rows = await query(
    `SELECT t.id, t.name, t.slug, t."accountType", t.status, t."isDemo", t."primaryColor", t."createdAt",
            p.name AS plan, s.status AS "subscriptionStatus", s."trialEndsAt", s."currentPeriodEnd",
            (SELECT count(*)::int FROM memberships m WHERE m."tenantId" = t.id AND m.status = 'ACTIVE') AS members,
            (SELECT count(*)::int FROM campaigns c WHERE c."tenantId" = t.id) AS campaigns,
            (SELECT count(*)::int FROM agents a WHERE a."tenantId" = t.id AND a.status = 'ACTIVE') AS agents,
            (SELECT max(u."lastLoginAt") FROM memberships m JOIN users u ON u.id = m."userId"
              WHERE m."tenantId" = t.id) AS "lastActiveAt"
       FROM tenants t
       LEFT JOIN subscriptions s ON s."tenantId" = t.id
       LEFT JOIN plans p ON p.id = s."planId"
       ${filter}
      ORDER BY t."createdAt" DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, (page - 1) * pageSize]
  );
  const [summary] = await query(
    `SELECT count(*)::int AS workspaces,
            count(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
            count(*) FILTER (WHERE status <> 'ACTIVE')::int AS inactive,
            count(*) FILTER (WHERE "isDemo")::int AS demo,
            (SELECT count(*)::int FROM campaigns) AS campaigns,
            (SELECT count(*)::int FROM agents WHERE status = 'ACTIVE') AS agents
       FROM tenants`
  );
  return { rows, total, summary, appUrl: ikokuraAppUrl() };
}

/** One workspace with its campaigns and owners/admins. */
export async function getWorkspace(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [workspace] = await query(
    `SELECT t.id, t.name, t.slug, t."accountType", t.status, t."isDemo", t."primaryColor", t.timezone, t.currency, t."createdAt",
            p.name AS plan, p."maxUsers", p."maxAgents", s.status AS "subscriptionStatus", s."trialEndsAt", s."currentPeriodEnd", s.seats
       FROM tenants t
       LEFT JOIN subscriptions s ON s."tenantId" = t.id
       LEFT JOIN plans p ON p.id = s."planId"
      WHERE t.id = $1`,
    [id]
  );
  if (!workspace) return null;
  const [campaigns, owners] = await Promise.all([
    query(
      `SELECT c.id, c.name, c.slug, c.status, c."electionDate", c."isPublic",
              (SELECT count(*)::int FROM agents a WHERE a."campaignId" = c.id AND a.status = 'ACTIVE') AS agents
         FROM campaigns c WHERE c."tenantId" = $1 ORDER BY c."createdAt"`,
      [id]
    ),
    query(
      `SELECT u.name, u.email, u.phone, u."lastLoginAt", m.title
         FROM memberships m JOIN users u ON u.id = m."userId"
        WHERE m."tenantId" = $1 AND m."isOwner" AND m.status = 'ACTIVE'
        ORDER BY u.name`,
      [id]
    ),
  ]);
  const appUrl = ikokuraAppUrl();
  return {
    ...workspace,
    campaigns: campaigns.map((c) => ({ ...c, publicUrl: c.isPublic ? `${appUrl}/c/${workspace.slug}/${c.slug}` : null })),
    owners,
    appUrl,
  };
}
