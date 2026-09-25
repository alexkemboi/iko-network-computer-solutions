import React, { useEffect, useRef, useState } from "react";
import { FaSms, FaPaperPlane, FaFileUpload, FaUsers } from "react-icons/fa";
import { api, qs, dateTime, phoneFmt } from "../api";
import { Card, PageHeader, StatusBadge, DataTable, Pager, Segmented, useLoad, Drawer, DL, Notice, useToast } from "../ui";
import Modal from "../../commerce/Modal";

const AUDIENCES = [
  { value: "custom", label: "Numbers I enter" },
  { value: "customers", label: "All customers" },
  { value: "staff", label: "Staff" },
  { value: "all", label: "Everyone" },
];

// GSM-7 vs Unicode part sizes
const smsParts = (text) => {
  const unicode = /[^\n\r !"#$%&'()*+,\-./0-9:;<=>?@A-Z[\\\]^_a-z{|}~£¥èéùìòÇØøÅåΔΦΓΛΩΠΨΣΘΞÆæßÉÄÖÑÜ§¿äöñüà€]/.test(text);
  const single = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  const n = text.length;
  return { parts: n === 0 ? 0 : n <= single ? 1 : Math.ceil(n / multi), unicode, perPart: n <= single ? single : multi };
};

const CampaignDrawer = ({ id, onClose }) => {
  const { data, loading } = useLoad(() => (id ? api(`/portal/sms/${id}`) : Promise.resolve(null)), [id]);
  const c = data?.campaign;
  return (
    <Drawer open={Boolean(id)} onClose={onClose} title="SMS campaign" subtitle={c ? dateTime(c.createdAt) : ""}>
      {loading && <div className="px-skeleton px-skeleton--block" />}
      {c && (
        <>
          <blockquote className="px-quote">{c.message}</blockquote>
          <DL
            items={[
              ["Status", <StatusBadge status={c.status} />],
              ["Recipients", c.recipientCount.toLocaleString()],
              ["Sent", c.sentCount.toLocaleString()],
              ["Delivered", c.deliveredCount.toLocaleString()],
              ["Failed", c.failedCount.toLocaleString()],
              ["Sender ID", c.senderId || "Default"],
              ["Cost", c.cost],
            ]}
          />
          <h3 className="px-subhead">Recipients</h3>
          <DataTable
            rows={c.messages}
            columns={[
              { key: "phone", label: "Phone", render: (m) => phoneFmt(m.phone) },
              { key: "status", label: "Status", render: (m) => <StatusBadge status={m.status} /> },
              { key: "error", label: "Note", render: (m) => <span className="px-muted px-small">{m.error || m.cost || ""}</span> },
            ]}
          />
        </>
      )}
    </Drawer>
  );
};

const BulkSms = ({ query, navigate }) => {
  const toast = useToast();
  const [audience, setAudience] = useState("custom");
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [senderId, setSenderId] = useState("");
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const fileRef = useRef(null);
  const history = useLoad(() => api(`/portal/sms${qs({ page, pageSize: 10 })}`), [page]);
  const { parts, unicode, perPart } = smsParts(message);

  // live recipient count
  useEffect(() => {
    const t = setTimeout(() => {
      if (audience === "custom" && !recipients.trim()) return setPreview(null);
      api("/portal/sms/preview", { method: "POST", body: { audience, recipients } })
        .then(setPreview)
        .catch(() => setPreview(null));
    }, 350);
    return () => clearTimeout(t);
  }, [audience, recipients]);

  // refresh history while a campaign is sending
  useEffect(() => {
    if (!history.data?.rows?.some((r) => r.status === "sending")) return undefined;
    const t = setTimeout(history.reload, 3000);
    return () => clearTimeout(t);
  }, [history.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    // Pull anything that looks like a phone number out of CSV / TXT
    const numbers = text.match(/(?:\+?254|0)?[17]\d{8}/g) || [];
    setRecipients((r) => [r.trim(), numbers.join("\n")].filter(Boolean).join("\n"));
    toast(`Added ${numbers.length} numbers from ${f.name}`);
    e.target.value = "";
  };

  const send = async () => {
    setSending(true);
    try {
      const r = await api("/portal/sms", { method: "POST", body: { audience, recipients, message, senderId } });
      toast(`Sending to ${r.campaign.recipientCount.toLocaleString()} numbers${r.invalidCount ? ` (${r.invalidCount} invalid skipped)` : ""}`);
      setConfirm(false);
      setMessage("");
      setRecipients("");
      setPage(1);
      history.reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSending(false);
    }
  };

  const count = preview?.count || 0;
  const canSend = message.trim() && count > 0 && history.data?.ready !== false;

  return (
    <>
      <PageHeader icon={FaSms} title="Bulk SMS" subtitle="Send one message to many customers through Africa's Talking." />
      {history.data?.ready === false && (
        <Notice tone="warn">
          Bulk SMS isn't connected yet. Add <code>AT_USERNAME</code> and <code>AT_API_KEY</code> from your Africa's Talking account to <code>server/.env</code>, then restart the API.
        </Notice>
      )}

      <div className="px-grid-2 px-grid-2--compose">
        <Card title="Compose">
          <div className="ix-form">
            <div className="ix-field">
              <span className="px-label">Send to</span>
              <Segmented label="Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
            </div>

            {audience === "custom" && (
              <div className="ix-field">
                <label htmlFor="sms-to">Phone numbers</label>
                <textarea
                  id="sms-to"
                  className="ix-input"
                  rows={5}
                  placeholder={"0712 345 678\n0722 111 222, +254733444555"}
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
                <div className="px-rowbetween">
                  <span className="ix-field__hint">One per line, or separated by commas. Duplicates are removed.</span>
                  <button type="button" className="ix-link px-linkbtn" onClick={() => fileRef.current?.click()}>
                    <FaFileUpload aria-hidden="true" /> Import CSV / TXT
                  </button>
                  <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={onFile} />
                </div>
              </div>
            )}

            <div className="ix-field">
              <label htmlFor="sms-msg">Message</label>
              <textarea id="sms-msg" className="ix-input" rows={6} maxLength={918} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi! IKONEX Systems here…" />
              <div className="px-rowbetween">
                <span className="ix-field__hint">
                  {message.length} characters · {parts} SMS {unicode ? "(special characters use 70 per SMS)" : ""}
                </span>
                <span className="ix-field__hint">{message.length ? `${perPart - (message.length % perPart || perPart)} left in this SMS` : ""}</span>
              </div>
            </div>

            <div className="ix-field">
              <label htmlFor="sms-sender">Sender ID <span className="ix-field__hint">(optional)</span></label>
              <input id="sms-sender" className="ix-input" maxLength={11} value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="Uses your default sender ID" />
            </div>

            <div className="px-sendbar">
              <span className="px-sendbar__count">
                <FaUsers aria-hidden="true" />
                <strong>{count.toLocaleString()}</strong> recipients
                {preview?.invalidCount ? <span className="px-muted"> · {preview.invalidCount} invalid</span> : null}
              </span>
              <button type="button" className="ix-btn ix-btn--primary" disabled={!canSend} onClick={() => setConfirm(true)}>
                <FaPaperPlane aria-hidden="true" /> Review & send
              </button>
            </div>
          </div>
        </Card>

        <Card title="Phone preview">
          <div className="px-phone" aria-hidden="true">
            <div className="px-phone__screen">
              <div className="px-phone__sender">{senderId || "IKONEX"}</div>
              <div className="px-phone__bubble">{message || "Your message will appear here."}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Sent campaigns" pad={false}>
        <DataTable
          loading={history.loading}
          error={history.error}
          rows={history.data?.rows || []}
          empty="No campaigns sent yet."
          onRowClick={(r) => navigate(`/app/sms?id=${r.id}`)}
          columns={[
            { key: "message", label: "Message", render: (r) => <span className="px-clamp">{r.message}</span> },
            { key: "recipientCount", label: "Recipients", align: "right", render: (r) => r.recipientCount.toLocaleString() },
            { key: "sentCount", label: "Sent / Delivered / Failed", render: (r) => `${r.sentCount} / ${r.deliveredCount} / ${r.failedCount}` },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "createdAt", label: "Date", render: (r) => (<><div>{dateTime(r.createdAt)}</div><div className="px-muted px-small">{r.createdByName}</div></>) },
          ]}
        />
        <Pager page={page} pageSize={10} total={history.data?.total || 0} onPage={setPage} />
      </Card>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        icon={FaPaperPlane}
        title="Send this SMS?"
        subtitle={`${count.toLocaleString()} recipients · ${parts} SMS each`}
        footer={
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => setConfirm(false)}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--primary" onClick={send} disabled={sending}>
              {sending ? <span className="ix-spinner" aria-hidden="true" /> : <FaPaperPlane aria-hidden="true" />} Send {(count * parts).toLocaleString()} SMS
            </button>
          </>
        }
      >
        <blockquote className="px-quote">{message}</blockquote>
        <p className="px-muted">Messages are sent immediately and can't be recalled. Charges apply per SMS on your Africa's Talking account.</p>
      </Modal>

      <CampaignDrawer id={query.get("id")} onClose={() => navigate("/app/sms", { replace: true })} />
    </>
  );
};

export default BulkSms;
