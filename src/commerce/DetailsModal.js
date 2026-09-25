import React from "react";
import { FaCheckCircle, FaShoppingCart, FaEnvelopeOpenText } from "react-icons/fa";
import Modal from "./Modal";

/** Quick-view dialog used by "Explore Product" and "View Program". */
const DetailsModal = ({ item, onClose, onOrder, onEnquire }) => {
  const open = Boolean(item);

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      icon={item && item.icon}
      title={item ? item.name : ""}
      subtitle={item && [item.section, item.category].filter(Boolean).join(" · ")}
      footer={
        item && (
          <>
            <button
              type="button"
              className="ix-btn ix-btn--ghost"
              onClick={() => onEnquire(item)}
            >
              <FaEnvelopeOpenText aria-hidden="true" />
              Ask a question
            </button>
            <button
              type="button"
              className="ix-btn ix-btn--primary"
              onClick={() => onOrder(item)}
            >
              <FaShoppingCart aria-hidden="true" />
              {item.orderLabel || "Order & Pay"}
            </button>
          </>
        )
      }
    >
      {item && (
        <>
          {item.description && (
            <p className="details-desc">{item.description}</p>
          )}

          {item.features && item.features.length > 0 && (
            <>
              <h3 className="details-heading">
                {item.featuresLabel || "Key capabilities"}
              </h3>
              <ul className="ix-list details-list">
                {item.features.map((f) => (
                  <li key={f}>
                    <FaCheckCircle aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}

          <style>{`
            .details-desc {
              color: var(--text-muted);
              line-height: 1.75;
              margin: 0 0 20px;
            }

            .details-heading {
              font-size: .78rem;
              font-weight: 700;
              letter-spacing: .12em;
              text-transform: uppercase;
              color: var(--text-subtle);
              margin: 0 0 14px;
            }

            .details-list {
              grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
              padding: 18px;
              border-radius: 16px;
              background: var(--surface-strong);
              margin: 0;
            }
          `}</style>
        </>
      )}
    </Modal>
  );
};

export default DetailsModal;
