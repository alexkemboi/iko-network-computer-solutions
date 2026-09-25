import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: focus is moved in and trapped, Escape and the
 * backdrop close it, focus returns to the opener, and page scroll is locked.
 * On small screens it presents as a bottom sheet (see components.css).
 */
const Modal = ({ open, onClose, title, subtitle, icon: Icon, wide, children, footer }) => {
  const panelRef = useRef(null);
  const titleId = useRef(`dlg-${Math.random().toString(36).slice(2)}`).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const first = panel && panel.querySelector("input, select, textarea");
    (first || (panel && panel.querySelector(FOCUSABLE)) || panel)?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      if (opener && opener.focus) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="ix-modal">
      <div className="ix-modal__backdrop" onClick={onClose} aria-hidden="true"></div>
      <div
        ref={panelRef}
        className={`ix-modal__panel ${wide ? "ix-modal__panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="ix-modal__head">
          {Icon && (
            <span className="ix-icon" aria-hidden="true">
              <Icon />
            </span>
          )}
          <div>
            <h2 className="ix-modal__title" id={titleId}>
              {title}
            </h2>
            {subtitle && <p className="ix-modal__sub">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="ix-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="ix-modal__body">{children}</div>
        {footer && <div className="ix-modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
