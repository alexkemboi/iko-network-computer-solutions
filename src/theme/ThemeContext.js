import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const THEME_STORAGE_KEY = "ikonex-theme";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

const readStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {
    /* storage unavailable (private mode etc.) */
  }
  return null;
};

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";

  // The inline script in public/index.html already set this before first paint.
  const fromDom = document.documentElement.getAttribute("data-theme");
  if (fromDom === "light" || fromDom === "dark") return fromDom;

  const stored = readStoredTheme();
  if (stored) return stored;

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1120" : "#f6faf8");
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow OS changes only while the user hasn't chosen explicitly
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      if (!readStoredTheme()) setThemeState(e.matches ? "light" : "dark");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const setTheme = useCallback((next, origin) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }

    const root = document.documentElement;
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const commit = () => {
      applyTheme(next);
      setThemeState(next);
    };

    if (reduceMotion) {
      commit();
      return;
    }

    // Circular reveal from the toggle where the View Transitions API exists
    if (document.startViewTransition && origin) {
      const { x, y } = origin;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      root.style.setProperty("--vt-x", `${x}px`);
      root.style.setProperty("--vt-y", `${y}px`);
      root.style.setProperty("--vt-r", `${radius}px`);
      document.startViewTransition(commit);
      return;
    }

    // Fallback: short, global colour cross-fade
    root.classList.add("theme-animating");
    commit();
    window.setTimeout(() => root.classList.remove("theme-animating"), 450);
  }, []);

  const toggleTheme = useCallback(
    (origin) => setTheme(theme === "dark" ? "light" : "dark", origin),
    [theme, setTheme]
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
