/*
 * Runtime configuration for orders, payments and the contact form.
 * Values come from `.env` files at the project root and are
 * baked in at build time (`npm run build`). They are PUBLIC — never put
 * Daraja keys here; those belong in server/.env only.
 */

// Where the IKONEX API (server/mpesa-server.mjs) lives.
// Empty = same site (the API is served under /api on the same domain via nginx,
// or by the React dev server itself when running `npm start`).
export const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

const falsy = (v) => /^(0|false|no|off)$/i.test(String(v || "").trim());

// Live M-Pesa Express (STK push) checkout — ON unless REACT_APP_MPESA_ENABLED=false.
// `npm start` serves the API itself (src/setupProxy.js); production uses nginx → API.
// If the API is unreachable or its keys aren't set, checkout falls back to
// "email this order" and the reason is logged in the browser console.
export const PAYMENTS_ENABLED = !falsy(process.env.REACT_APP_MPESA_ENABLED);

// Contact form destination: explicit endpoint, else the IKONEX API when it is
// enabled, else the visitor's email app (mailto).
export const CONTACT_ENDPOINT =
  process.env.REACT_APP_CONTACT_ENDPOINT ||
  (PAYMENTS_ENABLED ? `${API_BASE}/api/contact` : "");

// Existing business contact details (from the site footer)
export const BUSINESS_EMAIL = "info@ikonexsystems.com";
export const BUSINESS_PHONE_DISPLAY = "+254 787 088 567";
export const BUSINESS_PHONE_TEL = "+254787088567";
