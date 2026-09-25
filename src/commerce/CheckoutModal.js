import React, { useEffect, useRef, useState } from "react";
import {
  FaMobileAlt,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaRedo,
} from "react-icons/fa";
import Modal from "./Modal";
import {
  normaliseMpesaPhone,
  formatMpesaPhone,
  requestStkPush,
  waitForPayment,
} from "./mpesa";
import {
  PAYMENTS_ENABLED,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "./config";

const initialForm = { name: "", phone: "", amount: "", notes: "" };

const makeReference = (name) =>
  `IKX-${String(name || "ORDER")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8)}`;

const buildOrderEmail = (item, form, phone) => {
  const subject = `Order request: ${item.name}`;
  const lines = [
    `Item: ${item.name}`,
    item.section ? `Section: ${item.section}` : null,
    item.category ? `Category: ${item.category}` : null,
    `Name: ${form.name}`,
    `M-Pesa number: ${formatMpesaPhone(phone) || form.phone}`,
    form.amount ? `Amount (KES): ${form.amount}` : null,
    form.notes ? `Notes: ${form.notes}` : null,
  ].filter(Boolean);
  return `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(lines.join("\n"))}`;
};

/**
 * Order & checkout dialog.
 * Collects the customer's M-Pesa number and triggers an STK push (the PIN
 * prompt on their phone) through the configured backend, then waits for the
 * payment result. When no backend is configured it says so plainly and lets
 * the customer send the order by email or call instead — no fake payment.
 */
const CheckoutModal = ({ item, onClose, onEnquire }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState("form"); // form | sending | waiting | success | failed | offline
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const abortRef = useRef(null);

  const open = Boolean(item);
  const hasFixedPrice = item && typeof item.price === "number" && item.price > 0;

  // Reset whenever a new item is opened
  useEffect(() => {
    if (!item) return;
    setForm({ ...initialForm, amount: hasFixedPrice ? String(item.price) : "" });
    setErrors({});
    setStage("form");
    setMessage("");
    setReceipt(null);
  }, [item, hasFixedPrice]);

  // Stop polling when the dialog closes
  useEffect(() => {
    if (!open && abortRef.current) abortRef.current.abort();
  }, [open]);

  useEffect(() => {
    const pending = abortRef;
    return () => {
      if (pending.current) pending.current.abort();
    };
  }, []);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!normaliseMpesaPhone(form.phone))
      next.phone = "Enter a valid Safaricom number, e.g. 0712 345 678.";
    const amt = Number(form.amount);
    if (!form.amount || !Number.isFinite(amt) || amt < 1)
      next.amount = "Enter the amount to pay in KES (minimum 1).";
    else if (!Number.isInteger(amt)) next.amount = "M-Pesa amounts must be whole shillings.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const phone = normaliseMpesaPhone(form.phone);

    if (!PAYMENTS_ENABLED) {
      setStage("offline");
      return;
    }

    setStage("sending");
    setMessage("");

    try {
      const res = await requestStkPush({
        phone,
        amount: Number(form.amount),
        reference: makeReference(item.name),
        description: item.name,
        customerName: form.name.trim(),
      });

      const checkoutRequestId = res.checkoutRequestId || res.CheckoutRequestID;
      if (!checkoutRequestId) throw new Error("The payment request was not accepted.");

      setStage("waiting");
      setMessage(res.customerMessage || res.CustomerMessage || "");

      const controller = new AbortController();
      abortRef.current = controller;
      const result = await waitForPayment(checkoutRequestId, { signal: controller.signal });

      if (result.status === "aborted") return;
      if (result.status === "success") {
        setReceipt(result.receipt || result.mpesaReceiptNumber || null);
        setStage("success");
      } else {
        setMessage(
          result.status === "timeout"
            ? "We didn't receive a confirmation in time. If you completed the payment, you'll receive an M-Pesa SMS — keep it for reference."
            : result.resultDesc || "The payment was not completed."
        );
        setStage("failed");
      }
    } catch (err) {
      setMessage(err.message || "We couldn't start the payment. Please try again.");
      setStage("failed");
    }
  };

  const phone = normaliseMpesaPhone(form.phone);
  const busy = stage === "sending" || stage === "waiting";

  const footer = (() => {
    if (!item) return null;
    if (stage === "form" || stage === "sending") {
      return (
        <>
          <button type="button" className="ix-btn ix-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="checkout-form"
            className="ix-btn ix-btn--primary"
            disabled={busy}
          >
            {stage === "sending" ? (
              <>
                <span className="ix-spinner" aria-hidden="true"></span>
                Sending prompt…
              </>
            ) : (
              <>
                <FaLock aria-hidden="true" />
                {PAYMENTS_ENABLED ? "Pay with M-Pesa" : "Continue"}
              </>
            )}
          </button>
        </>
      );
    }
    if (stage === "waiting") {
      return (
        <button type="button" className="ix-btn ix-btn--ghost" onClick={onClose}>
          Close
        </button>
      );
    }
    if (stage === "failed") {
      return (
        <>
          <button type="button" className="ix-btn ix-btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ix-btn ix-btn--primary"
            onClick={() => setStage("form")}
          >
            <FaRedo aria-hidden="true" />
            Try again
          </button>
        </>
      );
    }
    if (stage === "offline") {
      return (
        <>
          <a className="ix-btn ix-btn--ghost" href={`tel:${BUSINESS_PHONE_TEL}`}>
            <FaPhoneAlt aria-hidden="true" />
            Call us
          </a>
          <a className="ix-btn ix-btn--primary" href={buildOrderEmail(item, form, phone)}>
            <FaEnvelope aria-hidden="true" />
            Email this order
          </a>
        </>
      );
    }
    return (
      <button type="button" className="ix-btn ix-btn--primary" onClick={onClose}>
        Done
      </button>
    );
  })();

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={item && item.icon}
      title={item ? `${item.orderLabel || "Order"}: ${item.name}` : ""}
      subtitle={item && [item.section, item.category].filter(Boolean).join(" · ")}
      footer={footer}
    >
      {item && (stage === "form" || stage === "sending") && (
        <form id="checkout-form" className="ix-form" onSubmit={handleSubmit} noValidate>
          <div className="ix-field">
            <label htmlFor="co-name">Full name</label>
            <input
              id="co-name"
              className="ix-input"
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "co-name-err" : undefined}
              disabled={busy}
            />
            {errors.name && (
              <span className="ix-field__error" id="co-name-err">
                {errors.name}
              </span>
            )}
          </div>

          <div className="ix-field">
            <label htmlFor="co-phone">M-Pesa phone number</label>
            <div className="ix-input-group" data-invalid={Boolean(errors.phone)}>
              <span className="ix-input-group__addon">
                <FaMobileAlt aria-hidden="true" />
                KE
              </span>
              <input
                id="co-phone"
                className="ix-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="07XX XXX XXX"
                value={form.phone}
                onChange={update("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "co-phone-err" : "co-phone-hint"}
                disabled={busy}
              />
            </div>
            {errors.phone ? (
              <span className="ix-field__error" id="co-phone-err">
                {errors.phone}
              </span>
            ) : (
              <span className="ix-field__hint" id="co-phone-hint">
                {PAYMENTS_ENABLED
                  ? "You'll get a prompt on this phone to enter your M-Pesa PIN."
                  : "We'll use this number to confirm your order and send the M-Pesa payment request."}
              </span>
            )}
          </div>

          <div className="ix-field">
            <label htmlFor="co-amount">Amount (KES)</label>
            <input
              id="co-amount"
              className="ix-input"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.amount}
              onChange={update("amount")}
              readOnly={hasFixedPrice}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "co-amount-err" : "co-amount-hint"}
              disabled={busy}
            />
            {errors.amount ? (
              <span className="ix-field__error" id="co-amount-err">
                {errors.amount}
              </span>
            ) : (
              <span className="ix-field__hint" id="co-amount-hint">
                {hasFixedPrice
                  ? "Fixed price for this item."
                  : "Enter the amount quoted to you by IKONEX."}
              </span>
            )}
          </div>

          <div className="ix-field">
            <label htmlFor="co-notes">
              Order notes <span className="ix-field__hint">(optional)</span>
            </label>
            <textarea
              id="co-notes"
              className="ix-input"
              rows={3}
              value={form.notes}
              onChange={update("notes")}
              disabled={busy}
              style={{ minHeight: 88 }}
            />
          </div>

          <div className="ix-notice">
            <FaLock aria-hidden="true" />
            <span>
              Payment goes directly through Safaricom M-Pesa. IKONEX never asks for
              or sees your M-Pesa PIN.
            </span>
          </div>
        </form>
      )}

      {stage === "waiting" && (
        <div className="checkout-state" role="status" aria-live="polite">
          <div className="checkout-state__icon checkout-state__icon--pulse">
            <FaMobileAlt />
          </div>
          <h3>Check your phone</h3>
          <p>
            We've sent an M-Pesa prompt to <strong>{formatMpesaPhone(phone)}</strong>.
            Enter your M-Pesa PIN to pay <strong>KES {Number(form.amount).toLocaleString()}</strong>.
          </p>
          {message && <p className="checkout-state__small">{message}</p>}
          <p className="checkout-state__small">
            <span className="ix-spinner" aria-hidden="true"></span> Waiting for confirmation…
          </p>
        </div>
      )}

      {stage === "success" && (
        <div className="checkout-state" role="status" aria-live="polite">
          <div className="checkout-state__icon">
            <FaCheckCircle />
          </div>
          <h3>Payment received</h3>
          <p>
            Thank you, {form.name.split(" ")[0]}. Your payment for{" "}
            <strong>{item && item.name}</strong> was successful.
          </p>
          {receipt && (
            <p className="checkout-state__small">
              M-Pesa receipt: <strong>{receipt}</strong>
            </p>
          )}
          <p className="checkout-state__small">We'll be in touch shortly to follow up.</p>
        </div>
      )}

      {stage === "failed" && (
        <div className="ix-notice ix-notice--error" role="alert">
          <FaExclamationTriangle aria-hidden="true" />
          <span>{message || "The payment was not completed."}</span>
        </div>
      )}

      {stage === "offline" && item && (
        <div className="checkout-offline">
          <div className="ix-notice ix-notice--warn" role="status">
            <FaInfoCircle aria-hidden="true" />
            <span>
              Online M-Pesa checkout isn't switched on yet, so no payment has been
              taken. Send us this order and we'll confirm it and send the M-Pesa
              request to <strong>{formatMpesaPhone(phone)}</strong>, or call{" "}
              <a href={`tel:${BUSINESS_PHONE_TEL}`}>{BUSINESS_PHONE_DISPLAY}</a>.
            </span>
          </div>
          <button type="button" className="ix-link checkout-offline__alt" onClick={() => onEnquire(item)}>
            Or use the contact form instead
          </button>
        </div>
      )}

      <style>{`
        .checkout-state {
          text-align: center;
          padding: 12px 6px 4px;
        }

        .checkout-state__icon {
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

        .checkout-state__icon--pulse {
          animation: co-pulse 1.8s var(--ease) infinite;
        }

        @keyframes co-pulse {
          0% { box-shadow: 0 0 0 0 var(--brand-soft-2); }
          70% { box-shadow: 0 0 0 18px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }

        .checkout-state h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .checkout-state p {
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .checkout-state__small {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: .86rem;
        }

        .checkout-offline {
          display: grid;
          gap: 14px;
        }

        .checkout-offline__alt {
          justify-self: start;
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }
      `}</style>
    </Modal>
  );
};

export default CheckoutModal;
