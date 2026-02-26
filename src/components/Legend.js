/**
 * Legend.js
 *
 * RasterLegend    — gradient bar for raster overlay layers (weather extremes / farm size)
 * BreadbasketLegend — categorical swatches for the always-on base layer
 */

import { FOOD_GROUP_COLORS } from "../layers/tilesetIds";

// ── Raster overlay gradient legend ───────────────────────────────────────────
export default function RasterLegend({ config }) {
  if (!config || !config.legendColors) return null;

  const { label, unit, legendColors } = config;

  // Build CSS gradient
  const stops = legendColors.map(({ color }, i) => {
    const pct = (i / (legendColors.length - 1)) * 100;
    return `${color} ${pct}%`;
  });
  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  return (
    <div className="legend">
      <div className="legend-title">{label} ({unit})</div>
      <div className="legend-gradient" style={{ background: gradient }} />
      <div className="legend-labels">
        {legendColors.map(({ label: lbl }, i) => {
          // Show first, middle, last labels
          if (i === 0 || i === legendColors.length - 1 || i === Math.floor(legendColors.length / 2)) {
            return <span key={i}>{lbl}</span>;
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ── Breadbasket categorical legend (clickable food-group filter) ─────────────
export function BreadbasketLegend({ selectedFoodGroup, onSelectFoodGroup }) {
  const groups = Object.entries(FOOD_GROUP_COLORS);
  const hasInteracted = selectedFoodGroup !== null;

  return (
    <div className="legend legend-categorical">
      <div className="legend-title">Food Breadbaskets</div>
      <div className="legend-swatches">
        {groups.map(([key, { color, label }]) => {
          const isSelected = selectedFoodGroup === key;
          const isDimmed = selectedFoodGroup && !isSelected;
          return (
            <div
              key={key}
              className={`legend-swatch-row clickable${isDimmed ? " dimmed" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => onSelectFoodGroup(isSelected ? null : key)}
              title={isSelected ? `Click to show all groups` : `Click to show only ${label}`}
            >
              <span className="legend-swatch" style={{ background: color }} />
              <span className="legend-swatch-label">{label}</span>
            </div>
          );
        })}
      </div>
      <div className={`legend-hint${hasInteracted ? " faded" : " pulse"}`}>
        {hasInteracted ? "Click selected group to reset" : "Click a food group to filter"}
      </div>
    </div>
  );
}
