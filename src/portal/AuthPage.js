import React, { useState } from "react";
import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
  FaShieldAlt,
  FaChartLine,
  FaSms,
  FaMoneyBillWave,
} from "react-icons/fa";
import logo from "../images/logo.png";
import ThemeToggle from "../components/Navbar/ThemeToggle";
import { useAuth } from "./AuthContext";
import { Notice } from "./ui";

const Field = ({ id, label, error, hint, children }) => (
  <div className="ix-field">
    <label htmlFor={id}>{label}</label>
    {children}
    {error ? (
      <span className="ix-field__error" id={`${id}-err`}>
        {error}
      </span>
    ) : (
      hint && <span className="ix-field__hint">{hint}</span>
    )}
  </div>
);

const AuthPage = ({ mode, navigate, next }) => {
  const { login, signup, serviceError } = useAuth();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) await signup(form);
      else await login(form.email, form.password);
      navigate(next && next.startsWith("/app") ? next : "/app", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-auth">
      <aside className="px-auth__brand">
        <a href="/" className="px-auth__back">
          <FaArrowLeft aria-hidden="true" /> Back to website
        </a>
        <div className="px-auth__brandbody">
          <img src={logo} alt="" className="px-auth__logo" />
          <h2>IKONEX Systems</h2>
          <p>Your orders, payments and business tools in one place.</p>
          <ul>
            <li><FaChartLine aria-hidden="true" /> Live dashboard of orders & M-Pesa payments</li>
            <li><FaSms aria-hidden="true" /> Bulk SMS to customers</li>
            <li><FaMoneyBillWave aria-hidden="true" /> Bulk M-Pesa payouts with approval</li>
            <li><FaShieldAlt aria-hidden="true" /> Secure, role-based access</li>
          </ul>
        </div>
      </aside>

      <main className="px-auth__main">
        <div className="px-auth__top">
          <ThemeToggle />
        </div>
        <form className="px-auth__form ix-form" onSubmit={submit} noValidate>
          <div>
            <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p className="px-muted">
              {isSignup ? "Track your orders and payments with IKONEX." : "Log in to your IKONEX dashboard."}
            </p>
          </div>

          {serviceError && <Notice tone="warn">{serviceError}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}

          {isSignup && (
            <Field id="au-name" label="Full name">
              <input id="au-name" className="ix-input" autoComplete="name" value={form.fullName} onChange={set("fullName")} required />
            </Field>
          )}
          <Field id="au-email" label="Email">
            <input id="au-email" className="ix-input" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
          </Field>
          {isSignup && (
            <Field id="au-phone" label="M-Pesa phone (optional)" hint="Used for order updates and SMS.">
              <input id="au-phone" className="ix-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={set("phone")} />
            </Field>
          )}
          <Field id="au-pass" label="Password" hint={isSignup ? "At least 8 characters with letters and a number." : undefined}>
            <div className="ix-input-group">
              <input
                id="au-pass"
                className="ix-input"
                type={show ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={form.password}
                onChange={set("password")}
                required
              />
              <button type="button" className="px-reveal" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </Field>

          <button type="submit" className="ix-btn ix-btn--primary ix-btn--block" disabled={busy}>
            {busy ? <span className="ix-spinner" aria-hidden="true" /> : isSignup ? <FaUserPlus aria-hidden="true" /> : <FaSignInAlt aria-hidden="true" />}
            {isSignup ? "Create account" : "Log in"}
          </button>

          <p className="px-auth__switch">
            {isSignup ? "Already have an account?" : "New to IKONEX?"}{" "}
            <a href={isSignup ? "#/login" : "#/signup"}>{isSignup ? "Log in" : "Create an account"}</a>
          </p>
        </form>
      </main>
    </div>
  );
};

export default AuthPage;
