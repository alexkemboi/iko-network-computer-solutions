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
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // Network failure / API not reachable
    const err = new Error("The payment service is not reachable right now.");
    err.unavailable = true;
    throw err;
  }
  let data = {};
  let isJson = true;
  try {
    data = await res.json();
  } catch (e) {
    isJson = false; // e.g. an nginx/dev-proxy error page
  }
  if (!res.ok) {
    const err = new Error(data.error || data.message || `Request failed (${res.status})`);
    err.status = res.status;
    // 404/502/503/504 or an HTML error page = API missing, down or not configured
    err.unavailable =
      res.status === 404 || res.status >= 502 || (res.status >= 500 && !isJson);
    throw err;
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

const FINAL = ["success", "failed", "cancelled"];

/**
 * Wait for the payment result in real time.
 * Listens on a Server-Sent Events stream (instant when Safaricom's callback
 * arrives) and also polls /status as a backup, which lets the server ask
 * Safaricom directly if the callback is late. Resolves with the first final
 * status, or { status: "timeout" } / { status: "aborted" }.
 */
export const waitForPayment = (
  checkoutRequestId,
  { intervalMs = 5000, timeoutMs = 120000, signal, onTick } = {}
) =>
  new Promise((resolve) => {
    let done = false;
    let source = null;
    let pollTimer = null;
    let timeoutTimer = null;

    const finish = (result) => {
      if (done) return;
      done = true;
      if (source) source.close();
      clearTimeout(pollTimer);
      clearTimeout(timeoutTimer);
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve(result);
    };

    const handle = (status) => {
      if (onTick) onTick(status);
      if (status && FINAL.includes(status.status)) finish(status);
    };

    const onAbort = () => finish({ status: "aborted" });
    if (signal) {
      if (signal.aborted) return finish({ status: "aborted" });
      signal.addEventListener("abort", onAbort);
    }

    // 1) Realtime stream
    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        source = new EventSource(
          `${API_BASE}/api/mpesa/events/${encodeURIComponent(checkoutRequestId)}`
        );
        source.onmessage = (e) => {
          try {
            handle(JSON.parse(e.data));
          } catch (err) {
            /* ignore malformed event */
          }
        };
        source.onerror = () => {
          /* the browser retries automatically; polling below covers gaps */
        };
      } catch (e) {
        source = null;
      }
    }

    // 2) Backup polling (also triggers the server's STK Query fallback)
    const poll = async () => {
      if (done) return;
      try {
        handle(await getStkStatus(checkoutRequestId));
      } catch (e) {
        /* transient network error — keep trying until timeout */
      }
      if (!done) pollTimer = setTimeout(poll, intervalMs);
    };
    pollTimer = setTimeout(poll, intervalMs);

    timeoutTimer = setTimeout(() => finish({ status: "timeout" }), timeoutMs);
  });
