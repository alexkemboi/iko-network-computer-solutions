import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaComments,
} from "react-icons/fa";

import SectionHeader, { EASE } from "../shared/SectionHeader";
import { useOrder } from "../../commerce/OrderContext";
import {
  CONTACT_ENDPOINT,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "../../commerce/config";

import { developmentServices } from "../SoftwareComponent/SoftwareComponent";
import { products } from "../ProductListingComponent/ProductListingComponent";
import { creativeServices } from "../ServiceListingComponent/ServiceListingComponent";
import { cyberServices } from "../Cyber/Cyber";
import { onlineServices } from "../OnlineServices/OnlineServices";
import { trainings } from "../Training/Training";
import { researchAreas } from "../Research and Innovation/Research";

// Every existing offering, grouped for the "What do you need?" dropdown
const SERVICE_GROUPS = [
  { label: "Software Development", items: developmentServices.map((s) => s.name) },
  { label: "Software Products", items: products.map((p) => p.title) },
  { label: "Creative Services", items: creativeServices.map((s) => s.title) },
  { label: "Cyber Services", items: cyberServices.map((s) => s.name) },
  { label: "Online Services", items: onlineServices.map((s) => s.name) },
  { label: "Training", items: trainings.map((t) => t.title) },
  { label: "Research & Innovation", items: researchAreas.map((r) => r.title) },
];

const emptyForm = { name: "", email: "", phone: "", message: "" };

const Contact = () => {
  const { enquiry, setEnquiry } = useOrder();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | mailto | error
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim() && !form.phone.trim())
      next.email = "Add an email address or phone number so we can reply.";
    else if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Please enter a valid email address.";
    if (!form.message.trim()) next.message = "Tell us a little about what you need.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      service: enquiry,
      message: form.message.trim(),
    };

    if (!CONTACT_ENDPOINT) {
      // No backend configured: hand the message to the visitor's email app.
      const lines = [`Name: ${payload.name}`];
      if (payload.email) lines.push(`Email: ${payload.email}`);
      if (payload.phone) lines.push(`Phone: ${payload.phone}`);
      if (payload.service) lines.push(`Interested in: ${payload.service}`);
      lines.push("", payload.message);
      const body = lines.join("\n");
      window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
        `Website enquiry${payload.service ? `: ${payload.service}` : ""}`
      )}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("sent");
      setForm(emptyForm);
      setEnquiry("");
    } catch (err) {
      setErrorMsg(
        "Your message couldn't be sent right now. Please try again, or reach us directly by phone or email."
      );
      setStatus("error");
    }
  };

  const channels = [
    { icon: FaPhoneAlt, label: "Call us", value: BUSINESS_PHONE_DISPLAY, href: `tel:${BUSINESS_PHONE_TEL}` },
    { icon: FaEnvelope, label: "Email", value: BUSINESS_EMAIL, href: `mailto:${BUSINESS_EMAIL}` },
    { icon: FaMapMarkerAlt, label: "Visit", value: "Nairobi, Kenya" },
  ];

  return (
    <section className="ix-section ix-section--alt contact-section" id="contact">
      <div className="ix-glow ix-glow--tl"></div>

      <div className="ix-container">
        <SectionHeader
          eyebrow="GET IN TOUCH"
          icon={FaComments}
          title={
            <>
              Let's talk about <span>your project</span>
            </>
          }
        >
          Tell us what you need — a product, a service, a training programme or
          research support — and our team will get back to you.
        </SectionHeader>

        <div className="contact-grid">
          <motion.aside
            className="contact-channels"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {channels.map((c) => {
              const Icon = c.icon;
              const Inner = (
                <>
                  <span className="contact-channel__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>
                    <span className="contact-channel__label">{c.label}</span>
                    <span className="contact-channel__value">{c.value}</span>
                  </span>
                </>
              );
              return c.href ? (
                <a key={c.label} href={c.href} className="contact-channel">
                  {Inner}
                </a>
              ) : (
                <div key={c.label} className="contact-channel">
                  {Inner}
                </div>
              );
            })}
          </motion.aside>

          <motion.div
            className="ix-card contact-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          >
            {status === "sent" || status === "mailto" ? (
              <div className="contact-done" role="status" aria-live="polite">
                <span className="contact-done__icon" aria-hidden="true">
                  <FaCheckCircle />
                </span>
                <h3>{status === "sent" ? "Message sent" : "Almost there"}</h3>
                <p>
                  {status === "sent"
                    ? "Thanks for reaching out. We'll get back to you soon."
                    : "Your email app should have opened with your message ready — just press send. If it didn't open, email us at "}
                  {status === "mailto" && <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>}
                  {status === "mailto" && "."}
                </p>
                <button
                  type="button"
                  className="ix-btn ix-btn--ghost"
                  onClick={() => setStatus("idle")}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="ix-form" onSubmit={handleSubmit} noValidate>
                <div className="ix-form__row">
                  <div className="ix-field">
                    <label htmlFor="contact-name">Full name</label>
                    <input
                      id="contact-name"
                      className="ix-input"
                      autoComplete="name"
                      value={form.name}
                      onChange={update("name")}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-err" : undefined}
                    />
                    {errors.name && (
                      <span className="ix-field__error" id="contact-name-err">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="ix-field">
                    <label htmlFor="contact-phone">Phone</label>
                    <input
                      id="contact-phone"
                      className="ix-input"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="07XX XXX XXX"
                      value={form.phone}
                      onChange={update("phone")}
                    />
                  </div>
                </div>

                <div className="ix-field">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    className="ix-input"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-err" : undefined}
                  />
                  {errors.email && (
                    <span className="ix-field__error" id="contact-email-err">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="ix-field">
                  <label htmlFor="contact-service">What do you need?</label>
                  <select
                    id="contact-service"
                    className="ix-input"
                    value={enquiry}
                    onChange={(e) => setEnquiry(e.target.value)}
                  >
                    <option value="">General enquiry</option>
                    {SERVICE_GROUPS.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.items.map((name) => (
                          <option key={`${g.label}-${name}`} value={name}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="ix-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="ix-input"
                    rows={5}
                    value={form.message}
                    onChange={update("message")}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "contact-message-err" : undefined}
                  />
                  {errors.message && (
                    <span className="ix-field__error" id="contact-message-err">
                      {errors.message}
                    </span>
                  )}
                </div>

                {status === "error" && (
                  <div className="ix-notice ix-notice--error" role="alert">
                    <FaExclamationTriangle aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="ix-btn ix-btn--primary contact-submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>
                      <span className="ix-spinner" aria-hidden="true"></span>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <FaPaperPlane aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
          gap: clamp(20px, 3vw, 36px);
          align-items: start;
          max-width: 1080px;
          margin: 0 auto;
        }

        .contact-channels {
          display: grid;
          gap: 14px;
        }

        .contact-channel {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: var(--radius-lg);
          background: var(--surface);
          border: 1px solid var(--border);
          color: inherit;
          text-decoration: none;
          transition: border-color .3s var(--ease), transform .3s var(--ease), box-shadow .3s var(--ease);
        }

        a.contact-channel:hover {
          border-color: var(--brand-border);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          text-decoration: none;
        }

        .contact-channel__icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--brand-soft);
          color: var(--brand-text);
          transition: transform .4s var(--ease), background-color .3s var(--ease), color .3s var(--ease);
        }

        a.contact-channel:hover .contact-channel__icon {
          background: var(--gradient-brand);
          color: var(--on-brand);
          transform: rotate(-8deg);
        }

        .contact-channel__label {
          display: block;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-subtle);
        }

        .contact-channel__value {
          display: block;
          color: var(--heading);
          font-weight: 600;
          word-break: break-word;
        }

        .contact-card {
          padding: clamp(22px, 3vw, 36px);
        }

        .contact-card::after {
          transform: scaleX(1);
        }

        .contact-submit {
          justify-self: start;
          min-width: 190px;
        }

        .contact-done {
          text-align: center;
          padding: 24px 8px;
        }

        .contact-done__icon {
          display: grid;
          place-items: center;
          width: 72px;
          height: 72px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: var(--brand-soft);
          color: var(--brand-text);
          font-size: 1.9rem;
        }

        .contact-done h3 {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .contact-done p {
          color: var(--text-muted);
          max-width: 420px;
          margin: 0 auto 20px;
        }

        @media (max-width: 860px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .contact-channels {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .contact-submit {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
