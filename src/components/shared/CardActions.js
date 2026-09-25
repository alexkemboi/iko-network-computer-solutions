import React from "react";
import { FaArrowRight, FaShoppingCart, FaComments } from "react-icons/fa";
import { useOrder } from "../../commerce/OrderContext";

/**
 * Standard CTA pair for catalogue cards:
 *  - primary contextual action (Explore Product / View Program / Learn More…)
 *    opens the quick-view dialog
 *  - "Order" opens the M-Pesa checkout for this item
 */
export const CardActions = ({ item, primaryLabel = "Learn More", orderLabel = "Order", compact }) => {
  const { openDetails, openCheckout } = useOrder();
  const withLabel = { ...item, orderLabel };

  return (
    <div className={`ix-actions ix-card-actions ${compact ? "is-compact" : ""}`}>
      <button
        type="button"
        className="ix-link ix-card-actions__more"
        onClick={() => openDetails(withLabel)}
        aria-label={`${primaryLabel}: ${item.name}`}
      >
        {primaryLabel}
        <FaArrowRight aria-hidden="true" />
      </button>
      <button
        type="button"
        className="ix-btn ix-btn--primary ix-card-actions__order"
        onClick={() => openCheckout(withLabel)}
        aria-label={`${orderLabel} ${item.name} and pay with M-Pesa`}
      >
        <FaShoppingCart aria-hidden="true" />
        {orderLabel}
      </button>
    </div>
  );
};

/** "Need something tailored? Talk to us" strip that links to the contact form. */
export const SectionCta = ({ text, label = "Talk to us", item }) => {
  const { enquire } = useOrder();
  return (
    <div className="ix-section-cta">
      <span>{text}</span>
      <a
        href="#contact"
        className="ix-link"
        onClick={(e) => {
          e.preventDefault();
          enquire(item || null);
        }}
      >
        <FaComments aria-hidden="true" />
        {label}
        <FaArrowRight aria-hidden="true" />
      </a>
    </div>
  );
};
