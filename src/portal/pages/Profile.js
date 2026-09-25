import React, { useState } from "react";
import { FaUserCircle, FaSave, FaLock } from "react-icons/fa";
import { api, dateTime } from "../api";
import { useAuth, ROLE_LABEL } from "../AuthContext";
import { Card, PageHeader, DL, useToast } from "../ui";

const Profile = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: user.fullName || "", phone: user.phone || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy("profile");
    try {
      const r = await api("/auth/profile", { method: "PUT", body: form });
      setUser(r.user);
      toast("Profile updated");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy("");
    }
  };

  const savePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast("The new passwords don't match", "error");
    setBusy("pw");
    try {
      await api("/auth/password", { method: "POST", body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy("");
    }
    return undefined;
  };

  return (
    <>
      <PageHeader icon={FaUserCircle} title="My profile" subtitle="Your details and sign-in password." />
      <div className="px-grid-2">
        <Card title="Details">
          <form className="ix-form" onSubmit={saveProfile}>
            <DL items={[["Email", user.email], ["Role", ROLE_LABEL[user.role]], ["Member since", dateTime(user.createdAt)]]} />
            <div className="ix-field">
              <label htmlFor="pf-name">Full name</label>
              <input id="pf-name" className="ix-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" />
            </div>
            <div className="ix-field">
              <label htmlFor="pf-phone">M-Pesa phone</label>
              <input id="pf-phone" className="ix-input" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712 345 678" autoComplete="tel" />
              <span className="ix-field__hint">Pre-filled when you check out on the website.</span>
            </div>
            <div className="px-savebar">
              <button type="submit" className="ix-btn ix-btn--primary" disabled={busy === "profile" || !form.fullName.trim()}>
                {busy === "profile" ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save
              </button>
            </div>
          </form>
        </Card>

        <Card title="Change password">
          <form className="ix-form" onSubmit={savePw}>
            <div className="ix-field">
              <label htmlFor="pf-cur">Current password</label>
              <input id="pf-cur" className="ix-input" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" />
            </div>
            <div className="ix-field">
              <label htmlFor="pf-new">New password</label>
              <input id="pf-new" className="ix-input" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" />
              <span className="ix-field__hint">8+ characters with letters and a number.</span>
            </div>
            <div className="ix-field">
              <label htmlFor="pf-confirm">Confirm new password</label>
              <input id="pf-confirm" className="ix-input" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
            </div>
            <div className="px-savebar">
              <button type="submit" className="ix-btn ix-btn--primary" disabled={busy === "pw" || !pw.currentPassword || !pw.newPassword}>
                {busy === "pw" ? <span className="ix-spinner" aria-hidden="true" /> : <FaLock aria-hidden="true" />} Change password
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default Profile;
