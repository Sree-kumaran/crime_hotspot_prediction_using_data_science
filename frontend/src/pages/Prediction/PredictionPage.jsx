import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Layers,
  History,
  Info,
  CheckCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import HotspotMap from "../../components/map/HotspotMap";
import PredictionHistoryTable from "./PredictionHistoryTable";
import { generateHotspotPrediction } from "../../services/predictionService";

export default function PredictionPage() {
  const [predictionDate, setPredictionDate] = useState("2024-03-25");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [activeTab, setActiveTab] = useState("predict"); // "predict" | "history"

  const quickDates = ["2024-03-25", "2024-03-20", "2024-03-15", "2024-03-10"];

  const onGenerate = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSelectedHotspot(null);

    if (!predictionDate) {
      setError("Please select a target prediction date.");
      return;
    }

    try {
      setLoading(true);
      const res = await generateHotspotPrediction(predictionDate);
      setResult(res);
      if (res?.hotspots?.length > 0) {
        setSelectedHotspot(res.hotspots[0]);
      }
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(err.message || "Unable to generate prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (historicalItem) => {
    setResult(historicalItem);
    setPredictionDate(historicalItem.prediction_date);
    if (historicalItem.hotspots?.length > 0) {
      setSelectedHotspot(historicalItem.hotspots[0]);
    }
    setActiveTab("predict");
  };

  return (
    <section className="space-y-6">
      {/* Header and Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-400" />
            Crime Hotspot Prediction
          </h2>
          <p className="section-subtitle">
            ConvLSTM spatiotemporal neural network inference on NYC 20x20 spatial grid
          </p>
        </div>

        <div className="flex bg-[#1b2a31] p-1 rounded-lg border border-[#30454f] self-start md:self-auto">
          <button
            onClick={() => setActiveTab("predict")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "predict"
                ? "bg-primary-500 text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Run Prediction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-primary-500 text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Prediction History
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        <PredictionHistoryTable onSelectPrediction={handleSelectFromHistory} />
      ) : (
        <>
          {/* Prediction Controls Card */}
          <Card className="border-[#30454f]">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                Inference Parameters
              </h3>
              <span className="text-xs text-text-muted">
                Model: ConvLSTM 2D (5 Channels)
              </span>
            </CardHeader>
            <CardBody className="space-y-4">
              <form onSubmit={onGenerate} className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <Input
                    label="Prediction Target Date"
                    type="date"
                    value={predictionDate}
                    onChange={(e) => setPredictionDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Quick Benchmark Dates
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickDates.map((qd) => (
                      <button
                        type="button"
                        key={qd}
                        onClick={() => setPredictionDate(qd)}
                        className={`text-xs px-2.5 py-1.5 rounded border transition-all ${
                          predictionDate === qd
                            ? "bg-primary-500/20 border-primary-400 text-primary-300 font-semibold"
                            : "bg-[#1f3038] border-[#344b56] text-text-secondary hover:text-text-primary hover:border-primary-400"
                        }`}
                      >
                        {qd}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    className="w-full py-2.5 font-semibold shadow-lg shadow-primary-500/20"
                  >
                    {loading ? "Running Neural Inference..." : "Generate Hotspot Prediction"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {error && <Alert type="error" title="Prediction Error" message={error} />}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-base p-4 border border-[#30454f] bg-[#1a2830]">
                  <p className="text-xs font-medium text-text-secondary">
                    Total Hotspots
                  </p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {result.summary?.total_hotspots ?? result.hotspots?.length ?? 0}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">Top-20 Density Clusters</p>
                </div>

                <div className="card-base p-4 border border-red-500/30 bg-red-950/20">
                  <p className="text-xs font-medium text-red-300">
                    High Risk Zones
                  </p>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {result.summary?.high_risk ?? 0}
                  </p>
                  <p className="text-[11px] text-red-300/70 mt-1">Risk Score &gt; 75%</p>
                </div>

                <div className="card-base p-4 border border-amber-500/30 bg-amber-950/20">
                  <p className="text-xs font-medium text-amber-300">
                    Medium Risk Zones
                  </p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {result.summary?.medium_risk ?? 0}
                  </p>
                  <p className="text-[11px] text-amber-300/70 mt-1">Risk Score 45% - 75%</p>
                </div>

                <div className="card-base p-4 border border-emerald-500/30 bg-emerald-950/20">
                  <p className="text-xs font-medium text-emerald-300">
                    Low Risk Zones
                  </p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {result.summary?.low_risk ?? 0}
                  </p>
                  <p className="text-[11px] text-emerald-300/70 mt-1">Risk Score &lt; 45%</p>
                </div>
              </div>

              {/* Interactive Geospatial Hotspot Map */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-400" />
                    Spatiotemporal Hotspot Heatmap
                  </h3>
                  <span className="text-xs text-text-muted">
                    Target: {result.prediction_date} | Model: {result.model?.name} v{result.model?.version}
                  </span>
                </div>
                <HotspotMap
                  hotspots={result.hotspots || []}
                  selectedHotspot={selectedHotspot}
                  onSelectHotspot={setSelectedHotspot}
                  height="h-[500px]"
                />
              </div>

              {/* Hotspot Cluster Grid List */}
              <Card className="border-[#30454f]">
                <CardHeader className="flex justify-between items-center">
                  <h3 className="text-base font-semibold">
                    Top Ranked Hotspots ({result.hotspots?.length || 0})
                  </h3>
                  <span className="text-xs text-text-muted">
                    Click any card to highlight on the map
                  </span>
                </CardHeader>
                <CardBody>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {result.hotspots?.map((h, idx) => {
                      const isSelected =
                        selectedHotspot &&
                        selectedHotspot.latitude === h.latitude &&
                        selectedHotspot.longitude === h.longitude;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedHotspot(h)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary-950/40 border-primary-400 ring-2 ring-primary-400/50 shadow-lg scale-[1.02]"
                              : "bg-[#18262d] border-[#2f434e] hover:border-primary-400/60 hover:bg-[#1f313a]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-text-primary">
                              Hotspot #{idx + 1}
                            </span>
                            <RiskBadge
                              level={
                                h.risk_level === "Medium"
                                  ? "Moderate"
                                  : h.risk_level
                              }
                            />
                          </div>
                          <div className="space-y-1 text-xs text-text-secondary">
                            <div className="flex justify-between">
                              <span>Risk Score:</span>
                              <span className="font-bold text-text-primary">
                                {(h.risk_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Intensity:</span>
                              <span className="font-semibold text-text-primary">
                                {h.predicted_intensity}
                              </span>
                            </div>
                            <div className="text-[10px] text-text-muted pt-1 border-t border-[#2d3e48]">
                              Lat: {h.latitude}, Lon: {h.longitude}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </section>
  );
}
