import React, { useEffect, useState } from "react";
import { FaCog, FaSave, FaDatabase, FaMobileAlt, FaMoneyCheckAlt, FaSms, FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import { api, money } from "../api";
import { Card, PageHeader, useLoad, useToast, Notice } from "../ui";

const Integration = ({ icon: Icon, title, ready, children }) => (
  <div className={`px-integ ${ready ? "is-ready" : "is-missing"}`}>
    <span className="px-integ__icon" aria-hidden="true"><Icon /></span>
    <div className="px-integ__body">
      <div className="px-integ__head">
        <strong>{title}</strong>
        <span className={`px-badge px-badge--${ready ? "good" : "warn"}`}>
          {ready ? <FaCheckCircle aria-hidden="true" /> : <FaExclamationTriangle aria-hidden="true" />}
          {ready ? "Connected" : "Needs setup"}
        </span>
      </div>
      <div className="px-muted px-small">{children}</div>
    </div>
  </div>
);

const Missing = ({ list, tab }) => (
  <>
    {list?.length ? <>Missing: {list.join(", ")}. </> : null}
    <a href={`#/app/integrations?tab=${tab}`}>Set up in Integrations</a>
  </>
);

const FIELDS = [
  ["business_name", "Business name"],
  ["business_email", "Business email", "email"],
  ["business_phone", "Business phone", "tel"],
  ["business_address", "Address"],
];

const Settings = () => {
  const toast = useToast();
  const { data, loading, error } = useLoad(() => api("/portal/settings"), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? String(e.target.checked) : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api("/portal/settings", { method: "PUT", body: form });
      setForm(r.settings);
      toast("Settings saved");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const i = data?.integrations;

  return (
    <>
      <PageHeader icon={FaCog} title="Settings" subtitle="Business details, messaging defaults, payout rules and connection status." />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !form && <div className="px-skeleton px-skeleton--block" />}

      {form && (
        <div className="px-grid-2 px-grid-2--settings">
          <form onSubmit={save} className="px-stack">
            <Card title="Business">
              <div className="ix-form">
                <div className="px-formgrid">
                  {FIELDS.map(([k, label, type]) => (
                    <div className="ix-field" key={k}>
                      <label htmlFor={`set-${k}`}>{label}</label>
                      <input id={`set-${k}`} className="ix-input" type={type || "text"} value={form[k] || ""} onChange={set(k)} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Bulk SMS defaults">
              <div className="ix-form">
                <div className="px-formgrid">
                  <div className="ix-field">
                    <label htmlFor="set-sender">Default sender ID</label>
                    <input id="set-sender" className="ix-input" maxLength={11} value={form.sms_default_sender || ""} onChange={set("sms_default_sender")} placeholder="Approved by Africa's Talking" />
                    <span className="ix-field__hint">Leave empty to use the shared short code.</span>
                  </div>
                  <div className="ix-field">
                    <label htmlFor="set-sig">Signature</label>
                    <input id="set-sig" className="ix-input" maxLength={40} value={form.sms_signature || ""} onChange={set("sms_signature")} placeholder="e.g. – IKONEX Systems" />
                    <span className="ix-field__hint">Added to the end of every bulk SMS.</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Bulk payment safety">
              <label className="px-switch px-switch--block">
                <input type="checkbox" checked={form.payouts_require_second_approver === "true"} onChange={set("payouts_require_second_approver")} />
                <span className="px-switch__track" aria-hidden="true" />
                <span>
                  <strong>Two-person approval</strong>
                  <span className="px-muted px-small px-block">The admin who creates a payout batch can't approve it — another admin must.</span>
                </span>
              </label>
            </Card>

            <div className="px-savebar">
              <button type="submit" className="ix-btn ix-btn--primary" disabled={saving}>
                {saving ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save settings
              </button>
            </div>
          </form>

          <Card title="Connections">
            <div className="px-stack px-stack--tight">
              <Integration icon={FaDatabase} title="Database" ready={i?.database?.connected}>
                {i?.database?.describe}
              </Integration>
              <Integration icon={FaMobileAlt} title="M-Pesa Express (checkout)" ready={i?.mpesaExpress?.ready}>
                {i?.mpesaExpress?.ready ? `Customers get the PIN prompt when they order (${i.mpesaExpress.mode}).` : <Missing list={i?.mpesaExpress?.missing} tab="mpesa" />}
              </Integration>
              <Integration icon={FaMoneyCheckAlt} title="M-Pesa B2C (bulk payments)" ready={i?.b2c?.ready}>
                {i?.b2c?.ready ? `Short code ${i.b2c.shortcode} · max ${money(i.b2c.maxAmount)} per payee` : <Missing list={i?.b2c?.missing} tab="mpesa" />}
              </Integration>
              <Integration icon={FaSms} title="Africa's Talking (bulk SMS)" ready={i?.sms?.ready}>
                {i?.sms?.ready
                  ? `Account ${i.sms.username}${i.sms.sandbox ? " (sandbox)" : ""}${i.sms.senderId ? ` · sender ${i.sms.senderId}` : ""}`
                  : <Missing tab="sms" />}
              </Integration>
              <Integration icon={FaEnvelope} title="Email (SMTP)" ready={i?.email?.ready}>
                {i?.email?.ready ? `Sending as ${i.email.fromEmail}` : <Missing list={i?.email?.missing} tab="email" />}
              </Integration>
              <a className="ix-btn ix-btn--outline" href="#/app/integrations">
                Manage email, SMS &amp; M-Pesa <FaArrowRight aria-hidden="true" />
              </a>
              <p className="px-muted px-small">Credentials are encrypted on the server and never shown here. Changes apply without a restart.</p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Settings;
