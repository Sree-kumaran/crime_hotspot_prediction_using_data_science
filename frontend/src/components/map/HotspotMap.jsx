import { useState, useMemo } from "react";
import { MapPin, Info, Layers, Eye, ZoomIn, ZoomOut, Compass } from "lucide-react";
import { RiskBadge } from "../ui/Badge/Badge";

// NYC Bounding box matching the ML model's grid_config.json
const GRID_BOUNDS = {
  latMin: 40.49699056,
  latMax: 40.91533744,
  lonMin: -74.25823135737069,
  lonMax: -73.69519705586761,
};

// Key NYC landmarks for geospatial reference
const LANDMARKS = [
  { name: "Times Square", lat: 40.7580, lon: -73.9855 },
  { name: "Brooklyn Bridge", lat: 40.7061, lon: -73.9969 },
  { name: "Central Park", lat: 40.785091, lon: -73.968285 },
  { name: "Wall Street", lat: 40.7074, lon: -74.0113 },
  { name: "JFK Airport", lat: 40.6413, lon: -73.7781 },
  { name: "Yankee Stadium", lat: 40.8296, lon: -73.9262 },
];

export default function HotspotMap({
  hotspots = [],
  incidents = [],
  height = "h-[450px]",
  showLegend = true,
  selectedHotspot = null,
  onSelectHotspot = () => {},
}) {
  const [activeLayer, setActiveLayer] = useState("all"); // "all", "high", "medium", "low"
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGridLines, setShowGridLines] = useState(true);

  // Convert GPS Coordinates (lat, lon) to % on the map container
  const getCoordinatesPct = (lat, lon) => {
    const latPct =
      100 -
      ((lat - GRID_BOUNDS.latMin) / (GRID_BOUNDS.latMax - GRID_BOUNDS.latMin)) *
        100;
    const lonPct =
      ((lon - GRID_BOUNDS.lonMin) / (GRID_BOUNDS.lonMax - GRID_BOUNDS.lonMin)) *
        100;
    return {
      top: `${Math.max(2, Math.min(98, latPct))}%`,
      left: `${Math.max(2, Math.min(98, lonPct))}%`,
    };
  };

  const filteredHotspots = useMemo(() => {
    if (!hotspots || hotspots.length === 0) return [];
    if (activeLayer === "all") return hotspots;
    return hotspots.filter(
      (h) => h.risk_level?.toLowerCase() === activeLayer.toLowerCase()
    );
  }, [hotspots, activeLayer]);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
      case "critical":
        return {
          bg: "bg-red-500",
          border: "border-red-400",
          glow: "shadow-[0_0_12px_rgba(239,68,68,0.7)]",
          text: "text-red-400",
          fill: "rgba(239, 68, 68, 0.4)",
        };
      case "medium":
      case "moderate":
        return {
          bg: "bg-amber-500",
          border: "border-amber-400",
          glow: "shadow-[0_0_12px_rgba(245,158,11,0.7)]",
          text: "text-amber-400",
          fill: "rgba(245, 158, 11, 0.4)",
        };
      case "low":
      default:
        return {
          bg: "bg-emerald-500",
          border: "border-emerald-400",
          glow: "shadow-[0_0_12px_rgba(16,185,129,0.7)]",
          text: "text-emerald-400",
          fill: "rgba(16, 185, 129, 0.4)",
        };
    }
  };

  return (
    <div className={`relative ${height} w-full rounded-xl overflow-hidden border border-[#30454f] bg-[#121e24] select-none flex flex-col shadow-xl`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto bg-[#1b2b32]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#30454f] text-xs shadow-md">
          <span className="flex items-center gap-1 font-semibold text-text-primary">
            <Compass className="w-3.5 h-3.5 text-primary-400 animate-spin-slow" /> NYC Spatiotemporal Grid
          </span>
          <span className="text-text-muted">|</span>
          <span className="text-text-secondary">20x20 ConvLSTM Matrix</span>
        </div>

        {/* Filter / Layer Toggles */}
        <div className="flex gap-1 pointer-events-auto bg-[#1b2b32]/90 backdrop-blur p-1 rounded-lg border border-[#30454f] shadow-md">
          {["all", "high", "medium", "low"].map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2 py-1 text-xs rounded capitalize font-medium transition-all ${
                activeLayer === layer
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-[#253942]"
              }`}
            >
              {layer}
            </button>
          ))}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            title="Toggle 20x20 Grid Overlay"
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${
              showGridLines ? "bg-[#2b414c] text-primary-300" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Layers className="w-3 h-3" />
            Grid
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0d161a]">
        {/* Stylized NYC Geo Blueprint Background */}
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="smallGrid"
                width="5%"
                height="5%"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="rgba(66, 153, 225, 0.08)"
                  strokeWidth="0.75"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>
        </div>

        {/* 20x20 ConvLSTM Grid Overlay */}
        {showGridLines && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-20 grid-rows-20 border border-cyan-500/10 opacity-60">
            {Array.from({ length: 400 }).map((_, i) => (
              <div
                key={i}
                className="border-r border-b border-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
              />
            ))}
          </div>
        )}

        {/* Major Waterways / Borough Outline Styling (Stylized SVG contours) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          viewBox="0 0 800 600"
          preserveAspectRatio="none"
        >
          {/* Hudson & East River contours */}
          <path
            d="M 280 0 C 290 120 310 240 330 350 C 345 420 330 500 310 600"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 450 150 C 430 260 380 340 330 360 C 370 420 440 480 500 600"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>

        {/* Landmarks Markers */}
        {LANDMARKS.map((lm, idx) => {
          const coords = getCoordinatesPct(lm.lat, lm.lon);
          return (
            <div
              key={idx}
              style={{ top: coords.top, left: coords.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 flex flex-col items-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
                {lm.name}
              </span>
            </div>
          );
        })}

        {/* Hotspot Markers / Heatmap Zones */}
        {filteredHotspots.map((h, idx) => {
          const coords = getCoordinatesPct(h.latitude, h.longitude);
          const style = getRiskColor(h.risk_level);
          const isSelected =
            selectedHotspot &&
            selectedHotspot.latitude === h.latitude &&
            selectedHotspot.longitude === h.longitude;
          const isHovered =
            hoveredPoint &&
            hoveredPoint.latitude === h.latitude &&
            hoveredPoint.longitude === h.longitude;

          const size = Math.max(16, Math.min(36, 16 + (h.risk_score || 0.5) * 20));

          return (
            <div
              key={idx}
              style={{ top: coords.top, left: coords.left }}
              onClick={() => onSelectHotspot(h)}
              onMouseEnter={() => setHoveredPoint(h)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group transition-transform duration-200 hover:scale-125"
            >
              {/* Outer Pulse Wave for High Risk */}
              {h.risk_level === "High" && (
                <div
                  style={{ width: size * 1.8, height: size * 1.8 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full bg-red-500/20 animate-ping pointer-events-none"
                />
              )}

              {/* Intensity Radius Halo */}
              <div
                style={{
                  width: size * 1.4,
                  height: size * 1.4,
                  backgroundColor: style.fill,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full blur-[2px] pointer-events-none"
              />

              {/* Main Hotspot Dot */}
              <div
                style={{ width: size, height: size }}
                className={`rounded-full ${style.bg} ${style.border} ${style.glow} border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-lg relative ${
                  isSelected ? "ring-4 ring-cyan-400 scale-110" : ""
                }`}
              >
                #{idx + 1}
              </div>
            </div>
          );
        })}

        {/* Hover / Selected Hotspot Detail Tooltip Card */}
        {(hoveredPoint || selectedHotspot) && (
          <div
            style={{
              top: getCoordinatesPct(
                (hoveredPoint || selectedHotspot).latitude,
                (hoveredPoint || selectedHotspot).longitude
              ).top,
              left: getCoordinatesPct(
                (hoveredPoint || selectedHotspot).latitude,
                (hoveredPoint || selectedHotspot).longitude
              ).left,
            }}
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 pb-2 transition-all"
          >
            <div className="bg-[#182830]/95 backdrop-blur-md border border-[#3f5763] rounded-lg p-3 shadow-2xl min-w-[200px] text-xs text-text-primary">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-primary-300">
                  Predicted Hotspot
                </span>
                <RiskBadge
                  level={
                    (hoveredPoint || selectedHotspot).risk_level === "Medium"
                      ? "Moderate"
                      : (hoveredPoint || selectedHotspot).risk_level
                  }
                />
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Risk Score:</span>
                  <span className="font-semibold text-text-primary">
                    {(
                      ((hoveredPoint || selectedHotspot).risk_score || 0) * 100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Intensity:</span>
                  <span className="font-semibold text-text-primary">
                    {(hoveredPoint || selectedHotspot).predicted_intensity}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lat / Lon:</span>
                  <span>
                    {(hoveredPoint || selectedHotspot).latitude},{" "}
                    {(hoveredPoint || selectedHotspot).longitude}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no hotspots loaded */}
        {(!hotspots || hotspots.length === 0) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-12 h-12 rounded-full bg-[#1e2f38] border border-[#324955] flex items-center justify-center text-primary-400 mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">
              No Hotspot Predictions Active
            </h4>
            <p className="text-xs text-text-secondary max-w-sm mt-1">
              Select a date on the Prediction page to run the ConvLSTM neural network and generate geographic risk zones.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Map Info Footer */}
      {showLegend && (
        <div className="bg-[#121c21] border-t border-[#263740] px-4 py-2 flex flex-wrap justify-between items-center text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              High Risk (&gt;75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              Medium Risk (45-75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              Low Risk (&lt;45%)
            </span>
          </div>
          <div>
            Showing <strong className="text-text-primary">{filteredHotspots.length}</strong> active hotspot zones
          </div>
        </div>
      )}
    </div>
  );
}
