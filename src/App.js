/**
 * App.js  --  Root application component
 *
 * - Breadbaskets toggleable (on by default)
 * - Weather extremes multi-select with raster overlays
 * - Each layer has opacity slider
 * - Percentile selector (p05/p50/p95) for hover tooltip data
 */

import { useState, useCallback, useEffect } from "react";
import Map from "./components/Map";
import ControlPanel from "./components/ControlPanel";
import RasterLegend, { BreadbasketLegend } from "./components/Legend";
import "./styles/global.css";

const DEFAULT_ACTIVE = ["breadbaskets"];

const DEFAULT_OPACITY = {
  breadbaskets: 1.0,
  CDD: 0.65,
  FD: 0.65,
  Rx5: 0.65,
  Tx35: 0.65,
  farmsize: 0.65,
};

export default function App() {
  const [activeLayers,      setActiveLayers]      = useState(DEFAULT_ACTIVE);
  const [layerOpacity,      setLayerOpacity]      = useState(DEFAULT_OPACITY);
  const [selectedPercentile, setSelectedPercentile] = useState("p50");
  const [legendConfig,      setLegendConfig]      = useState(null);
  const [mapLoaded,         setMapLoaded]         = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMapLoaded(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const handleToggle = useCallback((key) => {
    setActiveLayers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleOpacityChange = useCallback((key, value) => {
    setLayerOpacity((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePercentileChange = useCallback((pctl) => {
    setSelectedPercentile(pctl);
  }, []);

  const breadbasketActive = activeLayers.includes("breadbaskets");

  return (
    <>
      {/* Loading overlay */}
      <div className={`loading-overlay ${mapLoaded ? "hidden" : ""}`}>
        <div className="loading-spinner" />
        <div className="loading-text">Loading global agriculture data…</div>
      </div>

      {/* Header */}
      <div className="app-header">
        <div className="app-title">
          Global Agriculture
          <br />
          Exposure to Weather Extremes
        </div>
        <div className="app-subtitle">
          CMIP6 · SSP2-4.5 · 2°C GMT compared to now
        </div>
      </div>

      {/* Map */}
      <Map
        activeLayers={activeLayers}
        layerOpacity={layerOpacity}
        selectedPercentile={selectedPercentile}
        onLegendChange={setLegendConfig}
      />

      {/* Layer controls */}
      <ControlPanel
        activeLayers={activeLayers}
        layerOpacity={layerOpacity}
        selectedPercentile={selectedPercentile}
        onToggle={handleToggle}
        onOpacityChange={handleOpacityChange}
        onPercentileChange={handlePercentileChange}
      />

      {/* Legends */}
      <div className="legend-stack">
        <RasterLegend config={legendConfig} />
        {breadbasketActive && <BreadbasketLegend />}
      </div>

      {/* Scenario badge */}
      <div className="scenario-badge">SSP2-4.5 · CMIP6 Ensemble · 2°C GMT</div>
    </>
  );
}
