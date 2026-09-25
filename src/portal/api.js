import { API_BASE } from "../commerce/config";

/** JSON request to the IKONEX API (session cookie is sent automatically). */
export async function api(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw Object.assign(new Error("Can't reach the server. Check your connection and try again."), { status: 0 });
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty or HTML response */
  }
  if (!res.ok) {
    const fallback =
      res.status === 404 || res.status === 405
        ? "The IKONEX API isn't reachable at /api (is it running?)."
        : `Request failed (${res.status})`;
    throw Object.assign(new Error(data.error || fallback), { status: res.status, data });
  }
  return data;
}

export const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const money = (v) =>
  `KES ${Number(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const dateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export const phoneFmt = (p) => (p && /^254\d{9}$/.test(p) ? `+254 ${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}` : p || "—");
