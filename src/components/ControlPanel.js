/**
 * ControlPanel.js  --  Layer toggle sidebar
 *
 * - Each button has a descriptive hover tooltip
 * - Each active layer shows an opacity slider
 * - Percentile selector (p05 / p50 / p95) for overlay hover data
 */

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { LAYER_DESCRIPTIONS } from "../layers/tilesetIds";

const CLIMATE_LAYERS = [
  { key: "CDD",  label: "Consecutive Dry Days", unit: "% change",    color: "#d73027" },
  { key: "Rx5",  label: "Max 5-Day Rainfall",   unit: "% change",    color: "#238b45" },
  { key: "Tx35", label: "Days Tmax > 35\u00b0C",unit: "days change", color: "#fb6a4a" },
  { key: "FD",   label: "Frost Days",           unit: "days change", color: "#2171b5" },
];

const PERCENTILE_OPTIONS = [
  { key: "p05", label: "5th" },
  { key: "p50", label: "50th" },
  { key: "p95", label: "95th" },
];

function OpacitySlider({ layerKey, value, color, onChange }) {
  return (
    <div className="opacity-slider-row">
      <input
        type="range"
        className="opacity-slider"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(layerKey, parseFloat(e.target.value))}
        style={{ "--slider-color": color }}
      />
      <span className="opacity-value">{Math.round(value * 100)}%</span>
    </div>
  );
}

function LayerButton({ layerKey, label, unit, color, isActive, onToggle }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const info = LAYER_DESCRIPTIONS[layerKey];

  const handleMouseEnter = useCallback(() => {
    if (btnRef.current && info) {
      const rect = btnRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.left - 12,
      });
    }
    setShowTooltip(true);
  }, [info]);

  return (
    <div className="layer-btn-wrapper">
      <button
        ref={btnRef}
        className={`layer-btn ${isActive ? "active" : ""}`}
        style={{ "--btn-color": color }}
        onClick={() => onToggle(layerKey)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="layer-dot" />
        <span className="layer-btn-text">
          <span className="layer-btn-label">{label}</span>
          <span className="layer-btn-unit">{unit}</span>
        </span>
      </button>
      {showTooltip && info && createPortal(
        <div
          className="layer-tooltip"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translate(-100%, -50%)",
          }}
        >
          {info.text}
          {info.source && (
            <span className="tooltip-source">{info.source}</span>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ControlPanel({
  activeLayers,
  layerOpacity,
  selectedPercentile,
  onToggle,
  onOpacityChange,
  onPercentileChange,
}) {
  const breadbasketActive = activeLayers.includes("breadbaskets");
  const farmActive = activeLayers.includes("farmsize");
  const anyClimateActive = CLIMATE_LAYERS.some(
    l => activeLayers.includes(l.key)
  );

  return (
    <div className="control-panel">
      {/* Breadbasket toggle */}
      <div className="panel-section-label">Base Layer</div>

      <LayerButton
        layerKey="breadbaskets"
        label="Food Breadbaskets"
        unit="by food group"
        color="#e6a532"
        isActive={breadbasketActive}
        onToggle={onToggle}
      />
      {breadbasketActive && (
        <OpacitySlider
          layerKey="breadbaskets"
          value={layerOpacity.breadbaskets}
          color="#e6a532"
          onChange={onOpacityChange}
        />
      )}

      <hr className="panel-divider" />

      {/* Climate Extremes -- multi-select */}
      <div className="panel-section-label">Weather Extremes (SSP2-4.5)</div>

      {CLIMATE_LAYERS.map((lyr) => {
        const isActive = activeLayers.includes(lyr.key);
        return (
          <div key={lyr.key}>
            <LayerButton
              layerKey={lyr.key}
              label={lyr.label}
              unit={lyr.unit}
              color={lyr.color}
              isActive={isActive}
              onToggle={onToggle}
            />
            {isActive && (
              <OpacitySlider
                layerKey={lyr.key}
                value={layerOpacity[lyr.key]}
                color={lyr.color}
                onChange={onOpacityChange}
              />
            )}
          </div>
        );
      })}

      <hr className="panel-divider" />

      {/* Farm size overlay */}
      <div className="panel-section-label">Overlay</div>

      <LayerButton
        layerKey="farmsize"
        label="Farm Size"
        unit="dominant ha"
        color="#df65b0"
        isActive={farmActive}
        onToggle={onToggle}
      />
      {farmActive && (
        <OpacitySlider
          layerKey="farmsize"
          value={layerOpacity.farmsize}
          color="#df65b0"
          onChange={onOpacityChange}
        />
      )}

      {/* Percentile selector — switches the raster data shown */}
      {anyClimateActive && (
        <>
          <hr className="panel-divider" />
          <div className="panel-section-label">Ensemble Percentile</div>
          <div className="percentile-selector">
            {PERCENTILE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`pctl-btn ${selectedPercentile === opt.key ? "active" : ""}`}
                onClick={() => onPercentileChange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="pctl-hint">
            Switches between climate model ensemble percentiles
          </div>
        </>
      )}
    </div>
  );
}
