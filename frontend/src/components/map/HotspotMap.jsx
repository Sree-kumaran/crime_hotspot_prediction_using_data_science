import LeafletInteractiveMap from "./LeafletInteractiveMap";

export default function HotspotMap({
  hotspots = [],
  incidents = [],
  crimes = [],
  height = "h-[480px]",
  showLegend = true,
  selectedHotspot = null,
  selectedCrime = null,
  onSelectHotspot = () => {},
  onSelectCrime = () => {},
  mode = "hotspots",
  targetDate = "",
}) {
  const combinedCrimes = crimes.length > 0 ? crimes : incidents;

  return (
    <LeafletInteractiveMap
      hotspots={hotspots}
      crimes={combinedCrimes}
      height={height}
      showLegend={showLegend}
      selectedHotspot={selectedHotspot}
      selectedCrime={selectedCrime}
      onSelectHotspot={onSelectHotspot}
      onSelectCrime={onSelectCrime}
      mode={mode}
      targetDate={targetDate}
    />
  );
}
