import React, { useState } from "react";
import { FaUsers, FaUserPlus, FaSave, FaKey } from "react-icons/fa";
import { api, qs, dateTime, phoneFmt } from "../api";
import { useAuth, ROLE_LABEL } from "../AuthContext";
import { Card, PageHeader, StatusBadge, DataTable, Pager, SearchBox, Segmented, useLoad, useToast } from "../ui";
import Modal from "../../commerce/Modal";

const ROLES = [
  { value: "", label: "All" },
  { value: "admin", label: "Admins" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customers" },
];

const blank = { fullName: "", email: "", phone: "", role: "staff", password: "", isActive: true };

const Users = () => {
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const { data, loading, error, reload } = useLoad(() => api(`/portal/users${qs({ q: search, role, page, pageSize })}`), [search, role, page]);

  const [edit, setEdit] = useState(null); // user or {} for new
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState(null);
  const [newPw, setNewPw] = useState("");

  const open = (u) => {
    setEdit(u || {});
    setForm(u ? { ...blank, ...u, phone: u.phone || "", password: "" } : blank);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const isSelf = edit?.id === me.id;

  const save = async () => {
    setSaving(true);
    try {
      if (edit.id) {
        await api(`/portal/users/${edit.id}`, { method: "PATCH", body: { fullName: form.fullName, phone: form.phone, role: form.role, isActive: form.isActive } });
        toast("User updated");
      } else {
        await api("/portal/users", { method: "POST", body: form });
        toast(`${form.fullName} can now log in`);
      }
      setEdit(null);
      reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const resetPw = async () => {
    setSaving(true);
    try {
      await api(`/portal/users/${pw.id}/password`, { method: "POST", body: { password: newPw } });
      toast(`Password changed for ${pw.fullName}`);
      setPw(null);
      setNewPw("");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        icon={FaUsers}
        title="Users"
        subtitle="Everyone who can sign in: administrators, staff and customers."
        actions={
          <button type="button" className="ix-btn ix-btn--primary" onClick={() => open(null)}>
            <FaUserPlus aria-hidden="true" /> Add user
          </button>
        }
      />
      <Card pad={false}>
        <div className="px-toolbar">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, phone…" />
          <Segmented label="Filter by role" options={ROLES} value={role} onChange={(v) => { setRole(v); setPage(1); }} />
        </div>
        <DataTable
          loading={loading}
          error={error}
          rows={data?.rows || []}
          empty="No users match."
          onRowClick={open}
          columns={[
            { key: "fullName", label: "Name", render: (u) => (<><strong>{u.fullName}</strong>{u.id === me.id && <span className="px-tag">You</span>}<div className="px-muted px-small">{u.email}</div></>) },
            { key: "phone", label: "Phone", render: (u) => phoneFmt(u.phone) },
            { key: "role", label: "Role", render: (u) => <span className={`px-role px-role--${u.role}`}>{ROLE_LABEL[u.role]}</span> },
            { key: "isActive", label: "Status", render: (u) => <StatusBadge status={u.isActive ? "active" : "inactive"} /> },
            { key: "lastLoginAt", label: "Last login", render: (u) => (u.lastLoginAt ? dateTime(u.lastLoginAt) : <span className="px-muted">Never</span>) },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (u) => (
                <span className="px-rowactions" onClick={(e) => e.stopPropagation()} role="presentation">
                  <button type="button" className="px-iconbtn" aria-label={`Reset password for ${u.fullName}`} title="Reset password" onClick={() => setPw(u)}>
                    <FaKey />
                  </button>
                </span>
              ),
            },
          ]}
        />
        <Pager page={page} pageSize={pageSize} total={data?.total || 0} onPage={setPage} />
      </Card>

      <Modal
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        icon={edit?.id ? FaUsers : FaUserPlus}
        title={edit?.id ? `Edit ${edit.fullName}` : "Add a user"}
        subtitle={edit?.id ? edit.email : "They can sign in straight away with this email and password."}
        footer={
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--primary" onClick={save} disabled={saving || !form.fullName.trim() || (!edit?.id && (!form.email.trim() || !form.password))}>
              {saving ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save
            </button>
          </>
        }
      >
        <div className="ix-form">
          <div className="ix-form__row">
            <div className="ix-field">
              <label htmlFor="usr-name">Full name</label>
              <input id="usr-name" className="ix-input" value={form.fullName} onChange={set("fullName")} autoComplete="off" />
            </div>
            <div className="ix-field">
              <label htmlFor="usr-phone">Phone <span className="ix-field__hint">(optional)</span></label>
              <input id="usr-phone" className="ix-input" inputMode="tel" value={form.phone} onChange={set("phone")} placeholder="0712 345 678" />
            </div>
          </div>
          {!edit?.id && (
            <div className="ix-form__row">
              <div className="ix-field">
                <label htmlFor="usr-email">Email</label>
                <input id="usr-email" className="ix-input" type="email" value={form.email} onChange={set("email")} autoComplete="off" />
              </div>
              <div className="ix-field">
                <label htmlFor="usr-pw">Temporary password</label>
                <input id="usr-pw" className="ix-input" type="text" value={form.password} onChange={set("password")} autoComplete="new-password" />
                <span className="ix-field__hint">8+ characters with letters and a number.</span>
              </div>
            </div>
          )}
          <div className="ix-form__row">
            <div className="ix-field">
              <label htmlFor="usr-role">Role</label>
              <select id="usr-role" className="ix-input" value={form.role} onChange={set("role")} disabled={isSelf}>
                <option value="admin">Administrator — full access</option>
                <option value="staff">Staff — orders, SMS, catalogue</option>
                <option value="customer">Customer — own orders only</option>
              </select>
              {isSelf && <span className="ix-field__hint">You can't change your own role.</span>}
            </div>
            {edit?.id && (
              <label className="px-switch">
                <input type="checkbox" checked={form.isActive} onChange={set("isActive")} disabled={isSelf} />
                <span className="px-switch__track" aria-hidden="true" />
                Account active (can sign in)
              </label>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(pw)}
        onClose={() => { setPw(null); setNewPw(""); }}
        icon={FaKey}
        title="Reset password"
        subtitle={pw ? `Set a new password for ${pw.fullName}. Share it with them privately.` : ""}
        footer={
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => { setPw(null); setNewPw(""); }}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--primary" onClick={resetPw} disabled={saving || newPw.length < 8}>
              <FaKey aria-hidden="true" /> Set password
            </button>
          </>
        }
      >
        <div className="ix-field">
          <label htmlFor="usr-newpw">New password</label>
          <input id="usr-newpw" className="ix-input" type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
          <span className="ix-field__hint">8+ characters with letters and a number.</span>
        </div>
      </Modal>
    </>
  );
};

export default Users;
