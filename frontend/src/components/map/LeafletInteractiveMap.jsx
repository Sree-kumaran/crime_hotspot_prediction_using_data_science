import { useEffect, useRef, useState, useMemo } from "react";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Navigation,
  ShieldAlert,
  Flame,
  Clock,
  Eye,
  Crosshair,
} from "lucide-react";

// NYC Spatiotemporal bounding box
const GRID_BOUNDS = {
  latMin: 40.49699056,
  latMax: 40.91533744,
  lonMin: -74.25823135737069,
  lonMax: -73.69519705586761,
};

const BOROUGHS = [
  { name: "All NYC", center: [40.7128, -73.985], zoom: 11 },
  { name: "Manhattan", center: [40.7831, -73.9712], zoom: 12 },
  { name: "Brooklyn", center: [40.6782, -73.9442], zoom: 12 },
  { name: "Queens", center: [40.7282, -73.7949], zoom: 11 },
  { name: "Bronx", center: [40.8448, -73.8648], zoom: 12 },
  { name: "Staten Island", center: [40.5795, -74.1502], zoom: 12 },
];

const TILE_PROVIDERS = {
  dark: {
    name: "Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  street: {
    name: "Google/OSM Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  voyager: {
    name: "Voyager Light",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

export default function LeafletInteractiveMap({
  hotspots = [],
  crimes = [],
  height = "h-[540px]",
  selectedHotspot = null,
  selectedCrime = null,
  onSelectHotspot = () => {},
  onSelectCrime = () => {},
  showLegend = true,
  mode = "hotspots", // "hotspots", "crimes", or "hybrid"
  targetDate = "",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const crimesLayerGroupRef = useRef(null);
  const gridLayerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [activeTileTheme, setActiveTileTheme] = useState("dark");
  const [activeRiskFilter, setActiveRiskFilter] = useState("all");
  const [showGrid, setShowGrid] = useState(false);
  const [showCrimesLayer, setShowCrimesLayer] = useState(mode !== "hotspots");
  const [showHotspotsLayer, setShowHotspotsLayer] = useState(mode !== "crimes");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);

  // Ensure Leaflet is loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      setLeafletReady(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapContainerRef.current, {
      center: [40.7128, -73.985],
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false, // We use custom styled zoom buttons
      attributionControl: false,
    });

    // Add Tile Layer
    const tileConfig = TILE_PROVIDERS[activeTileTheme] || TILE_PROVIDERS.dark;
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Create Layer Groups
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    crimesLayerGroupRef.current = L.layerGroup().addTo(map);
    gridLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletReady]);

  // Update Tile Theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current || !window.L) return;
    const L = window.L;
    const config = TILE_PROVIDERS[activeTileTheme] || TILE_PROVIDERS.dark;
    tileLayerRef.current.setUrl(config.url);
  }, [activeTileTheme]);

  // Filtered Hotspots
  const filteredHotspots = useMemo(() => {
    if (!hotspots || hotspots.length === 0) return [];
    if (activeRiskFilter === "all") return hotspots;
    return hotspots.filter((h) => {
      const lvl = h.risk_level?.toLowerCase();
      const filter = activeRiskFilter.toLowerCase();
      if (filter === "medium") return lvl === "medium" || lvl === "moderate";
      return lvl === filter;
    });
  }, [hotspots, activeRiskFilter]);

  // Filtered Crimes
  const filteredCrimes = useMemo(() => {
    if (!crimes || crimes.length === 0) return [];
    if (activeRiskFilter === "all") return crimes;
    return crimes.filter((c) => {
      const sev = (c.severity || "").toLowerCase();
      const filter = activeRiskFilter.toLowerCase();
      if (filter === "high") return sev === "high" || sev === "critical";
      if (filter === "medium") return sev === "moderate" || sev === "medium";
      if (filter === "low") return sev === "low";
      return true;
    });
  }, [crimes, activeRiskFilter]);

  // Render Hotspot Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || !window.L) return;
    const L = window.L;
    markersLayerGroupRef.current.clearLayers();

    if (!showHotspotsLayer) return;

    filteredHotspots.forEach((h, index) => {
      if (h.latitude == null || h.longitude == null) return;

      const isHigh = h.risk_level === "High";
      const isMed = h.risk_level === "Medium" || h.risk_level === "Moderate";
      const isSelected = selectedHotspot && selectedHotspot.latitude === h.latitude && selectedHotspot.longitude === h.longitude;
      const isTop1 = h.rank === 1 || index === 0;

      const color = isHigh ? "#ef4444" : isMed ? "#f59e0b" : "#10b981";
      const radiusMeters = isHigh ? 750 : isMed ? 550 : 380;

      // Outer Intensity Circle
      L.circle([h.latitude, h.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: isSelected ? 0.45 : 0.22,
        weight: isSelected ? 3 : 1.5,
        radius: radiusMeters,
      }).addTo(markersLayerGroupRef.current);

      // Custom HTML Marker Icon
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            isTop1
              ? `<div class="absolute -inset-2 rounded-full bg-red-500/40 animate-ping"></div>`
              : isHigh
              ? `<div class="absolute -inset-1 rounded-full bg-red-500/30 animate-pulse"></div>`
              : ""
          }
          <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-2xl transition-transform transform group-hover:scale-125 ${
            isSelected ? "ring-4 ring-[#e0b589] scale-125" : ""
          }" style="background-color: ${color}; border-color: #ffffff; color: #ffffff;">
            ${isTop1 ? "★1" : `#${h.rank || index + 1}`}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-hotspot-pin",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([h.latitude, h.longitude], { icon: customIcon }).addTo(
        markersLayerGroupRef.current
      );

      // Popup Content
      const popupHtml = `
        <div class="p-2 min-w-[220px] font-sans text-xs bg-[#111322] text-[#e0b589] rounded-lg border border-[#2b3254]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#262c4d]">
            <span class="font-bold uppercase tracking-wider text-[11px] text-white">
              ${isTop1 ? "🎯 #1 Priority Hotspot" : `Hotspot #${h.rank || index + 1}`}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              isHigh ? "bg-red-500/20 text-red-400 border border-red-500/40" : isMed ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            }">
              ${h.risk_level || "Moderate"}
            </span>
          </div>
          <div class="space-y-1 text-[#a69cac]">
            <div class="text-white font-semibold">${h.location_name || "NYC Area"} (${h.borough || "New York"})</div>
            <div class="flex justify-between"><span>Risk Score:</span> <strong class="text-white">${((h.risk_score || 0) * 100).toFixed(1)}%</strong></div>
            <div class="flex justify-between"><span>Intensity:</span> <strong class="text-white">${(h.predicted_intensity || 0).toFixed(4)}</strong></div>
            ${
              h.peak_risk_hours
                ? `<div class="pt-1 text-[10px] text-amber-300 font-medium">🕒 Peak Hours: ${h.peak_risk_hours}</div>`
                : ""
            }
            <div class="text-[9px] text-[#717493] pt-1">Coordinates: ${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectHotspot(h);
      });
    });
  }, [filteredHotspots, selectedHotspot, showHotspotsLayer]);

  // Render Crimes Markers (Last 7 Days)
  useEffect(() => {
    if (!mapInstanceRef.current || !crimesLayerGroupRef.current || !window.L) return;
    const L = window.L;
    crimesLayerGroupRef.current.clearLayers();

    if (!showCrimesLayer) return;

    filteredCrimes.forEach((c) => {
      if (c.latitude == null || c.longitude == null) return;

      const isHigh = c.severity === "High" || c.severity === "Critical";
      const isMed = c.severity === "Moderate" || c.severity === "Medium";
      const color = isHigh ? "#f43f5e" : isMed ? "#fbbf24" : "#38bdf8";

      const crimeIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold shadow-md transition-transform group-hover:scale-150"
               style="background-color: ${color}; color: #ffffff;">
            ●
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: crimeIconHtml,
        className: "custom-crime-pin",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon }).addTo(crimesLayerGroupRef.current);

      const crimePopupHtml = `
        <div class="p-2 min-w-[210px] font-sans text-xs bg-[#111322] text-[#e0b589] rounded-lg border border-[#2b3254]">
          <div class="flex items-center justify-between pb-1 mb-1 border-b border-[#262c4d]">
            <span class="font-bold text-white capitalize">${c.crime_type || c.category || "Incident"}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${
              isHigh ? "bg-red-500/30 text-red-300" : isMed ? "bg-amber-500/30 text-amber-300" : "bg-sky-500/30 text-sky-300"
            }">
              ${c.severity || "Reported"}
            </span>
          </div>
          <div class="space-y-0.5 text-[#a69cac]">
            <div class="text-white font-medium">${c.location || c.area || "NYC"}</div>
            <div class="flex justify-between"><span>Date:</span> <strong class="text-white">${c.date}</strong></div>
            <div class="flex justify-between"><span>Time:</span> <strong class="text-white">${c.time || "N/A"}</strong></div>
            ${c.status ? `<div class="flex justify-between"><span>Status:</span> <span class="text-amber-200">${c.status}</span></div>` : ""}
            ${c.description ? `<div class="text-[10px] text-gray-300 italic pt-1">${c.description}</div>` : ""}
          </div>
        </div>
      `;

      marker.bindPopup(crimePopupHtml);
      marker.on("click", () => onSelectCrime(c));
    });
  }, [filteredCrimes, showCrimesLayer]);

  // Render 20x20 Grid
  useEffect(() => {
    if (!mapInstanceRef.current || !gridLayerGroupRef.current || !window.L) return;
    const L = window.L;
    gridLayerGroupRef.current.clearLayers();

    if (!showGrid) return;

    const latStep = (GRID_BOUNDS.latMax - GRID_BOUNDS.latMin) / 20;
    const lonStep = (GRID_BOUNDS.lonMax - GRID_BOUNDS.lonMin) / 20;

    for (let r = 0; r <= 20; r++) {
      const lat = GRID_BOUNDS.latMin + r * latStep;
      L.polyline(
        [
          [lat, GRID_BOUNDS.lonMin],
          [lat, GRID_BOUNDS.lonMax],
        ],
        { color: "#717493", weight: 0.8, opacity: 0.4, dashArray: "3, 6" }
      ).addTo(gridLayerGroupRef.current);
    }

    for (let c = 0; c <= 20; c++) {
      const lon = GRID_BOUNDS.lonMin + c * lonStep;
      L.polyline(
        [
          [GRID_BOUNDS.latMin, lon],
          [GRID_BOUNDS.latMax, lon],
        ],
        { color: "#717493", weight: 0.8, opacity: 0.4, dashArray: "3, 6" }
      ).addTo(gridLayerGroupRef.current);
    }
  }, [showGrid]);

  // Focus on Selected Hotspot
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    mapInstanceRef.current.flyTo([selectedHotspot.latitude, selectedHotspot.longitude], 14, {
      duration: 1.2,
    });
  }, [selectedHotspot]);

  // Focus on Selected Crime
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCrime) return;
    mapInstanceRef.current.flyTo([selectedCrime.latitude, selectedCrime.longitude], 14, {
      duration: 1.2,
    });
  }, [selectedCrime]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([40.7128, -73.985], 11, { duration: 1 });
    }
  };

  const handleSelectBorough = (boro) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(boro.center, boro.zoom, { duration: 1.2 });
    }
  };

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : `${height} rounded-xl`
      } w-full overflow-hidden border border-[#262c4d] bg-[#0c0d16] select-none flex flex-col shadow-2xl transition-all duration-300`}
    >
      {/* Top Interactive Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap justify-between items-center gap-2 pointer-events-none">
        {/* Left Navigation & Matrix Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#141829]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#2b3254] text-xs shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-[#e0b589]" />
          <span className="font-bold text-[#e0b589]">Interactive NYC Map</span>
          <span className="text-[#a69cac]/40">|</span>
          <span className="text-white font-medium text-[11px]">
            {mode === "crimes"
              ? `7-Day Crime Incidents (${filteredCrimes.length})`
              : `Neural Hotspots (${filteredHotspots.length})`}
          </span>
        </div>

        {/* Borough Quick Navigator */}
        <div className="hidden sm:flex items-center gap-1 pointer-events-auto bg-[#141829]/95 backdrop-blur-md p-1 rounded-lg border border-[#2b3254] shadow-lg text-xs">
          {BOROUGHS.map((b) => (
            <button
              key={b.name}
              onClick={() => handleSelectBorough(b)}
              className="px-2 py-1 text-[11px] font-medium text-[#a69cac] hover:text-[#e0b589] hover:bg-[#262c4d] rounded transition-colors"
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Right Layer & Filter Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#141829]/95 backdrop-blur-md p-1 rounded-lg border border-[#2b3254] shadow-lg">
          {/* Tile Switcher */}
          <select
            value={activeTileTheme}
            onChange={(e) => setActiveTileTheme(e.target.value)}
            className="bg-[#0c0d16] text-[#e0b589] text-xs px-2 py-1 rounded border border-[#2b3254] focus:outline-none focus:border-[#e0b589] cursor-pointer"
          >
            <option value="dark">Dark Matter (Carto)</option>
            <option value="street">Street Map (OSM)</option>
            <option value="voyager">Voyager Light</option>
          </select>

          {/* Risk Filter */}
          {["all", "high", "medium", "low"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveRiskFilter(lvl)}
              className={`px-2 py-1 text-xs rounded capitalize font-semibold transition-all ${
                activeRiskFilter === lvl
                  ? "bg-[#e0b589] text-[#0c0d16] shadow"
                  : "text-[#a69cac] hover:text-white hover:bg-[#262c4d]"
              }`}
            >
              {lvl}
            </button>
          ))}

          {/* Toggle Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle ConvLSTM 20x20 Grid"
            className={`p-1.5 text-xs rounded transition-all ${
              showGrid ? "bg-[#474973] text-[#e0b589]" : "text-[#a69cac] hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Zoom & Map Action Controls (Google Maps Style) */}
      <div className="absolute right-4 bottom-14 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-9 h-9 rounded-lg bg-[#141829]/95 text-white border border-[#2b3254] shadow-xl flex items-center justify-center hover:bg-[#262c4d] hover:text-[#e0b589] active:scale-95 transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-9 h-9 rounded-lg bg-[#141829]/95 text-white border border-[#2b3254] shadow-xl flex items-center justify-center hover:bg-[#262c4d] hover:text-[#e0b589] active:scale-95 transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset to NYC Center"
          className="w-9 h-9 rounded-lg bg-[#141829]/95 text-white border border-[#2b3254] shadow-xl flex items-center justify-center hover:bg-[#262c4d] hover:text-[#e0b589] active:scale-95 transition-all mt-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          className="w-9 h-9 rounded-lg bg-[#141829]/95 text-white border border-[#2b3254] shadow-xl flex items-center justify-center hover:bg-[#262c4d] hover:text-[#e0b589] active:scale-95 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Leaflet Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0 bg-[#0c0d16]" />

      {/* Layer Toggles at Bottom Left */}
      <div className="absolute left-3 bottom-12 z-[1000] flex gap-1.5 bg-[#141829]/90 backdrop-blur-md p-1 rounded-lg border border-[#2b3254] text-xs shadow-lg">
        {mode !== "crimes" && (
          <button
            onClick={() => setShowHotspotsLayer(!showHotspotsLayer)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-semibold text-[11px] transition-all ${
              showHotspotsLayer
                ? "bg-[#e0b589] text-[#0c0d16]"
                : "text-[#a69cac] hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Predicted Hotspots
          </button>
        )}
        {(crimes.length > 0 || mode !== "hotspots") && (
          <button
            onClick={() => setShowCrimesLayer(!showCrimesLayer)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-semibold text-[11px] transition-all ${
              showCrimesLayer
                ? "bg-sky-500 text-white shadow"
                : "text-[#a69cac] hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            7-Day Crime Data
          </button>
        )}
      </div>

      {/* Bottom Status / Legend Bar */}
      {showLegend && (
        <div className="bg-[#141829]/95 border-t border-[#262c4d] px-4 py-2 flex flex-wrap justify-between items-center text-xs text-[#a69cac] z-[1000]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              High Risk (&gt;75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              Moderate Risk (45-75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Low Risk (&lt;45%)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {targetDate && <span>Observation Window Anchor: <strong className="text-white">{targetDate}</strong></span>}
            <span className="text-white font-semibold">
              Interactive Zoom: Scroll or +/-
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
