import { useState, useEffect, useMemo } from "react";
import { MapPin, Filter, Layers, RefreshCw, Calendar } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState("all");
  const [targetDate, setTargetDate] = useState("2024-03-25");

  const loadMapData = async (date) => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch latest or date-specific prediction
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

      // 2. Fetch recent incidents
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary-400" />
            NYC Crime Hotspot Map
          </h2>
          <p className="section-subtitle">
            Spatiotemporal grid matrix & neural network risk clusters across New York City
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => loadMapData(targetDate)}
          disabled={loading}
          className="flex items-center gap-1.5 self-start md:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Map Data
        </Button>
      </div>

      <Card className="border-[#30454f]">
        <CardHeader>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-400" />
            Spatiotemporal Filter Controls
          </h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Filter Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <Select
            label="Risk Level Filter"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            options={[
              { value: "all", label: "All Risk Levels" },
              { value: "high", label: "High Risk (>75%)" },
              { value: "medium", label: "Medium Risk (45-75%)" },
              { value: "low", label: "Low Risk (<45%)" },
            ]}
          />
          <div className="lg:col-span-2 flex items-end">
            <Button
              className="w-full"
              onClick={() => loadMapData(targetDate)}
              disabled={loading}
            >
              {loading ? "Computing Spatiotemporal Density..." : "Apply Grid Filters"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {error && <Alert type="error" title="Map Error" message={error} />}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MapContainer
            hotspots={filteredHotspots}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            height="h-[520px]"
          />
        </div>

        <div className="space-y-4">
          <RiskLegend />

          {selectedHotspot && (
            <Card className="border-primary-500/40 bg-[#162730]">
              <CardHeader>
                <h4 className="text-sm font-semibold text-primary-300">
                  Selected Hotspot Detail
                </h4>
              </CardHeader>
              <CardBody className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Risk Level:</span>
                  <span className="font-bold text-text-primary">
                    {selectedHotspot.risk_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Risk Score:</span>
                  <span className="font-bold text-primary-300">
                    {(selectedHotspot.risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Predicted Intensity:</span>
                  <span className="font-semibold text-text-primary">
                    {selectedHotspot.predicted_intensity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Latitude:</span>
                  <span>{selectedHotspot.latitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Longitude:</span>
                  <span>{selectedHotspot.longitude}</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
