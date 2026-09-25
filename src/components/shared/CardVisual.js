import React, { useId } from "react";

/*
 * Illustrated media header for catalogue cards: a themed gradient scene with a
 * subtle technical pattern, a central icon tile and a few floating icon chips.
 * Pure SVG/CSS, so it is crisp, theme-aware and costs no image downloads.
 */

const Pattern = ({ variant, id }) => {
  switch (variant) {
    case "grid":
      return (
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      );
    case "circuit":
      return (
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <path
            d="M0 16h20l8 8h36M16 64V44l8-8h12M40 0v14l6 6h18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="28" cy="24" r="2.4" fill="currentColor" />
          <circle cx="36" cy="36" r="2.4" fill="currentColor" />
          <circle cx="46" cy="20" r="2.4" fill="currentColor" />
        </pattern>
      );
    case "waves":
      return (
        <pattern id={id} width="80" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M0 12c10-8 30-8 40 0s30 8 40 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </pattern>
      );
    case "orbits":
      return (
        <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="60" cy="60" r="22" fill="none" stroke="currentColor" />
          <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" />
          <circle cx="104" cy="60" r="3" fill="currentColor" />
          <circle cx="60" cy="38" r="2.5" fill="currentColor" />
        </pattern>
      );
    case "dots":
    default:
      return (
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="currentColor" />
        </pattern>
      );
  }
};

const CardVisual = ({
  icon: Icon,
  chips = [],
  pattern = "dots",
  badge,
  badgeIcon: BadgeIcon,
  index,
  short = false,
}) => {
  const rawId = useId();
  const patternId = `pat-${rawId.replace(/:/g, "")}`;

  return (
    <div
      className={`ix-media ${short ? "ix-media--short" : ""} ${badge ? "ix-media--badged" : ""}`}
      aria-hidden="true"
    >
      <div className="ix-media__scene">
        <svg className="ix-media__pattern" focusable="false">
          <defs>
            <Pattern variant={pattern} id={patternId} />
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
        <div className="ix-media__halo"></div>

        {chips.slice(0, 3).map((Chip, i) => (
          <span className="ix-media__chip" key={i}>
            <Chip />
          </span>
        ))}

        <span className="ix-media__tile">{Icon && <Icon />}</span>
      </div>

      {badge && (
        <span className="ix-media__badge">
          {BadgeIcon && <BadgeIcon />}
          {badge}
        </span>
      )}

      {index !== undefined && (
        <span className="ix-media__index">{String(index + 1).padStart(2, "0")}</span>
      )}
    </div>
  );
};

export default CardVisual;
