import { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  History,
  Activity,
  Zap,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  ShieldAlert,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import LeafletInteractiveMap from "../../components/map/LeafletInteractiveMap";
import PredictionSummary from "../../components/prediction/PredictionSummary";
import HotspotList from "../../components/prediction/HotspotList";
import PredictionLegend from "../../components/prediction/PredictionLegend";
import PredictionHistoryTable from "./PredictionHistoryTable";
import {
  generateHotspotPrediction,
  getLatestPrediction,
} from "../../services/predictionService";

export default function PredictionPage() {
  const [predictionDate, setPredictionDate] = useState("2024-03-25");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [activeTab, setActiveTab] = useState("predict"); // "predict" | "history"

  const quickDates = [
    { label: "Today (2024-03-25)", date: "2024-03-25" },
    { label: "Tomorrow (2024-03-26)", date: "2024-03-26" },
    { label: "Day +2 (2024-03-27)", date: "2024-03-27" },
    { label: "Past (2024-03-20)", date: "2024-03-20" },
    { label: "Past (2024-03-15)", date: "2024-03-15" },
  ];

  const handleComputePrediction = async (e, dateOverride) => {
    if (e) e.preventDefault();
    const dateToUse = dateOverride || predictionDate;
    if (!dateToUse) {
      setError("Please specify a target prediction date.");
      return;
    }

    setError("");
    setSelectedHotspot(null);

    try {
      setLoading(true);
      const res = await generateHotspotPrediction(dateToUse);
      setResult(res);
      if (res?.hotspots?.length > 0) {
        setSelectedHotspot(res.hotspots[0]);
      }
    } catch (err) {
      console.error("Prediction computation failed:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to compute spatiotemporal ConvLSTM prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStepDay = (daysDelta) => {
    try {
      const curr = new Date(predictionDate);
      curr.setDate(curr.getDate() + daysDelta);
      const nextDate = curr.toISOString().split("T")[0];
      setPredictionDate(nextDate);
      handleComputePrediction(null, nextDate);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const latest = await getLatestPrediction();
        if (latest?.data) {
          setResult(latest.data);
          setPredictionDate(latest.data.prediction_date || "2024-03-25");
          if (latest.data.hotspots?.length > 0) {
            setSelectedHotspot(latest.data.hotspots[0]);
          }
        } else {
          await handleComputePrediction(null, "2024-03-25");
        }
      } catch {
        await handleComputePrediction(null, "2024-03-25");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

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
      {/* Page Header and View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-palette-almond" />
            Next Crime Spatiotemporal Hotspot Prediction
          </h2>
          <p className="section-subtitle mt-0.5">
            Deep ConvLSTM 2D Neural Network forecasting next crime locations based on 7-day sliding historical crime dynamics
          </p>
        </div>

        <div className="flex bg-palette-ink p-1 rounded-xl border border-[#262c4d] self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab("predict")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === "predict"
                ? "bg-palette-almond text-palette-ink shadow-sm"
                : "text-palette-lilac hover:text-palette-almond"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Live Prediction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-palette-almond text-palette-ink shadow-sm"
                : "text-palette-lilac hover:text-palette-almond"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Prediction Audit
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        <PredictionHistoryTable onSelectPrediction={handleSelectFromHistory} />
      ) : (
        <div className="space-y-6">
          {/* Prediction Controls Deck */}
          <Card className="border-[#262c4d]">
            <CardHeader className="flex flex-wrap justify-between items-center bg-palette-ink/40 py-3.5 gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-palette-almond" />
                <h3 className="text-sm font-semibold tracking-tight text-palette-almond">
                  ConvLSTM Spatiotemporal Inference Control Deck
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-palette-lilac bg-[#1e2444] px-2.5 py-0.5 rounded border border-[#2b3254]">
                  Architecture: (1, 7, 20, 20, 5)
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/40">
                  Dynamic 7-Day Sliding Window
                </span>
              </div>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              <form onSubmit={(e) => handleComputePrediction(e)} className="grid md:grid-cols-3 gap-5 items-end">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-palette-lilac mb-1.5">
                    Target Prediction Date
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepDay(-1)}
                      disabled={loading}
                      title="Step Back 1 Day"
                      className="p-2 rounded-lg bg-[#0c0d16] border border-[#262c4d] text-palette-lilac hover:text-palette-almond hover:border-palette-grape transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="date"
                      value={predictionDate}
                      onChange={(e) => setPredictionDate(e.target.value)}
                      required
                      className="w-full bg-[#0c0d16] border border-[#262c4d] text-palette-almond text-xs px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-palette-almond"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepDay(1)}
                      disabled={loading}
                      title="Step Forward 1 Day (Test Tomorrow)"
                      className="p-2 rounded-lg bg-[#0c0d16] border border-[#262c4d] text-palette-lilac hover:text-palette-almond hover:border-palette-grape transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-palette-lilac mb-1.5">
                    Quick Benchmark Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickDates.map((qd) => (
                      <button
                        type="button"
                        key={qd.date}
                        onClick={() => {
                          setPredictionDate(qd.date);
                          handleComputePrediction(null, qd.date);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 font-medium ${
                          predictionDate === qd.date
                            ? "bg-palette-almond text-palette-ink border-palette-almond font-semibold shadow-glow"
                            : "bg-[#0c0d16] border-[#262c4d] text-palette-lilac hover:text-palette-almond hover:border-palette-grape"
                        }`}
                      >
                        {qd.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    variant="primary"
                    className="w-full h-10 font-bold shadow-glow"
                  >
                    {loading ? "Analyzing 7-Day Spatiotemporal Tensor..." : "Compute Prediction"}
                  </Button>
                </div>
              </form>

              {/* Informative Explanation */}
              <div className="bg-[#0c0d16]/70 p-3 rounded-lg border border-[#262c4d] text-[11px] text-palette-lilac flex items-center justify-between gap-2">
                <span>
                  💡 <strong>How it works:</strong> The ConvLSTM 2D network ingests the 7 daily crime density grids immediately preceding <strong className="text-palette-almond">{predictionDate}</strong>. Shifting dates changes the 7-day input tensor and produces a distinct prediction map!
                </span>
                <span className="text-palette-almond font-semibold flex-shrink-0">
                  Target: {predictionDate}
                </span>
              </div>
            </CardBody>
          </Card>

          {error && (
            <Alert
              type="error"
              title="ConvLSTM Inference Notice"
              message={error}
            />
          )}

          {/* Prediction Results Display */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Spotlight Forecast Banner + 4 Stat Tiles */}
              <PredictionSummary result={result} />

              {/* Interactive Google-Maps-Style Spatiotemporal Map */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-semibold text-palette-almond flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-palette-almond" />
                    Neural Spatiotemporal Hotspot Heatmap (Interactive Google Maps Zoom & Pan)
                  </h3>
                  <span className="text-[11px] text-palette-lilac">
                    Target Date: <strong className="text-palette-almond">{result.prediction_date}</strong> | Model: {result.model?.name || "ConvLSTM 2D"}
                  </span>
                </div>

                <LeafletInteractiveMap
                  hotspots={result.hotspots || []}
                  crimes={result.historical_crimes || []}
                  selectedHotspot={selectedHotspot}
                  onSelectHotspot={setSelectedHotspot}
                  mode="hybrid"
                  height="h-[560px]"
                  targetDate={result.prediction_date}
                />
              </div>

              {/* Ranked Hotspot Clusters List */}
              <HotspotList
                hotspots={result.hotspots || []}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={setSelectedHotspot}
              />

              {/* Risk Classification Legend */}
              <PredictionLegend />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
