import React from "react";

/*
 * Illustrated media header for catalogue cards: a themed gradient scene with a
 * central icon tile and a few floating icon chips.
 * Pure CSS, so it is crisp, theme-aware and costs no image downloads.
 */

const CardVisual = ({
  icon: Icon,
  chips = [],
  badge,
  badgeIcon: BadgeIcon,
  index,
  short = false,
}) => {
  return (
    <div
      className={`ix-media ${short ? "ix-media--short" : ""} ${badge ? "ix-media--badged" : ""}`}
      aria-hidden="true"
    >
      <div className="ix-media__scene">
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
