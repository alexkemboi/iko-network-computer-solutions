import React, { useState } from "react";
import { FaVoteYea, FaLayerGroup, FaCheckCircle, FaFlag, FaUserFriends, FaExternalLinkAlt } from "react-icons/fa";
import { api, qs, dateTime, phoneFmt } from "../api";
import { Card, PageHeader, Stat, StatusBadge, DataTable, Pager, SearchBox, Segmented, useLoad, Drawer, DL, Notice } from "../ui";

// Ikokura Campaign Manager workspaces (tenants), read straight from Ikokura's database.

const STATUSES = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CLOSED", label: "Closed" },
];

const ACCOUNT_TYPE = {
  POLITICAL_PARTY: "Political party",
  CANDIDATE_SECRETARIAT: "Candidate secretariat",
  CANDIDATE: "Candidate",
};

const date = (v) => (v ? new Date(v).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const count = (v) => (v === undefined || v === null ? "…" : Number(v).toLocaleString());
const plural = (n, word) => `${Number(n).toLocaleString()} ${word}${Number(n) === 1 ? "" : "s"}`;
// The subscription badge only adds information when it isn't just echoing the plan ("Trial" / Trial).
const PlanCell = ({ plan, status }) => {
  if (!plan) return <span className="px-muted">None</span>;
  const echoes = status === "ACTIVE" || (status === "TRIALING" && /trial/i.test(plan));
  return <>{plan}{!echoes && <div className="px-small"><StatusBadge status={status} /></div>}</>;
};

const WorkspaceDetail = ({ id }) => {
  const { data, loading, error } = useLoad(() => api(`/portal/workspaces/${id}`), [id]);
  if (loading) return <div className="px-skeleton px-skeleton--block" />;
  if (error) return <Notice tone="error">{error}</Notice>;
  const w = data.workspace;
  return (
    <>
      <DL
        items={[
          ["Status", <StatusBadge status={w.status} />],
          ["Account type", ACCOUNT_TYPE[w.accountType] || w.accountType],
          ["Workspace code", w.slug],
          ["Plan", w.plan ? <>{w.plan} <StatusBadge status={w.subscriptionStatus} /></> : "No subscription"],
          w.subscriptionStatus === "TRIALING" && ["Trial ends", date(w.trialEndsAt)],
          w.currentPeriodEnd && ["Renews", date(w.currentPeriodEnd)],
          (w.maxUsers || w.maxAgents) && ["Limits", `${w.maxUsers ?? "∞"} users · ${w.maxAgents ?? "∞"} agents`],
          ["Created", dateTime(w.createdAt)],
          w.isDemo && ["Demo workspace", "Yes"],
        ]}
      />

      <h3 className="px-subhead">Owners</h3>
      {w.owners.length ? (
        <ul className="px-plainlist">
          {w.owners.map((o) => (
            <li key={o.email}>
              <strong>{o.name}</strong>{o.title && <span className="px-muted"> · {o.title}</span>}
              <div className="px-muted px-small">
                <a href={`mailto:${o.email}`}>{o.email}</a>{o.phone && <> · {phoneFmt(o.phone)}</>} · last login {o.lastLoginAt ? dateTime(o.lastLoginAt) : "never"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-muted">No active owner.</p>
      )}

      <h3 className="px-subhead">Campaigns ({w.campaigns.length})</h3>
      {w.campaigns.length ? (
        <ul className="px-plainlist">
          {w.campaigns.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> <StatusBadge status={c.status} />
              <div className="px-muted px-small">
                {plural(c.agents, "active agent")}{c.electionDate && <> · election {date(c.electionDate)}</>}
                {c.publicUrl && <> · <a href={c.publicUrl} target="_blank" rel="noreferrer">public page <FaExternalLinkAlt aria-hidden="true" /></a></>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-muted">No campaigns set up yet.</p>
      )}
    </>
  );
};

const Workspaces = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const pageSize = 15;
  const { data, loading, error } = useLoad(() => api(`/portal/workspaces${qs({ q: search, status, page, pageSize })}`), [search, status, page]);
  const s = data?.summary;

  return (
    <>
      <PageHeader
        icon={FaVoteYea}
        title="Campaign workspaces"
        subtitle="Every workspace on Ikokura Campaign Manager, with its plan, team and campaigns."
        actions={
          data?.appUrl && (
            <a className="ix-btn ix-btn--ghost" href={data.appUrl} target="_blank" rel="noreferrer">
              Open Ikokura <FaExternalLinkAlt aria-hidden="true" />
            </a>
          )
        }
      />

      {!error && (
        <div className="px-stats">
          <Stat label="Workspaces" value={count(s?.workspaces)} hint={s ? `${s.demo} demo` : ""} icon={FaLayerGroup} />
          <Stat label="Active" value={count(s?.active)} hint={s ? `${s.inactive} suspended or closed` : ""} icon={FaCheckCircle} tone="teal" />
          <Stat label="Campaigns" value={count(s?.campaigns)} icon={FaFlag} tone="violet" />
          <Stat label="Active agents" value={count(s?.agents)} icon={FaUserFriends} />
        </div>
      )}

      <Card pad={false}>
        <div className="px-toolbar">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search workspace name or code…" />
          <Segmented label="Filter by status" options={STATUSES} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        </div>
        <DataTable
          loading={loading}
          error={error}
          rows={data?.rows || []}
          empty="No workspaces match."
          onRowClick={(w) => setOpen(w)}
          columns={[
            {
              key: "name",
              label: "Workspace",
              render: (w) => (
                <>
                  <span className="px-swatch" style={{ background: w.primaryColor }} aria-hidden="true" />
                  <strong>{w.name}</strong>
                  {w.isDemo && <span className="px-tag">Demo</span>}
                  <div className="px-muted px-small">{ACCOUNT_TYPE[w.accountType] || w.accountType} · {w.slug}</div>
                </>
              ),
            },
            { key: "plan", label: "Plan", render: (w) => <PlanCell plan={w.plan} status={w.subscriptionStatus} /> },
            { key: "usage", label: "Team", render: (w) => <>{plural(w.members, "member")}<div className="px-muted px-small">{plural(w.agents, "agent")} · {plural(w.campaigns, "campaign")}</div></> },
            { key: "status", label: "Status", render: (w) => <StatusBadge status={w.status} /> },
            { key: "lastActiveAt", label: "Last active", render: (w) => (w.lastActiveAt ? dateTime(w.lastActiveAt) : <span className="px-muted">Never</span>) },
            { key: "createdAt", label: "Created", render: (w) => date(w.createdAt) },
          ]}
        />
        <Pager page={page} pageSize={pageSize} total={data?.total || 0} onPage={setPage} />
      </Card>

      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open?.name || "Workspace"} subtitle={open ? ACCOUNT_TYPE[open.accountType] : ""}>
        {open && <WorkspaceDetail id={open.id} />}
      </Drawer>
    </>
  );
};

export default Workspaces;
