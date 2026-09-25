import { useCallback, useEffect, useState } from "react";

/** Portal routes live in the URL hash (#/login, #/app/orders?id=3) — works on any static host. */
export const readHash = () => {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  return { path, query: new URLSearchParams(query) };
};

export const isPortalHash = () => /^#\/(login|signup|app)(\/|\?|$)/.test(window.location.hash);

export function useHashRoute() {
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const onChange = () => setRoute(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to, { replace } = {}) => {
    const target = to.startsWith("#") ? to : `#${to}`;
    if (target === window.location.hash) return;
    if (replace) {
      window.history.replaceState(null, "", target);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = target; // fires hashchange for every listener
    }
    window.scrollTo(0, 0);
  }, []);

  return [route, navigate];
}
