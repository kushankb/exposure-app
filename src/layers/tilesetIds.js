/**
 * Tileset IDs & Layer Configuration
 * -----------------------------------------
 * Breadbaskets  = Mapbox-hosted vector tileset (dot layer by food group)
 * Weather extremes + farm size = static PNG raster tiles shipped with the app
 * Each climate variable has p05/p50/p95 tile directories; percentile selector switches them.
 */

// -- Food group colour palette (bright for dark backgrounds) -----------------
export const FOOD_GROUP_COLORS = {
  grains:           { color: "#f5c542", label: "Grains" },
  meat_and_fish:    { color: "#ff6b6b", label: "Meat & Fish" },
  dairy_and_eggs:   { color: "#fff06a", label: "Dairy & Eggs" },
  fruits:           { color: "#7dde60", label: "Fruits" },
  vegetables:       { color: "#3dcc3d", label: "Vegetables" },
  oils_and_oilseed: { color: "#e89840", label: "Oils & Oilseeds" },
  pulses:           { color: "#c4855c", label: "Pulses" },
  starchy_roots:    { color: "#d49ce8", label: "Starchy Roots" },
  treenuts:         { color: "#5ea54a", label: "Tree Nuts" },
  other:            { color: "#aaaaaa", label: "Other" },
};

// -- Breadbasket (vector tile -- toggleable base layer) -----------------------
export const BREADBASKET = {
  id: "plotline.cndbsry2",
  layer: "prod_overview",
  label: "Food Breadbaskets",
  groupKey: "max_food_group",
  valueKey: "max_food_group_value",
};

// -- Layer descriptions (for button hover tooltips) ---------------------------
// Each entry has `text` (main description) and optional `source` (citation).
export const LAYER_DESCRIPTIONS = {
  breadbaskets: {
    text: "Global food production areas coloured by dominant food group (grains, fruits, meat, etc.).",
    source: "Data: Plotline breadbasket dataset",
  },
  CDD: {
    text: "Change in maximum consecutive dry days during the growing season under 2\u00b0C warming. Positive = more drought stress.",
    source: "Bajaj et al. 2025, Environ. Res. Lett.",
  },
  FD: {
    text: "Absolute change in frost days (Tmin < 0\u00b0C) during the growing season under 2\u00b0C warming. Negative = fewer frosts.",
    source: "Bajaj et al. 2025, Environ. Res. Lett.",
  },
  Rx5: {
    text: "Change in maximum 5-day cumulative precipitation during the growing season under 2\u00b0C warming. Positive = heavier extreme rainfall.",
    source: "Bajaj et al. 2025, Environ. Res. Lett.",
  },
  Tx35: {
    text: "Change in days when Tmax exceeds 35\u00b0C during the growing season under 2\u00b0C warming. Positive = more extreme heat days.",
    source: "Bajaj et al. 2025, Environ. Res. Lett.",
  },
  farmsize: {
    text: "Dominant farm size (hectares). Smaller values indicate smallholder-dominated areas.",
    source: "Mehrabi & Ricciardi 2024 (doi:10.7927/WVJE-SN95)",
  },
};

// -- Raster overlays (weather extremes + farm size) ---------------------------
// All raster tiles are static PNGs in public/tiles/{tileDir}/{z}/{x}/{y}.png
// Climate variables have 3 tile directories (p05/p50/p95); farm size has one.
export const RASTER_OVERLAYS = {
  CDD: {
    tileDir: {
      p05: "CDD_p05",
      p50: "CDD_p50",
      p95: "CDD_p95",
    },
    label: "Consecutive Dry Days",
    description: "% change in CDD during growing season (CMIP6 SSP2-4.5)",
    unit: "% change",
    legendColors: [
      { value: -50,  color: "#2166ac", label: "-50%" },
      { value:   0,  color: "#f7f7f7", label: "0%" },
      { value:  50,  color: "#d73027", label: "+50%" },
      { value: 100,  color: "#7f0000", label: "+100%" },
    ],
  },
  FD: {
    tileDir: {
      p05: "FD_p05",
      p50: "FD_p50",
      p95: "FD_p95",
    },
    label: "Frost Days",
    description: "Absolute change in frost days (CMIP6 SSP2-4.5)",
    unit: "days change",
    legendColors: [
      { value: -100, color: "#08306b", label: "-100d" },
      { value: -50,  color: "#2171b5", label: "-50d" },
      { value: -20,  color: "#6baed6", label: "-20d" },
      { value:   0,  color: "#f7fbff", label: "0d" },
    ],
  },
  Rx5: {
    tileDir: {
      p05: "Rx5_p05",
      p50: "Rx5_p50",
      p95: "Rx5_p95",
    },
    label: "Max 5-Day Rainfall",
    description: "% change in max 5-day precipitation (CMIP6 SSP2-4.5)",
    unit: "% change",
    legendColors: [
      { value: -30,  color: "#f7fcf0", label: "-30%" },
      { value:   0,  color: "#c7e9c0", label: "0%" },
      { value:  30,  color: "#238b45", label: "+30%" },
      { value:  60,  color: "#00441b", label: "+60%" },
    ],
  },
  Tx35: {
    tileDir: {
      p05: "Tx35_p05",
      p50: "Tx35_p50",
      p95: "Tx35_p95",
    },
    label: "Days Tmax > 35\u00b0C",
    description: "Projected days with Tmax > 35\u00b0C (CMIP6 SSP2-4.5, absolute)",
    unit: "days change",
    legendColors: [
      { value:   0,  color: "#fff5f0", label: "0d" },
      { value:  30,  color: "#fb6a4a", label: "30d" },
      { value:  60,  color: "#cb181d", label: "60d" },
      { value: 120,  color: "#67000d", label: "120d" },
    ],
  },
  farmsize: {
    tileDir: "farmsize",  // single directory, no percentile variants
    label: "Farm Size",
    description: "Dominant farm size (ha) -- Mehrabi & Ricciardi 2024",
    unit: "ha",
    legendColors: [
      { value:   1,  color: "#f7f4f9", label: "1 ha" },
      { value:  20,  color: "#c994c7", label: "20 ha" },
      { value: 500,  color: "#ce1256", label: "500 ha" },
      { value: 5000, color: "#49006a", label: "5000 ha" },
    ],
  },
};

// Helper: get tile directory name for a given variable + percentile
export function getTileDir(key, percentile = "p50") {
  const cfg = RASTER_OVERLAYS[key];
  if (!cfg) return null;
  if (typeof cfg.tileDir === "string") return cfg.tileDir;
  return cfg.tileDir[percentile] || cfg.tileDir.p50;
}
