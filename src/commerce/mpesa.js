import { API_BASE } from "./config";

/**
 * Normalise a Kenyan mobile number to the 2547XXXXXXXX / 2541XXXXXXXX format
 * that M-Pesa (Daraja) expects. Returns null when the number is not valid.
 * Accepts: 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX, 2547XXXXXXXX, +254 7XX XXX XXX
 */
export const normaliseMpesaPhone = (input) => {
  const digits = String(input || "").replace(/[\s\-()]/g, "");
  const match = digits.match(/^(?:\+?254|0)?([17]\d{8})$/);
  return match ? `254${match[1]}` : null;
};

export const formatMpesaPhone = (normalised) =>
  normalised
    ? `+${normalised.slice(0, 3)} ${normalised.slice(3, 6)} ${normalised.slice(
        6,
        9
      )} ${normalised.slice(9)}`
    : "";

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
};

/**
 * Ask the backend to send an STK push (the "enter your M-Pesa PIN" prompt)
 * to the customer's phone. Resolves with { checkoutRequestId, customerMessage }.
 */
export const requestStkPush = ({ phone, amount, reference, description, customerName }) =>
  postJson(`${API_BASE}/api/mpesa/stkpush`, {
    phone,
    amount,
    reference,
    description,
    customerName,
  });

/** Fetch the latest status of an STK push: pending | success | failed | cancelled */
export const getStkStatus = async (checkoutRequestId) => {
  const res = await fetch(
    `${API_BASE}/api/mpesa/status/${encodeURIComponent(checkoutRequestId)}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Status check failed (${res.status})`);
  return data;
};

/**
 * Poll until the payment settles or the timeout passes.
 * `onTick` receives each status response.
 */
export const waitForPayment = async (
  checkoutRequestId,
  { intervalMs = 4000, timeoutMs = 120000, signal, onTick } = {}
) => {
  const started = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal && signal.aborted) return { status: "aborted" };
    await new Promise((r) => setTimeout(r, intervalMs));
    if (signal && signal.aborted) return { status: "aborted" };

    try {
      const status = await getStkStatus(checkoutRequestId);
      if (onTick) onTick(status);
      if (status.status && status.status !== "pending") return status;
    } catch (e) {
      /* transient network error — keep polling until timeout */
    }

    if (Date.now() - started > timeoutMs) return { status: "timeout" };
  }
};
