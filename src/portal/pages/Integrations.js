import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaPlug,
  FaEnvelope,
  FaSms,
  FaMobileAlt,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaLock,
  FaPaperPlane,
  FaVial,
  FaEye,
  FaEyeSlash,
  FaHistory,
} from "react-icons/fa";
import { api, dateTime } from "../api";
import { useAuth } from "../AuthContext";
import { Card, PageHeader, Notice, useToast } from "../ui";

const TABS = [
  { name: "email", label: "Email", icon: FaEnvelope },
  { name: "sms", label: "SMS", icon: FaSms },
  { name: "mpesa", label: "M-Pesa", icon: FaMobileAlt },
];

const TROUBLESHOOTING = {
  email: [
    "Gmail and Microsoft 365 need an app password (or SMTP AUTH turned on), not your normal sign-in password.",
    "Port 587 uses STARTTLS; port 465 uses SSL/TLS. A mismatch shows as a TLS or \"wrong version number\" error.",
    "The sender email must be an address your SMTP account is allowed to send from.",
    "If the test times out, the server's firewall may block outgoing SMTP ports.",
  ],
  sms: [
    "Use the username and API key of the same Africa's Talking app — sandbox keys don't work live.",
    "A sender ID must be approved by Africa's Talking first; leave it empty to use the shared short code.",
    "Sandbox messages appear in the Africa's Talking simulator, not on a real phone.",
    "Live sending needs airtime on the Africa's Talking account.",
  ],
  mpesa: [
    "Keys from the Daraja sandbox app only work with the Sandbox environment; production keys come from your go-live app.",
    "For a Till, the business short code is the Store / HO number and the Till number is set separately.",
    "Callback and result URLs must be public HTTPS addresses that reach this server's /api/mpesa/... routes.",
    "Changing the callback secret affects payments already waiting for a callback; change it when the shop is quiet.",
    "The connection test checks the consumer key and secret. Run npm run mpesa:check -- 07XXXXXXXX on the server for a KES 1 end-to-end test.",
  ],
};

// ------------------------------------------------------------------ validation
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOST = /^(?=.{1,253}$)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*$/;

/** Mirrors the server's checks so Save is only enabled for valid changes; the server re-validates. */
const fieldError = (f, raw, { hasFallback }) => {
  const v = String(raw ?? "").trim();
  if (!v) return f.required && !hasFallback ? `${f.label} is required.` : null;
  if (/[\r\n]/.test(v)) return "Must be a single line.";
  if (f.type !== "secret" && v.length > (f.max || 500)) return `Must be at most ${f.max || 500} characters.`;
  if (f.type === "number") {
    const n = Number(v);
    if (!/^\d+$/.test(v) || n < (f.min ?? 0) || n > f.max) return `Enter a whole number from ${f.min ?? 0} to ${f.max}.`;
  }
  if (f.type === "email" && !EMAIL.test(v)) return "Enter a valid email address.";
  if (f.type === "host" && !HOST.test(v)) return "Enter a host name such as smtp.example.com (no http:// or port).";
  if (f.type === "url") {
    let u;
    try {
      u = new URL(v);
    } catch {
      return "Enter a full URL, e.g. https://example.com/path.";
    }
    if (f.https && u.protocol !== "https:") return "Must start with https://.";
  }
  if (f.pattern && !new RegExp(f.pattern).test(v)) {
    if (/shortcode/i.test(f.name)) return "Short codes are 5–7 digits.";
    if (f.name === "partyB") return "Digits only.";
    if (f.name === "senderId") return "Letters, numbers and spaces only (max 11).";
    return "Invalid format.";
  }
  return null;
};

const emptyDraft = () => ({ values: {}, secrets: {}, clear: [] });

const isDirty = (view, draft) =>
  Object.entries(draft.values).some(([k, v]) => (view.values[k] || "") !== String(v).trim()) ||
  Object.values(draft.secrets).some((v) => String(v).trim()) ||
  draft.clear.length > 0;

// ------------------------------------------------------------------ status
const statusOf = (view) => {
  const s = view.status;
  if (s.errors.length) return { tone: "bad", icon: FaTimesCircle, label: "Needs attention" };
  if (s.missing.length) return { tone: "warn", icon: FaExclamationTriangle, label: "Needs setup" };
  if (view.lastTestOk === false) return { tone: "bad", icon: FaTimesCircle, label: "Last test failed" };
  const testedSinceChange = view.lastTestAt && (!view.updatedAt || new Date(view.lastTestAt) >= new Date(view.updatedAt));
  if (view.lastTestOk && testedSinceChange) return { tone: "good", icon: FaCheckCircle, label: "Working" };
  return { tone: "info", icon: FaInfoCircle, label: "Configured · not tested" };
};

const StatusBadge = ({ view }) => {
  const st = statusOf(view);
  return (
    <span className={`px-badge px-badge--${st.tone}`}>
      <st.icon aria-hidden="true" />
      {st.label}
    </span>
  );
};

// ------------------------------------------------------------------ fields
const sourceNote = (view, f) => {
  const src = view.sources[f.name];
  if (f.type === "secret") {
    const s = view.secrets[f.name];
    if (s.saved) return "Saved securely in the portal";
    if (s.fromEnv) return `Using ${f.envName} from server/.env`;
    return null;
  }
  if (src === "env" && !view.values[f.name]) return `Using ${f.envName} from server/.env`;
  return null;
};

const SecretInput = ({ id, field, view, value, cleared, onChange, onToggleClear, error }) => {
  const [show, setShow] = useState(false);
  const s = view.secrets[field.name];
  const placeholder = cleared
    ? "Will be removed when you save"
    : s.saved
      ? "•••••••• saved — type to replace"
      : s.fromEnv
        ? "Set in server/.env — type to override"
        : "Not set";
  return (
    <div className="px-secret">
      <div className="ix-input-group" data-invalid={error ? "true" : undefined}>
        <span className="ix-input-group__addon" aria-hidden="true"><FaLock /></span>
        <input
          id={id}
          className="ix-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          spellCheck={false}
          disabled={cleared}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={`${id}-hint`}
        />
        <button type="button" className="px-secret__toggle" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide typed value" : "Show typed value"} disabled={!value}>
          {show ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {s.saved && (
        <button type="button" className="px-linkbtn" onClick={onToggleClear}>
          {cleared ? "Keep saved value" : `Remove saved value${s.fromEnv ? " (use server/.env)" : ""}`}
        </button>
      )}
    </div>
  );
};

const Field = ({ field: f, view, draft, setDraft, error, showError }) => {
  const id = `int-${view.name}-${f.name}`;
  const note = sourceNote(view, f);
  const hint = [f.hint, note].filter(Boolean).join(" ");

  if (f.type === "secret") {
    const cleared = draft.clear.includes(f.name);
    return (
      <div className="ix-field">
        <label htmlFor={id}>{f.label}{f.required && <span className="px-req" aria-hidden="true"> *</span>}</label>
        <SecretInput
          id={id}
          field={f}
          view={view}
          value={draft.secrets[f.name] || ""}
          cleared={cleared}
          error={showError && error}
          onChange={(e) => setDraft((d) => ({ ...d, secrets: { ...d.secrets, [f.name]: e.target.value } }))}
          onToggleClear={() =>
            setDraft((d) => ({
              ...d,
              secrets: { ...d.secrets, [f.name]: "" },
              clear: cleared ? d.clear.filter((k) => k !== f.name) : [...d.clear, f.name],
            }))
          }
        />
        {showError && error ? <span className="ix-field__error" role="alert">{error}</span> : hint && <span className="ix-field__hint" id={`${id}-hint`}>{hint}</span>}
      </div>
    );
  }

  const value = f.name in draft.values ? draft.values[f.name] : view.values[f.name] || "";
  const set = (v) =>
    setDraft((d) => {
      const next = { ...d, values: { ...d.values, [f.name]: v } };
      // Provider presets fill in the usual server settings
      const preset = f.options?.find((o) => o.value === v)?.preset;
      if (preset) for (const [k, pv] of Object.entries(preset)) next.values[k] = pv;
      return next;
    });
  const inherited = view.inherited[f.name];

  return (
    <div className="ix-field">
      <label htmlFor={id}>{f.label}{f.required && <span className="px-req" aria-hidden="true"> *</span>}</label>
      {f.type === "select" ? (
        <select id={id} className="ix-input" value={value || inherited || ""} onChange={(e) => set(e.target.value)}>
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          id={id}
          className="ix-input"
          type={f.type === "number" ? "text" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
          inputMode={f.type === "number" ? "numeric" : undefined}
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder={inherited || f.placeholder || ""}
          maxLength={f.max || undefined}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={showError && error ? "true" : undefined}
          aria-describedby={`${id}-hint`}
        />
      )}
      {showError && error ? <span className="ix-field__error" role="alert">{error}</span> : hint && <span className="ix-field__hint" id={`${id}-hint`}>{hint}</span>}
    </div>
  );
};

// ------------------------------------------------------------------ panel
const groupsOf = (fields) => {
  const out = [];
  for (const f of fields) {
    let g = out.find((x) => x.name === f.group);
    if (!g) out.push((g = { name: f.group, fields: [] }));
    g.fields.push(f);
  }
  return out;
};

const TestCard = ({ view, dirty, onTested }) => {
  const { user } = useAuth();
  const [to, setTo] = useState(view.name === "email" ? user?.email || "" : "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const r = await api(`/portal/integrations/${view.name}/test`, { method: "POST", body: { to } });
      setResult(r);
      onTested(r.integration);
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const blocked = dirty ? "Save or cancel your changes before testing." : !view.status.configured ? "Complete the required settings first." : null;
  const Btn = view.name === "mpesa" ? FaVial : FaPaperPlane;
  const label = { email: "Send test email", sms: "Send test SMS", mpesa: "Test connection" }[view.name];

  return (
    <Card title="Connection test">
      <form className="ix-form" onSubmit={run}>
        {view.name === "email" && (
          <div className="ix-field">
            <label htmlFor="int-test-to">Send the test to</label>
            <input id="int-test-to" className="ix-input" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@example.com" />
          </div>
        )}
        {view.name === "sms" && (
          <div className="ix-field">
            <label htmlFor="int-test-to">Phone number</label>
            <input id="int-test-to" className="ix-input" type="tel" value={to} onChange={(e) => setTo(e.target.value)} placeholder="0712 345 678" />
            <span className="ix-field__hint">A real SMS is sent (charged at your normal rate) unless the sandbox is selected.</span>
          </div>
        )}
        {view.name === "mpesa" && (
          <p className="px-muted px-small">Signs in to Safaricom Daraja with the saved consumer key and secret. No money moves.</p>
        )}
        <div>
          <button type="submit" className="ix-btn ix-btn--primary" disabled={busy || Boolean(blocked) || (view.name !== "mpesa" && !to.trim())}>
            {busy ? <span className="ix-spinner" aria-hidden="true" /> : <Btn aria-hidden="true" />} {label}
          </button>
          {blocked && <span className="ix-field__hint px-block">{blocked}</span>}
        </div>
        <div aria-live="polite">
          {result && (
            <Notice tone={result.ok ? "good" : "error"} icon={result.ok ? FaCheckCircle : FaTimesCircle}>
              <strong>{result.ok ? "Test passed. " : "Test failed. "}</strong>
              {result.message}
              {result.tip && <span className="px-block px-small">{result.tip}</span>}
            </Notice>
          )}
        </div>
      </form>
    </Card>
  );
};

const StatusCard = ({ view }) => {
  const s = view.status;
  return (
    <Card title="Status" action={<StatusBadge view={view} />}>
      <div className="px-stack px-stack--tight">
        {s.missing.length > 0 && (
          <Notice tone="warn">
            Required: {s.missing.join(", ")}.
          </Notice>
        )}
        {s.errors.length > 0 && (
          <Notice tone="error" icon={FaTimesCircle}>
            <ul className="px-plainlist">{s.errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </Notice>
        )}
        {s.warnings.length > 0 && (
          <Notice tone="info" icon={FaInfoCircle}>
            <ul className="px-plainlist">{s.warnings.map((e) => <li key={e}>{e}</li>)}</ul>
          </Notice>
        )}
        {view.name === "mpesa" && s.b2cMissing?.length > 0 && (
          <p className="px-muted px-small">B2C payouts are off until you add: {s.b2cMissing.join(", ")}.</p>
        )}
        {view.notes?.map((n) => <p key={n} className="px-muted px-small">{n}</p>)}
        <dl className="px-dl">
          <dt>Last successful test</dt>
          <dd>{view.lastSuccessAt ? dateTime(view.lastSuccessAt) : "Never"}</dd>
          <dt>Last test</dt>
          <dd>{view.lastTestAt ? `${dateTime(view.lastTestAt)} · ${view.lastTestOk ? "passed" : "failed"}` : "—"}</dd>
          {view.lastTestAt && view.lastTestOk === false && view.lastTestMessage && (
            <>
              <dt>Last error</dt>
              <dd>{view.lastTestMessage}</dd>
            </>
          )}
          <dt>Last changed</dt>
          <dd>{view.updatedAt ? `${dateTime(view.updatedAt)}${view.updatedBy ? ` by ${view.updatedBy}` : ""}` : "Not changed in the portal"}</dd>
        </dl>
        <p className="px-muted px-small px-iconline">
          <FaLock aria-hidden="true" /> Secrets are encrypted before they are stored and are never shown again.
        </p>
      </div>
    </Card>
  );
};

const HistoryCard = ({ name, version }) => {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let alive = true;
    api(`/portal/integrations/audit?integration=${name}&limit=20`)
      .then((r) => alive && setRows(r.audit))
      .catch(() => alive && setRows([]));
    return () => {
      alive = false;
    };
  }, [name, version]);
  return (
    <Card title={<span className="px-iconline"><FaHistory aria-hidden="true" /> Change history</span>}>
      {!rows ? (
        <div className="px-skeleton" />
      ) : !rows.length ? (
        <p className="px-muted px-small">No changes or tests recorded yet.</p>
      ) : (
        <ul className="px-history">
          {rows.map((r) => (
            <li key={r.id}>
              <span className={`px-history__dot px-history__dot--${r.eventType}`} aria-hidden="true" />
              <div>
                <strong>{r.eventType === "test" ? "Connection test" : "Settings changed"}</strong>
                <span className="px-muted px-small"> · {r.userName || r.userEmail || "Unknown"} · {dateTime(r.createdAt)}</span>
                <div className="px-small">{r.eventType === "test" ? r.detail : r.fields}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const IntegrationPanel = ({ view, draft, setDraft, onSaved, onTested, version }) => {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState("");
  const dirty = isDirty(view, draft);

  const errors = useMemo(() => {
    const out = {};
    for (const f of view.fields) {
      if (f.type === "secret") {
        const typed = draft.secrets[f.name] || "";
        const s = view.secrets[f.name];
        const hasFallback = (s.saved && !draft.clear.includes(f.name)) || s.fromEnv;
        const e = fieldError(f, typed, { hasFallback });
        if (e) out[f.name] = e;
      } else {
        const v = f.name in draft.values ? draft.values[f.name] : view.values[f.name] || "";
        const e = fieldError(f, v, { hasFallback: Boolean(view.inherited[f.name]) });
        if (e) out[f.name] = e;
      }
    }
    return { ...out, ...serverErrors };
  }, [view, draft, serverErrors]);

  // Errors only show for fields the admin changed (or after the server rejects a value)
  const touched = (name) => name in draft.values || Boolean(draft.secrets[name]) || name in serverErrors;
  const blocking = Object.keys(errors).filter(touched);
  const canSave = dirty && !blocking.length && !saving;

  useEffect(() => setServerErrors({}), [draft]);

  const save = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setFormError("");
    const values = {};
    for (const [k, v] of Object.entries(draft.values)) values[k] = String(v).trim();
    for (const [k, v] of Object.entries(draft.secrets)) if (String(v).trim()) values[k] = String(v).trim();
    try {
      const r = await api(`/portal/integrations/${view.name}`, { method: "PUT", body: { values, clear: draft.clear } });
      onSaved(r.integration);
      setDraft(emptyDraft());
      toast(r.changed.length ? `${view.title} settings saved` : "Nothing changed");
    } catch (err) {
      if (err.data?.fields) setServerErrors(err.data.fields);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const productionSwitch =
    view.name === "mpesa" && draft.values.environment === "production" && (view.values.environment || view.inherited.environment) !== "production";

  return (
    <div className="px-integrations">
      <form className="px-stack" onSubmit={save} noValidate>
        {groupsOf(view.fields).map((g) => (
          <Card key={g.name} title={g.name}>
            <div className="ix-form">
              <div className="px-formgrid">
                {g.fields.map((f) => (
                  <Field key={f.name} field={f} view={view} draft={draft} setDraft={setDraft} error={errors[f.name]} showError={touched(f.name)} />
                ))}
              </div>
            </div>
          </Card>
        ))}

        {productionSwitch && (
          <Notice tone="warn">
            Production moves real money. Saving checks that every required setting is present and valid first.
          </Notice>
        )}
        {formError && <Notice tone="error" icon={FaTimesCircle}>{formError}</Notice>}

        <div className="px-savebar px-savebar--sticky">
          {dirty && <span className="px-muted px-small px-savebar__note">Unsaved changes</span>}
          <button type="button" className="ix-btn ix-btn--ghost" onClick={() => setDraft(emptyDraft())} disabled={!dirty || saving}>
            <FaUndo aria-hidden="true" /> Cancel
          </button>
          <button type="submit" className="ix-btn ix-btn--primary" disabled={!canSave}>
            {saving ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save {view.title} settings
          </button>
        </div>
      </form>

      <aside className="px-stack">
        <StatusCard view={view} />
        <TestCard key={view.name} view={view} dirty={dirty} onTested={onTested} />
        <Card title="Troubleshooting">
          <ul className="px-tips">
            {TROUBLESHOOTING[view.name].map((t) => <li key={t}>{t}</li>)}
          </ul>
        </Card>
        <HistoryCard name={view.name} version={version} />
      </aside>
    </div>
  );
};

// ------------------------------------------------------------------ page
const Integrations = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(() => {
    const fromHash = new URLSearchParams(window.location.hash.split("?")[1] || "").get("tab");
    return TABS.some((t) => t.name === fromHash) ? fromHash : "email";
  });
  const [drafts, setDrafts] = useState(() => Object.fromEntries(TABS.map((t) => [t.name, emptyDraft()])));
  const [version, setVersion] = useState(0);
  const tabRefs = useRef({});

  useEffect(() => {
    api("/portal/integrations")
      .then((r) => setData(r.integrations))
      .catch((e) => setError(e.message));
  }, []);

  // Warn before leaving the page with unsaved changes
  const anyDirty = data && TABS.some((t) => isDirty(data[t.name], drafts[t.name]));
  useEffect(() => {
    if (!anyDirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [anyDirty]);

  const update = useCallback((view) => {
    setData((d) => ({ ...d, [view.name]: view }));
    setVersion((v) => v + 1);
  }, []);
  const setDraft = (name) => (fn) => setDrafts((all) => ({ ...all, [name]: typeof fn === "function" ? fn(all[name]) : fn }));

  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.name === active);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const tab = TABS[(next + TABS.length) % TABS.length];
    setActive(tab.name);
    tabRefs.current[tab.name]?.focus();
  };

  return (
    <>
      <PageHeader
        icon={FaPlug}
        title="Integrations & Communications"
        subtitle="Connect email, SMS and M-Pesa. Changes apply immediately — no restart or code change needed."
      />
      {error && <Notice tone="error">{error}</Notice>}
      {!data && !error && <div className="px-skeleton px-skeleton--block" />}

      {data && (
        <>
          <div className="px-tabs" role="tablist" aria-label="Integrations" onKeyDown={onTabKey}>
            {TABS.map((t) => {
              const st = statusOf(data[t.name]);
              const dirty = isDirty(data[t.name], drafts[t.name]);
              return (
                <button
                  key={t.name}
                  ref={(el) => (tabRefs.current[t.name] = el)}
                  type="button"
                  role="tab"
                  id={`int-tab-${t.name}`}
                  aria-selected={active === t.name}
                  aria-controls={`int-panel-${t.name}`}
                  tabIndex={active === t.name ? 0 : -1}
                  className="px-tab"
                  onClick={() => setActive(t.name)}
                >
                  <t.icon aria-hidden="true" />
                  {t.label}
                  <span className={`px-tab__dot px-tab__dot--${st.tone}`} title={st.label} aria-label={st.label} />
                  {dirty && <span className="px-tab__edited">edited</span>}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id={`int-panel-${active}`} aria-labelledby={`int-tab-${active}`}>
            <IntegrationPanel
              key={active}
              view={data[active]}
              draft={drafts[active]}
              setDraft={setDraft(active)}
              onSaved={update}
              onTested={update}
              version={version}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Integrations;
