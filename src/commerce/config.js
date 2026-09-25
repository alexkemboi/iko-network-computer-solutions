/*
 * Runtime configuration for orders, payments and the contact form.
 * Set these in a `.env` file at the project root (see `.env.example`) and
 * restart `npm start` / rebuild for them to take effect.
 */

// Base URL of the payments/contact backend, e.g. https://api.ikonexsystems.com
// Leave empty to disable online M-Pesa payment (orders fall back to email).
export const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

// Optional dedicated endpoint for the contact form (POST JSON).
// If empty and API_BASE is set, `${API_BASE}/api/contact` is used.
// If neither is set, the form opens the visitor's email app instead.
export const CONTACT_ENDPOINT =
  process.env.REACT_APP_CONTACT_ENDPOINT || (API_BASE ? `${API_BASE}/api/contact` : "");

// Existing business contact details (from the site footer)
export const BUSINESS_EMAIL = "info@ikonexsystems.com";
export const BUSINESS_PHONE_DISPLAY = "+254 787 088 567";
export const BUSINESS_PHONE_TEL = "+254787088567";

export const PAYMENTS_ENABLED = Boolean(API_BASE);
