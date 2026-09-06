import HotspotMap from "./HotspotMap";

function MapContainer({
  hotspots = [],
  incidents = [],
  height = "h-[450px]",
  showLegend = true,
  selectedHotspot = null,
  onSelectHotspot,
  children,
}) {
  return (
    <div className="w-full relative">
      <HotspotMap
        hotspots={hotspots}
        incidents={incidents}
        height={height}
        showLegend={showLegend}
        selectedHotspot={selectedHotspot}
        onSelectHotspot={onSelectHotspot}
      />
      {children}
    </div>
  );
}

export default MapContainer;

