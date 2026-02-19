/**
 * Map.js  --  Core map component
 *
 * Architecture:
 *   BASE:      Breadbasket dots (Mapbox vector tileset, bright, high-vis)
 *   OVERLAYS:  All raster layers use static PNG tiles from public/tiles/.
 *              Climate variables have 3 tile directories per var (p05/p50/p95).
 *              Farm size has a single tile directory.
 *   OPACITY:   Each layer has user-controlled opacity via slider.
 *   HOVER:     Breadbasket dots show food group + production on hover.
 */

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  BREADBASKET,
  RASTER_OVERLAYS,
  FOOD_GROUP_COLORS,
  getTileDir,
} from "../layers/tilesetIds";

mapboxgl.accessToken = window.__MAPBOX_TOKEN__;

const PERCENTILES = ["p05", "p50", "p95"];

// Climate variable keys (have percentile variants)
const CLIMATE_KEYS = ["CDD", "FD", "Rx5", "Tx35"];

// Tile base URL:
// - In development: use local tile server (avoids webpack watching 284K files)
// - In production:  use a separate GitHub Pages tile repo
const IS_PROD = process.env.NODE_ENV === "production";
const TILE_BASE = IS_PROD
  ? "https://kushankbajaj.com/exposure-tiles"
  : "http://localhost:8765";

// In dev mode, the tile server uses mbtiles names (e.g. "CDD_raster");
// in production, the static tile repo uses dir names (e.g. "CDD_p50").
// This map converts tileDir → mbtiles name for the dev tile server.
const DIR_TO_MBTILES = {
  CDD_p05: "CDD_p05_raster", CDD_p50: "CDD_raster", CDD_p95: "CDD_p95_raster",
  FD_p05:  "FD_p05_raster",  FD_p50:  "FD_raster",  FD_p95:  "FD_p95_raster",
  Rx5_p05: "Rx5_p05_raster", Rx5_p50: "Rx5_raster",  Rx5_p95: "Rx5_p95_raster",
  Tx35_p05:"Tx35_p05_raster",Tx35_p50:"Tx35_raster", Tx35_p95:"Tx35_p95_raster",
  farmsize:"farmsize_raster",
};

function tileUrl(dir) {
  const name = IS_PROD ? dir : (DIR_TO_MBTILES[dir] || dir);
  return `${TILE_BASE}/${name}/{z}/{x}/{y}.png`;
}

// -- Breadbasket dot size — brighter at low zoom  ----------------------------
const BREADBASKET_SIZE = [
  "interpolate", ["linear"], ["zoom"],
  1,  0.5,
  2,  0.7,
  3,  1.0,
  4,  1.4,
  5,  2.0,
  6,  2.8,
  7,  3.6,
  8,  4.5,
];

// -- Food-group colour match expression ----------------------------------------
function buildFoodGroupColorExpr() {
  const expr = ["match", ["get", BREADBASKET.groupKey]];
  Object.entries(FOOD_GROUP_COLORS).forEach(([key, { color }]) => {
    expr.push(key, color);
  });
  expr.push("#444444");
  return expr;
}

// ---- Sources ----------------------------------------------------------------
function addAllSources(m) {
  // Breadbasket vector source (Mapbox-hosted)
  m.addSource("breadbaskets", {
    type: "vector",
    url: `mapbox://${BREADBASKET.id}`,
  });

  // Climate variables: 3 raster sources each (p05, p50, p95)
  for (const key of CLIMATE_KEYS) {
    for (const pctl of PERCENTILES) {
      const dir = getTileDir(key, pctl);
      m.addSource(`raster-${key.toLowerCase()}-${pctl}`, {
        type: "raster",
        tiles: [tileUrl(dir)],
        tileSize: 512,
        minzoom: 1,
        maxzoom: 7,
      });
    }
  }

  // Farm size: single raster source
  const fsDir = getTileDir("farmsize");
  m.addSource("raster-farmsize", {
    type: "raster",
    tiles: [tileUrl(fsDir)],
    tileSize: 512,
    minzoom: 1,
    maxzoom: 7,
  });
}

// ---- Layers -----------------------------------------------------------------
function addAllLayers(m) {
  // --- Breadbasket dots (bright, high-vis) -----------------------------------
  m.addLayer({
    id: "breadbaskets-layer",
    type: "circle",
    source: "breadbaskets",
    "source-layer": BREADBASKET.layer,
    layout: { visibility: "visible" },
    paint: {
      "circle-radius":         BREADBASKET_SIZE,
      "circle-color":          buildFoodGroupColorExpr(),
      "circle-opacity":        1.0,
      "circle-stroke-width":   [
        "interpolate", ["linear"], ["zoom"],
        1, 0.6,
        4, 0.4,
        8, 0.2,
      ],
      "circle-stroke-color":   "#ffffff",
      "circle-stroke-opacity": 0.5,
      "circle-blur":           0.0,
    },
  });

  // --- Climate raster layers (3 per variable) --------------------------------
  for (const key of CLIMATE_KEYS) {
    for (const pctl of PERCENTILES) {
      m.addLayer({
        id: `raster-${key.toLowerCase()}-${pctl}`,
        type: "raster",
        source: `raster-${key.toLowerCase()}-${pctl}`,
        layout: { visibility: "none" },
        paint: {
          "raster-opacity": 0.65,
          "raster-fade-duration": 150,
        },
      });
    }
  }

  // --- Farm size raster layer ------------------------------------------------
  m.addLayer({
    id: "raster-farmsize",
    type: "raster",
    source: "raster-farmsize",
    layout: { visibility: "none" },
    paint: {
      "raster-opacity": 0.65,
      "raster-fade-duration": 150,
    },
  });
}

// ---- Hover/tooltip setup ----------------------------------------------------
function setupHoverEvents(m, popupRef, activeLayersRef) {
  m.on("mouseenter", "breadbaskets-layer", (e) => {
    if (!activeLayersRef.current.includes("breadbaskets")) return;
    m.getCanvas().style.cursor = "crosshair";
    if (!e.features?.length) return;
    const props = e.features[0].properties;
    const fg = FOOD_GROUP_COLORS[props[BREADBASKET.groupKey]] || {
      label: props[BREADBASKET.groupKey],
      color: "#888",
    };
    popupRef.current
      .setLngLat(e.lngLat)
      .setHTML(
        `<div class="popup-title">
          <span class="popup-swatch" style="background:${fg.color}"></span>
          ${fg.label}
        </div>
        <div class="popup-row">
          <span class="popup-key">Production</span>
          <span class="popup-value">${Number(props[BREADBASKET.valueKey] || 0).toLocaleString()}</span>
        </div>`
      )
      .addTo(m);
  });

  m.on("mouseleave", "breadbaskets-layer", () => {
    m.getCanvas().style.cursor = "";
    popupRef.current.remove();
  });
}

// =============================================================================
export default function Map({
  activeLayers,
  layerOpacity,
  selectedPercentile,
  onLegendChange,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const readyRef = useRef(false);
  const activeLayersRef = useRef(activeLayers);

  useEffect(() => {
    activeLayersRef.current = activeLayers;
  }, [activeLayers]);

  // -- Init -------------------------------------------------------------------
  useEffect(() => {
    if (mapRef.current) return;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 2,
      minZoom: 1,
      maxZoom: 8,
      projection: "globe",
      antialias: true,
    });

    mapRef.current = m;

    m.on("style.load", () => {
      m.setFog({
        color:            "rgb(12, 15, 22)",
        "high-color":     "rgb(14, 18, 28)",
        "horizon-blend":  0.008,
        "space-color":    "rgb(6, 8, 14)",
        "star-intensity": 0.4,
      });

      // Lighten the basemap land & water for better data contrast
      const style = m.getStyle();
      if (style && style.layers) {
        for (const layer of style.layers) {
          if (layer.id === "land" && layer.type === "background") {
            m.setPaintProperty("land", "background-color", "#1e2430");
          }
          if (layer.id === "water" && layer.type === "fill") {
            m.setPaintProperty("water", "fill-color", "#141a26");
          }
          if (layer.id.includes("landuse") || layer.id.includes("landcover")) {
            if (layer.type === "fill") {
              m.setPaintProperty(layer.id, "fill-opacity", 0.3);
            }
          }
          if (layer.id.includes("admin") && layer.type === "line") {
            m.setPaintProperty(layer.id, "line-opacity", 0.25);
          }
        }
      }

      addAllSources(m);
      addAllLayers(m);
      setupHoverEvents(m, popupRef, activeLayersRef);
      readyRef.current = true;
    });

    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "320px",
    });

    m.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    return () => {
      m.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line

  // -- Sync visibility, opacity, and percentile selection ----------------------
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !readyRef.current) return;

    const pctl = selectedPercentile || "p50";
    const bbActive = activeLayers.includes("breadbaskets");

    // --- Breadbasket ---
    if (m.getLayer("breadbaskets-layer")) {
      m.setLayoutProperty(
        "breadbaskets-layer",
        "visibility",
        bbActive ? "visible" : "none"
      );
      if (bbActive) {
        m.setPaintProperty(
          "breadbaskets-layer",
          "circle-opacity",
          layerOpacity.breadbaskets
        );
        m.setPaintProperty(
          "breadbaskets-layer",
          "circle-stroke-opacity",
          layerOpacity.breadbaskets * 0.5
        );
      }
    }

    // --- Climate raster layers (show only the selected percentile) ---
    for (const key of CLIMATE_KEYS) {
      const isActive = activeLayers.includes(key);
      for (const p of PERCENTILES) {
        const lid = `raster-${key.toLowerCase()}-${p}`;
        if (!m.getLayer(lid)) continue;

        const shouldShow = isActive && p === pctl;
        m.setLayoutProperty(lid, "visibility", shouldShow ? "visible" : "none");

        if (shouldShow) {
          m.setPaintProperty(lid, "raster-opacity", layerOpacity[key] ?? 0.65);
        }
      }
    }

    // --- Farm size (no percentile variants) ---
    const fsLid = "raster-farmsize";
    const fsActive = activeLayers.includes("farmsize");
    if (m.getLayer(fsLid)) {
      m.setLayoutProperty(fsLid, "visibility", fsActive ? "visible" : "none");
      if (fsActive) {
        m.setPaintProperty(fsLid, "raster-opacity", layerOpacity.farmsize ?? 0.65);
      }
    }

    // --- Update legend ---
    const activeOverlays = Object.keys(RASTER_OVERLAYS).filter((k) =>
      activeLayers.includes(k)
    );
    if (onLegendChange) {
      onLegendChange(
        activeOverlays.length
          ? RASTER_OVERLAYS[activeOverlays[activeOverlays.length - 1]]
          : null
      );
    }
  }, [activeLayers, layerOpacity, selectedPercentile, onLegendChange]);

  return <div ref={mapContainer} id="map" />;
}
