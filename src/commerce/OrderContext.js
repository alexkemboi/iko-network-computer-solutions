import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import CheckoutModal from "./CheckoutModal";
import DetailsModal from "./DetailsModal";

/*
 * Shared ordering state for every catalogue section.
 *
 *   const { openCheckout, openDetails, enquire } = useOrder();
 *
 * item: { name, category?, section?, icon?, description?, features?, price? }
 *  - openDetails(item)  → quick-view dialog (Explore Product / View Program)
 *  - openCheckout(item) → order + M-Pesa payment dialog
 *  - enquire(item)      → pre-selects the item in the contact form and scrolls to it
 */
const OrderContext = createContext({
  openCheckout: () => {},
  openDetails: () => {},
  enquire: () => {},
  enquiry: "",
  setEnquiry: () => {},
});

export const OrderProvider = ({ children }) => {
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [enquiry, setEnquiry] = useState("");

  const openCheckout = useCallback((item) => {
    setDetailsItem(null);
    setCheckoutItem(item);
  }, []);

  const openDetails = useCallback((item) => setDetailsItem(item), []);

  const enquire = useCallback((item) => {
    setDetailsItem(null);
    setCheckoutItem(null);
    setEnquiry(item ? item.name : "");
    const target = document.getElementById("contact");
    if (target) {
      const reduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.setTimeout(() => {
        const field = document.getElementById("contact-name");
        if (field) field.focus({ preventScroll: true });
      }, reduce ? 0 : 700);
    }
  }, []);

  const closeCheckout = useCallback(() => setCheckoutItem(null), []);
  const closeDetails = useCallback(() => setDetailsItem(null), []);

  const value = useMemo(
    () => ({ openCheckout, openDetails, enquire, enquiry, setEnquiry }),
    [openCheckout, openDetails, enquire, enquiry]
  );

  return (
    <OrderContext.Provider value={value}>
      {children}
      <DetailsModal
        item={detailsItem}
        onClose={closeDetails}
        onOrder={openCheckout}
        onEnquire={enquire}
      />
      <CheckoutModal item={checkoutItem} onClose={closeCheckout} onEnquire={enquire} />
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
