/**
 * InfoPanel.js — Collapsible about/context panel
 *
 * Shows key findings from Bajaj et al. 2025 to help users
 * understand what they're looking at.
 */

import { useState } from "react";

const FINDINGS = [
  {
    icon: "\u{1F321}\uFE0F",
    stat: "25% of cropland",
    text: "will face >2 months of extreme heat under 2\u00b0C warming, up from 16% today",
  },
  {
    icon: "\u{1F33E}",
    stat: "11 million km\u00b2",
    text: "of agricultural land exposed to prolonged heat stress (Tmax > 35\u00b0C)",
  },
  {
    icon: "\u26C8\uFE0F",
    stat: "~12% of ag. area",
    text: "exposed to compound extremes (heat + heavy rainfall), up from ~10%",
  },
  {
    icon: "\u{1F3E1}",
    stat: "Medium farms (2\u20135 ha)",
    text: "face the sharpest increase in heat stress \u2014 nearly double that of large farms",
  },
];

const LAYERS_INFO = [
  {
    icon: "\u{1F525}",
    name: "Extreme Heat Days (Tx35)",
    detail: "Change in days when daily max temperature exceeds 35\u00b0C during the growing season",
    stat: "Cropland exposure: 16.7% \u2192 23.3%",
  },
  {
    icon: "\u{1F4A7}",
    name: "Consecutive Dry Days (CDD)",
    detail: "Change in the longest dry spell during the growing season",
    stat: "Stable at ~11\u201312% of agricultural area",
  },
  {
    icon: "\u2744\uFE0F",
    name: "Frost Days (FD)",
    detail: "Change in days when daily min temperature drops below 0\u00b0C during the growing season",
    stat: "Decreases: 7.3% \u2192 5.1% of cropland",
  },
  {
    icon: "\u{1F327}\uFE0F",
    name: "Max 5-Day Rainfall (Rx5)",
    detail: "Change in heaviest 5-day cumulative precipitation during the growing season",
    stat: "Stable at ~11\u201312% of agricultural area",
  },
];

export default function InfoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`info-panel ${open ? "open" : "closed"}`}>
      <button className="info-toggle" onClick={() => setOpen(!open)}>
        {open ? "\u2715 Close" : "\u2139 About this map"}
      </button>

      {open && (
        <div className="info-content">
          <div className="info-section-title">Key Findings</div>
          <div className="findings-grid">
            {FINDINGS.map((f, i) => (
              <div key={i} className="finding-card">
                <span className="finding-icon">{f.icon}</span>
                <span className="finding-stat">{f.stat}</span>
                <span className="finding-text">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="info-section-title" style={{ marginTop: "1rem" }}>
            Climate Layers
          </div>
          <div className="burdens-table">
            {LAYERS_INFO.map((b, i) => (
              <div key={i} className="burden-info-row">
                <span className="bi-icon">{b.icon}</span>
                <div className="bi-text">
                  <div className="bi-name">{b.name}</div>
                  <div className="bi-detail">{b.detail}</div>
                  <div className="bi-threshold">{b.stat}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="info-section-title" style={{ marginTop: "0.75rem" }}>
            Data Sources
          </div>
          <div className="info-sources">
            <div className="info-source-row">
              <span className="info-source-label">Climate extremes</span>
              <span className="info-source-value">CMIP6 SSP2-4.5 multi-model ensemble (Bajaj et al. 2025)</span>
            </div>
            <div className="info-source-row">
              <span className="info-source-label">Food production</span>
              <span className="info-source-value">Plotline breadbasket dataset</span>
            </div>
            <div className="info-source-row">
              <span className="info-source-label">Farm size</span>
              <span className="info-source-value">Mehrabi & Ricciardi 2024</span>
            </div>
          </div>

          <div className="info-cite">
            Bajaj et al. (2025). Future climate exposure over global agricultural lands.{" "}
            <em>Environ. Res. Lett.</em> 20 044038.{" "}
            <a
              href="https://iopscience.iop.org/article/10.1088/1748-9326/ae293c"
              target="_blank"
              rel="noopener noreferrer"
              className="info-cite-link"
            >
              DOI: 10.1088/1748-9326/ae293c
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
