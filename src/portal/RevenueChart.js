import React, { useState } from "react";
import { money } from "./api";

/**
 * 14-day revenue bars (single series → no legend; the card title names it).
 * Thin rounded bars anchored to the baseline, recessive grid, hover tooltip,
 * keyboard-focusable bars, and a visually-hidden table for screen readers.
 */
const RevenueChart = ({ series }) => {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 220;
  const pad = { t: 16, r: 8, b: 28, l: 52 };
  const max = Math.max(...series.map((d) => d.total), 0);
  const niceMax = max <= 0 ? 1000 : Math.pow(10, Math.floor(Math.log10(max))) * Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max))));
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const step = innerW / series.length;
  const barW = Math.min(26, step * 0.56);
  const y = (v) => pad.t + innerH - (v / niceMax) * innerH;
  const ticks = [0, 0.5, 1].map((f) => f * niceMax);
  const fmtShort = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : String(Math.round(v)));
  const label = (day) => new Date(`${day}T00:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short" });

  return (
    <div className="px-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue for the last 14 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="px-chart__grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="px-chart__axis">
              {fmtShort(t)}
            </text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = pad.l + i * step + (step - barW) / 2;
          const h = Math.max(d.total > 0 ? 3 : 0, (d.total / niceMax) * innerH);
          const r = Math.min(4, barW / 2, h);
          const top = pad.t + innerH - h;
          return (
            <g
              key={d.day}
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="px-chart__barg"
            >
              <rect x={pad.l + i * step} y={pad.t} width={step} height={innerH} fill="transparent" />
              {h > 0 && (
                <path
                  className={`px-chart__bar ${hover === i ? "is-hover" : ""}`}
                  d={`M${x},${pad.t + innerH} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${pad.t + innerH} Z`}
                />
              )}
              {(i % 2 === 1 || series.length <= 7) && (
                <text x={pad.l + i * step + step / 2} y={H - 8} textAnchor="middle" className="px-chart__axis">
                  {label(d.day)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + innerH} y2={pad.t + innerH} className="px-chart__base" />
      </svg>
      {hover !== null && (
        <div
          className="px-chart__tip"
          style={{ left: `${((pad.l + hover * step + step / 2) / W) * 100}%` }}
          role="status"
        >
          <strong>{money(series[hover].total)}</strong>
          <span>
            {label(series[hover].day)} · {series[hover].count} payment{series[hover].count === 1 ? "" : "s"}
          </span>
        </div>
      )}
      <table className="ix-sr-only">
        <caption>Revenue by day</caption>
        <tbody>
          {series.map((d) => (
            <tr key={d.day}>
              <th>{d.day}</th>
              <td>{money(d.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RevenueChart;
