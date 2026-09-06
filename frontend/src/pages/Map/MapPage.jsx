import { useState, useEffect, useMemo } from "react";
import { MapPin, Filter, RefreshCw, Layers } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import MapContainer from "../../components/map/MapContainer";
import RiskLegend from "../../components/map/RiskLegend";
import { getLatestPrediction, generateHotspotPrediction } from "../../services/predictionService";
import { getIncidents } from "../../services/incidentService";
import Alert from "../../components/ui/Alert/Alert";

export default function MapPage() {
  const [hotspots, setHotspots] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Filter states
  const [riskLevel, setRiskLevel] = useState("all");
  const [targetDate, setTargetDate] = useState("2024-03-25");

  const loadMapData = async (date) => {
    setLoading(true);
    setError("");
    try {
      let predRes = null;
      if (date) {
        predRes = await generateHotspotPrediction(date);
      } else {
        const latestRes = await getLatestPrediction();
        predRes = latestRes?.data;
        if (!predRes) {
          predRes = await generateHotspotPrediction("2024-03-25");
        }
      }

      setHotspots(predRes?.hotspots || []);

      const incRes = await getIncidents({ limit: 50 });
      setIncidents(Array.isArray(incRes?.data) ? incRes.data : []);
    } catch (err) {
      console.error("Failed to load map data:", err);
      setError(err?.message || "Failed to load spatial hotspot data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData(targetDate);
  }, []);

  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      if (riskLevel !== "all" && h.risk_level?.toLowerCase() !== riskLevel.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [hotspots, riskLevel]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-palette-almond" />
            NYC Crime Hotspot Map Visualizer
          </h2>
          <p className="section-subtitle">
            Geospatial density matrix & ConvLSTM risk clusters across New York City
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => loadMapData(targetDate)}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Map
        </Button>
      </div>

      <Card className="border-[#262c4d]">
        <CardHeader className="bg-palette-ink/40 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-palette-lilac" />
            Spatiotemporal Matrix Query
          </h3>
        </CardHeader>
        <CardBody className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            label="Inference Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <Select
            label="Risk Filter"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            options={[
              { value: "all", label: "All Priority Levels" },
              { value: "high", label: "High Risk Only (>75%)" },
              { value: "medium", label: "Moderate Risk (45-75%)" },
              { value: "low", label: "Low Risk (<45%)" },
            ]}
          />
          <div className="sm:col-span-2 flex items-end">
            <Button
              className="w-full h-10 font-bold"
              onClick={() => loadMapData(targetDate)}
              disabled={loading}
              loading={loading}
            >
              {loading ? "Computing Spatiotemporal Density..." : "Apply Matrix Filter"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {error && <Alert type="error" title="Spatial Map Error" message={error} />}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <MapContainer
            hotspots={filteredHotspots}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            height="h-[540px]"
          />
        </div>

        <div className="space-y-4">
          <RiskLegend />

          {selectedHotspot && (
            <Card className="border-palette-grape bg-palette-prussian shadow-glow">
              <CardHeader className="py-3 bg-palette-ink/50 border-[#262c4d]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
                  Selected Hotspot Inspector
                </h4>
              </CardHeader>
              <CardBody className="space-y-2.5 p-4 text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-[#262c4d]">
                  <span className="text-palette-lilac">Risk Classification:</span>
                  <span className="font-bold text-palette-almond">
                    {selectedHotspot.risk_level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-palette-lilac">Risk Score:</span>
                  <span className="font-bold text-palette-almond">
                    {(selectedHotspot.risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-palette-lilac">Predicted Intensity:</span>
                  <span className="font-semibold text-palette-almond">
                    {selectedHotspot.predicted_intensity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-[#262c4d] text-palette-lilac/80">
                  <span>GPS Coordinates:</span>
                  <span className="font-mono text-palette-almond">
                    {selectedHotspot.latitude}, {selectedHotspot.longitude}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
