import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../theme/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`theme-switch ${isDark ? "is-dark" : "is-light"} ${className}`}
      onClick={handleClick}
    >
      <span className="theme-switch__track-icon theme-switch__track-icon--sun" aria-hidden="true">
        <FaSun />
      </span>
      <span className="theme-switch__track-icon theme-switch__track-icon--moon" aria-hidden="true">
        <FaMoon />
      </span>
      <span className="theme-switch__knob" aria-hidden="true">
        <FaSun className="theme-switch__icon theme-switch__icon--sun" />
        <FaMoon className="theme-switch__icon theme-switch__icon--moon" />
      </span>

      <style>{`
        .theme-switch {
          position: relative;
          flex-shrink: 0;
          width: 64px;
          height: 34px;
          padding: 0;
          border-radius: 999px;
          border: 1px solid var(--border-strong);
          background: var(--surface-strong);
          cursor: pointer;
          transition: background-color .35s var(--ease), border-color .35s var(--ease), box-shadow .35s var(--ease);
        }

        .theme-switch:hover {
          border-color: var(--brand-border);
          box-shadow: 0 0 0 4px var(--brand-soft);
        }

        .theme-switch__track-icon {
          position: absolute;
          top: 50%;
          display: flex;
          font-size: .72rem;
          color: var(--text-subtle);
          transform: translateY(-50%);
          transition: opacity .3s var(--ease);
        }

        .theme-switch__track-icon--sun { left: 10px; }
        .theme-switch__track-icon--moon { right: 10px; }

        .theme-switch.is-light .theme-switch__track-icon--sun,
        .theme-switch.is-dark .theme-switch__track-icon--moon {
          opacity: 0;
        }

        .theme-switch__knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(15, 23, 42, .25);
          transition: transform .5s var(--ease), background-color .4s var(--ease);
        }

        .theme-switch.is-dark .theme-switch__knob {
          transform: translateX(30px);
          background: #1e293b;
          box-shadow: 0 2px 10px rgba(0, 0, 0, .5), inset 0 0 0 1px rgba(148, 163, 184, .2);
        }

        .theme-switch__icon {
          grid-area: 1 / 1;
          font-size: .8rem;
          transition: transform .5s var(--ease), opacity .3s var(--ease);
        }

        .theme-switch__icon--sun {
          color: #f59e0b;
        }

        .theme-switch__icon--moon {
          color: #6ee7b7;
        }

        .theme-switch.is-light .theme-switch__icon--moon,
        .theme-switch.is-dark .theme-switch__icon--sun {
          opacity: 0;
          transform: rotate(-90deg) scale(.4);
        }

        .theme-switch.is-light .theme-switch__icon--sun,
        .theme-switch.is-dark .theme-switch__icon--moon {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
