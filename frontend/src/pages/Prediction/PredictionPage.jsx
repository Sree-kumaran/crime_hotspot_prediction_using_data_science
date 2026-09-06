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
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import HotspotMap from "../../components/map/HotspotMap";
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

  const quickDates = ["2024-03-25", "2024-03-20", "2024-03-15", "2024-03-10"];

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

  useEffect(() => {
    // Attempt to load latest prediction or default date on initial mount
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
            Spatiotemporal Crime Hotspot Prediction
          </h2>
          <p className="section-subtitle mt-0.5">
            ConvLSTM 2D deep spatiotemporal neural network inference over accumulated historical dataset
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
            <CardHeader className="flex justify-between items-center bg-palette-ink/40 py-3.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-palette-almond" />
                <h3 className="text-sm font-semibold tracking-tight text-palette-almond">
                  ConvLSTM Spatiotemporal Inference Control Deck
                </h3>
              </div>
              <span className="text-[11px] font-mono text-palette-lilac bg-[#1e2444] px-2.5 py-0.5 rounded border border-[#2b3254]">
                Architecture: (1, 7, 20, 20, 5)
              </span>
            </CardHeader>
            <CardBody className="p-5">
              <form onSubmit={(e) => handleComputePrediction(e)} className="grid md:grid-cols-3 gap-5 items-end">
                <div>
                  <Input
                    label="Target Prediction Date"
                    type="date"
                    value={predictionDate}
                    onChange={(e) => setPredictionDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-palette-lilac mb-1.5">
                    Benchmark Historical Dates
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickDates.map((qd) => (
                      <button
                        type="button"
                        key={qd}
                        onClick={() => {
                          setPredictionDate(qd);
                          handleComputePrediction(null, qd);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 font-medium ${
                          predictionDate === qd
                            ? "bg-palette-almond text-palette-ink border-palette-almond font-semibold shadow-glow"
                            : "bg-palette-ink border-[#262c4d] text-palette-lilac hover:text-palette-almond hover:border-palette-grape"
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
                    variant="primary"
                    className="w-full h-10 font-bold shadow-glow"
                  >
                    {loading ? "Analyzing 7-Day Spatiotemporal Tensor..." : "Compute Prediction"}
                  </Button>
                </div>
              </form>
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
              {/* Summary Card with Overall Score Progress & 4 Stat Tiles */}
              <PredictionSummary result={result} />

              {/* Spatiotemporal Interactive Map */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-semibold text-palette-almond flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-palette-almond" />
                    Neural Spatiotemporal Hotspot Heatmap
                  </h3>
                  <span className="text-[11px] text-palette-lilac">
                    Target: <strong className="text-palette-almond">{result.prediction_date}</strong> | Model: {result.model?.name || "ConvLSTM 2D"}
                  </span>
                </div>
                <HotspotMap
                  hotspots={result.hotspots || []}
                  selectedHotspot={selectedHotspot}
                  onSelectHotspot={setSelectedHotspot}
                  height="h-[520px]"
                />
              </div>

              {/* Ranked Hotspot Clusters */}
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
