import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaInbox,
  FaClock,
  FaTimesCircle,
  FaBan,
  FaSyncAlt,
  FaPaperPlane,
  FaCircle,
} from "react-icons/fa";

// ------------------------------------------------------------------ toasts
const ToastContext = createContext(() => {});
export const ToastProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t, { id, message, tone }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="px-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`px-toast px-toast--${t.tone}`}>
            {t.tone === "error" ? <FaExclamationTriangle aria-hidden="true" /> : <FaCheckCircle aria-hidden="true" />}
            <span>{t.message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setItems((x) => x.filter((y) => y.id !== t.id))}>
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);

// ------------------------------------------------------------------ layout bits
export const PageHeader = ({ title, subtitle, actions, icon: Icon }) => (
  <div className="px-pagehead">
    <div className="px-pagehead__text">
      <h1>
        {Icon && (
          <span className="px-pagehead__icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        {title}
      </h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="px-pagehead__actions">{actions}</div>}
  </div>
);

export const Card = ({ title, action, children, className = "", pad = true }) => (
  <section className={`px-card ${pad ? "" : "px-card--flush"} ${className}`}>
    {(title || action) && (
      <header className="px-card__head">
        {title && <h2>{title}</h2>}
        {action}
      </header>
    )}
    {children}
  </section>
);

export const Stat = ({ label, value, hint, icon: Icon, tone = "brand" }) => (
  <div className={`px-stat px-stat--${tone}`}>
    <div className="px-stat__top">
      <span className="px-stat__label">{label}</span>
      {Icon && (
        <span className="px-stat__icon" aria-hidden="true">
          <Icon />
        </span>
      )}
    </div>
    <div className="px-stat__value">{value}</div>
    {hint && <div className="px-stat__hint">{hint}</div>}
  </div>
);

// ------------------------------------------------------------------ status badge
const STATUS = {
  paid: ["good", FaCheckCircle, "Paid"],
  success: ["good", FaCheckCircle, "Successful"],
  completed: ["good", FaCheckCircle, "Completed"],
  delivered: ["good", FaCheckCircle, "Delivered"],
  sent: ["info", FaPaperPlane, "Sent"],
  processing: ["info", FaSyncAlt, "Processing"],
  sending: ["info", FaSyncAlt, "Sending"],
  pending: ["warn", FaClock, "Pending"],
  queued: ["warn", FaClock, "Queued"],
  draft: ["neutral", FaCircle, "Draft"],
  failed: ["bad", FaTimesCircle, "Failed"],
  cancelled: ["neutral", FaBan, "Cancelled"],
  completed_with_errors: ["warn", FaExclamationTriangle, "Completed with errors"],
  active: ["good", FaCheckCircle, "Active"],
  inactive: ["neutral", FaBan, "Inactive"],
};
export const StatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase();
  const [tone, Icon, label] = STATUS[key] || (/(fail|reject|invalid|blacklist|insufficient|absent)/i.test(key) ? ["bad", FaTimesCircle, status] : ["neutral", FaCircle, status || "—"]);
  return (
    <span className={`px-badge px-badge--${tone}`}>
      <Icon aria-hidden="true" />
      {label}
    </span>
  );
};

// ------------------------------------------------------------------ toolbar
export const SearchBox = ({ value, onChange, placeholder = "Search…" }) => {
  const [text, setText] = useState(value || "");
  const timer = useRef(null);
  useEffect(() => setText(value || ""), [value]);
  return (
    <label className="px-search">
      <span className="ix-sr-only">{placeholder}</span>
      <FaSearch aria-hidden="true" />
      <input
        type="search"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => onChange(v), 300);
        }}
      />
    </label>
  );
};

export const Segmented = ({ options, value, onChange, label }) => (
  <div className="px-seg" role="group" aria-label={label}>
    {options.map((o) => (
      <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
        {o.label}
      </button>
    ))}
  </div>
);

// ------------------------------------------------------------------ table
export const DataTable = ({ columns, rows, loading, error, empty = "Nothing here yet.", onRowClick, rowKey = "id" }) => {
  if (error) return <div className="px-empty px-empty--error"><FaExclamationTriangle aria-hidden="true" />{error}</div>;
  return (
    <div className="px-tablewrap">
      <table className="px-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || "left", width: c.width }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`sk${i}`} className="px-skeleton-row">
                {columns.map((c) => (
                  <td key={c.key}>
                    <span className="px-skeleton" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading &&
            rows.map((r) => (
              <tr
                key={r[rowKey]}
                className={onRowClick ? "is-clickable" : ""}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                onKeyDown={onRowClick ? (e) => (e.key === "Enter" ? onRowClick(r) : null) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} data-label={c.label} style={{ textAlign: c.align || "left" }}>
                    {c.render ? c.render(r) : r[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (
        <div className="px-empty">
          <FaInbox aria-hidden="true" />
          {empty}
        </div>
      )}
    </div>
  );
};

export const Pager = ({ page, pageSize, total, onPage }) => {
  const pages = Math.max(1, Math.ceil((total || 0) / pageSize));
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="px-pager">
      <span>
        {from}–{to} of {total.toLocaleString()}
      </span>
      <div>
        <button type="button" className="px-iconbtn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <FaChevronLeft />
        </button>
        <button type="button" className="px-iconbtn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ data hook
/** Load a list endpoint; re-runs when deps change. Returns {data, loading, error, reload}. */
export function useLoad(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    loader()
      .then((data) => alive && setState({ data, loading: false, error: "" }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

// ------------------------------------------------------------------ side drawer
export const Drawer = ({ open, onClose, title, subtitle, children, footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="px-drawer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="px-drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="px-drawer__panel">
        <header className="px-drawer__head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="px-iconbtn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </header>
        <div className="px-drawer__body">{children}</div>
        {footer && <footer className="px-drawer__foot">{footer}</footer>}
      </aside>
    </div>
  );
};

export const DL = ({ items }) => (
  <dl className="px-dl">
    {items.filter(Boolean).map(([k, v]) => (
      <React.Fragment key={k}>
        <dt>{k}</dt>
        <dd>{v ?? "—"}</dd>
      </React.Fragment>
    ))}
  </dl>
);

export const Notice = ({ tone = "info", children, icon: Icon = FaExclamationTriangle }) => (
  <div className={`px-notice px-notice--${tone}`}>
    <Icon aria-hidden="true" />
    <div>{children}</div>
  </div>
);
