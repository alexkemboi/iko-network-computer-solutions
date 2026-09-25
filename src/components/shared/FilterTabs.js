import React from "react";

/** Pill-style category filter. Uses toggle buttons (aria-pressed). */
const FilterTabs = ({ options, value, onChange, label }) => (
  <div className="ix-tabs" role="group" aria-label={label}>
    {options.map((opt) => {
      const Icon = opt.icon;
      return (
        <button
          key={opt.value}
          type="button"
          className="ix-tab"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {Icon && <Icon aria-hidden="true" />}
          {opt.label}
          {typeof opt.count === "number" && (
            <span className="ix-tab__count">{opt.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default FilterTabs;
