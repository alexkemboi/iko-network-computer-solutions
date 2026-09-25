import React, { useEffect, useRef, useState } from "react";
import { FaMoneyCheckAlt, FaFileUpload, FaCheck, FaBan, FaClipboardCheck, FaShieldAlt, FaSave } from "react-icons/fa";
import { api, qs, money, dateTime, phoneFmt } from "../api";
import { Card, PageHeader, StatusBadge, DataTable, Pager, useLoad, Drawer, DL, Notice, useToast } from "../ui";
import Modal from "../../commerce/Modal";

const TYPES = [
  { value: "BusinessPayment", label: "Business payment" },
  { value: "SalaryPayment", label: "Salary payment" },
  { value: "PromotionPayment", label: "Promotion / reward" },
];

/** "0712345678, 1500, Jane Doe" per line (CSV with or without header) */
const parseLines = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^phone\b/i.test(l))
    .map((l) => {
      const [phone, amount, ...name] = l.split(/[,;\t]/).map((x) => x.trim());
      return { phone, amount: Number(String(amount || "").replace(/[^\d.]/g, "")), name: name.join(" ") };
    });

const BatchDrawer = ({ id, onClose, onChanged }) => {
  const toast = useToast();
  const { data, loading, reload } = useLoad(() => (id ? api(`/portal/payouts/${id}`) : Promise.resolve(null)), [id]);
  const b = data?.batch;
  const [approve, setApprove] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (b?.status !== "processing") return undefined;
    const t = setTimeout(reload, 3000);
    return () => clearTimeout(t);
  }, [b]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (kind) => {
    setBusy(true);
    try {
      if (kind === "approve") {
        await api(`/portal/payouts/${id}/approve`, { method: "POST", body: { confirmTotal: Number(typed.replace(/[^\d.]/g, "")) } });
        toast("Approved — payouts are being sent");
        setApprove(false);
        setTyped("");
      } else {
        await api(`/portal/payouts/${id}/cancel`, { method: "POST", body: {} });
        toast("Batch cancelled");
      }
      reload();
      onChanged();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      title={b ? b.title : "Payout batch"}
      subtitle={b ? `${TYPES.find((t) => t.value === b.commandId)?.label || b.commandId} · created ${dateTime(b.createdAt)}` : ""}
      footer={
        b?.status === "draft" ? (
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => act("cancel")} disabled={busy}>
              <FaBan aria-hidden="true" /> Cancel batch
            </button>
            <button type="button" className="ix-btn ix-btn--primary" onClick={() => setApprove(true)}>
              <FaCheck aria-hidden="true" /> Approve & pay
            </button>
          </>
        ) : null
      }
    >
      {loading && !b && <div className="px-skeleton px-skeleton--block" />}
      {b && (
        <>
          <div className="px-drawer__hero">
            <span className="px-drawer__amount">{money(b.totalAmount)}</span>
            <StatusBadge status={b.status} />
          </div>
          <DL
            items={[
              ["Payees", b.itemCount.toLocaleString()],
              ["Created by", b.createdByName],
              ["Approved by", b.approvedByName ? `${b.approvedByName} · ${dateTime(b.approvedAt)}` : "Not yet approved"],
            ]}
          />
          <h3 className="px-subhead">Payees</h3>
          <DataTable
            rows={b.items}
            columns={[
              { key: "phone", label: "Phone", render: (i) => (<><div>{phoneFmt(i.phone)}</div><div className="px-muted px-small">{i.name}</div></>) },
              { key: "amount", label: "Amount", align: "right", render: (i) => money(i.amount) },
              { key: "status", label: "Status", render: (i) => <StatusBadge status={i.status} /> },
              { key: "transactionId", label: "M-Pesa ref", render: (i) => (<><div className="px-mono">{i.transactionId || "—"}</div><div className="px-muted px-small">{i.resultDesc}</div></>) },
            ]}
          />
        </>
      )}

      <Modal
        open={approve}
        onClose={() => setApprove(false)}
        icon={FaShieldAlt}
        title="Approve this payout?"
        subtitle={b ? `${b.itemCount} payees · ${money(b.totalAmount)}` : ""}
        footer={
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => setApprove(false)}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--primary" disabled={busy || !typed} onClick={() => act("approve")}>
              {busy ? <span className="ix-spinner" aria-hidden="true" /> : <FaCheck aria-hidden="true" />} Send money now
            </button>
          </>
        }
      >
        <Notice tone="warn">Money leaves your M-Pesa B2C account immediately and can't be reversed from here.</Notice>
        <div className="ix-field" style={{ marginTop: 14 }}>
          <label htmlFor="po-confirm">Type the batch total to confirm ({b ? Number(b.totalAmount).toLocaleString() : ""})</label>
          <input id="po-confirm" className="ix-input" inputMode="numeric" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </div>
      </Modal>
    </Drawer>
  );
};

const BulkPayments = ({ query, navigate }) => {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [commandId, setCommandId] = useState("BusinessPayment");
  const [text, setText] = useState("");
  const [check, setCheck] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const fileRef = useRef(null);
  const list = useLoad(() => api(`/portal/payouts${qs({ page, pageSize: 10 })}`), [page]);

  useEffect(() => {
    if (!list.data?.rows?.some((r) => r.status === "processing")) return undefined;
    const t = setTimeout(list.reload, 4000);
    return () => clearTimeout(t);
  }, [list.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const runCheck = async () => {
    try {
      setCheck(await api("/portal/payouts/validate", { method: "POST", body: { items: parseLines(text) } }));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await api("/portal/payouts", { method: "POST", body: { title, commandId, items: parseLines(text) } });
      toast("Draft batch saved — review and approve it to send the money");
      setTitle("");
      setText("");
      setCheck(null);
      list.reload();
      navigate(`/app/payouts?id=${r.batch.id}`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setText((await f.text()).trim());
    setCheck(null);
    e.target.value = "";
  };

  return (
    <>
      <PageHeader icon={FaMoneyCheckAlt} title="Bulk Payments" subtitle="Pay many M-Pesa numbers at once (B2C). Batches are saved as drafts and only sent after approval." />

      {list.data && !list.data.ready && (
        <Notice tone="warn">
          M-Pesa B2C isn't fully set up. Add to <code>server/.env</code>: {list.data.missing.join(", ")}. You can still prepare draft batches.
        </Notice>
      )}

      <div className="px-grid-2 px-grid-2--compose">
        <Card title="New batch">
          <div className="ix-form">
            <div className="ix-form__row">
              <div className="ix-field">
                <label htmlFor="po-title">Batch title</label>
                <input id="po-title" className="ix-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. September commissions" />
              </div>
              <div className="ix-field">
                <label htmlFor="po-type">Payment type</label>
                <select id="po-type" className="ix-input" value={commandId} onChange={(e) => setCommandId(e.target.value)}>
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ix-field">
              <label htmlFor="po-lines">Payees</label>
              <textarea
                id="po-lines"
                className="ix-input px-mono"
                rows={7}
                value={text}
                onChange={(e) => { setText(e.target.value); setCheck(null); }}
                placeholder={"phone, amount, name\n0712345678, 1500, Jane Wanjiku\n0722111222, 2500, Peter Otieno"}
              />
              <div className="px-rowbetween">
                <span className="ix-field__hint">One payee per line: phone, amount (KES, whole number, min 10), optional name.</span>
                <button type="button" className="ix-link px-linkbtn" onClick={() => fileRef.current?.click()}>
                  <FaFileUpload aria-hidden="true" /> Import CSV
                </button>
                <input ref={fileRef} type="file" accept=".csv,.txt" hidden onChange={onFile} />
              </div>
            </div>

            {check && (
              <div className="px-checkresult">
                {check.errors.length > 0 ? (
                  <Notice tone="error">
                    <strong>{check.errors.length} row(s) need fixing:</strong>
                    <ul>{check.errors.slice(0, 8).map((e) => <li key={e}>{e}</li>)}</ul>
                  </Notice>
                ) : (
                  <Notice tone="good" icon={FaClipboardCheck}>
                    {check.items.length} payees · total <strong>{money(check.total)}</strong>
                  </Notice>
                )}
              </div>
            )}

            <div className="px-sendbar">
              <button type="button" className="ix-btn ix-btn--ghost" onClick={runCheck} disabled={!text.trim()}>
                <FaClipboardCheck aria-hidden="true" /> Check list
              </button>
              <button type="button" className="ix-btn ix-btn--primary" onClick={save} disabled={saving || !title.trim() || !check || check.errors.length > 0 || !check.items.length}>
                {saving ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save draft
              </button>
            </div>
          </div>
        </Card>

        <Card title="How approval works">
          <ol className="px-steps">
            <li><strong>Prepare</strong> — paste or import the payees and check the list.</li>
            <li><strong>Save a draft</strong> — nothing is paid yet.</li>
            <li><strong>Approve</strong> — an admin types the batch total to confirm; M-Pesa sends each payment.</li>
            <li><strong>Track</strong> — every payee shows its M-Pesa reference or the reason it failed.</li>
          </ol>
          <p className="px-muted px-small">Turn on two-person approval in Settings to require a different admin to approve.</p>
        </Card>
      </div>

      <Card title="Batches" pad={false}>
        <DataTable
          loading={list.loading}
          error={list.error}
          rows={list.data?.rows || []}
          empty="No payout batches yet."
          onRowClick={(r) => navigate(`/app/payouts?id=${r.id}`)}
          columns={[
            { key: "title", label: "Batch", render: (r) => (<><strong>{r.title}</strong><div className="px-muted px-small">{TYPES.find((t) => t.value === r.commandId)?.label}</div></>) },
            { key: "itemCount", label: "Payees", align: "right" },
            { key: "totalAmount", label: "Total", align: "right", render: (r) => money(r.totalAmount) },
            { key: "progress", label: "Paid / Failed", render: (r) => `${r.paidCount || 0} / ${r.failedCount || 0}` },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "createdAt", label: "Created", render: (r) => (<><div>{dateTime(r.createdAt)}</div><div className="px-muted px-small">{r.createdByName}</div></>) },
          ]}
        />
        <Pager page={page} pageSize={10} total={list.data?.total || 0} onPage={setPage} />
      </Card>

      <BatchDrawer id={query.get("id")} onClose={() => navigate("/app/payouts", { replace: true })} onChanged={list.reload} />
    </>
  );
};

export default BulkPayments;
