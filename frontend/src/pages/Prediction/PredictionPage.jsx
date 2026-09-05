import { useState } from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import { generateHotspotPrediction } from "../../services/predictionService";

function PredictionPage() {
  const [predictionDate, setPredictionDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!predictionDate) {
      setError("Prediction date is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await generateHotspotPrediction(predictionDate);
      setResult(res);
    } catch (err) {
      setError(err.message || "Unable to generate prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Crime Hotspot Prediction</h2>
        <p className="section-subtitle">Ready to generate prediction</p>
      </div>

      <Card>
        <CardHeader>
          <h3>Prediction Controls</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={onGenerate} className="grid md:grid-cols-2 gap-3">
            <Input
              label="Prediction Date"
              type="date"
              value={predictionDate}
              onChange={(e) => setPredictionDate(e.target.value)}
              required
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading} loading={loading}>
                {loading
                  ? "Generating crime hotspot prediction..."
                  : "Generate Prediction"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {error && <Alert type="error" title="Prediction Error" message={error} />}

      {result && (
        <Card>
          <CardHeader>
            <h3>Prediction Output</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <p>
              <strong>Prediction Date:</strong> {result.prediction_date}
            </p>
            <p>
              <strong>Generated At:</strong> {result.generated_at}
            </p>
            <p>
              <strong>Model:</strong> {result.model?.name} (v
              {result.model?.version})
            </p>

            <div className="grid md:grid-cols-4 gap-3">
              <div className="card-base p-3">
                <p>Total Hotspots</p>
                <p className="font-bold">{result.summary.total_hotspots}</p>
              </div>
              <div className="card-base p-3">
                <p>High Risk</p>
                <p className="font-bold">{result.summary.high_risk}</p>
              </div>
              <div className="card-base p-3">
                <p>Medium Risk</p>
                <p className="font-bold">{result.summary.medium_risk}</p>
              </div>
              <div className="card-base p-3">
                <p>Low Risk</p>
                <p className="font-bold">{result.summary.low_risk}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {result.hotspots?.slice(0, 10).map((h, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-[#3f535c] bg-[#24353c]"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Hotspot #{idx + 1}</span>
                    <RiskBadge
                      level={
                        h.risk_level === "Medium" ? "Moderate" : h.risk_level
                      }
                    />
                  </div>
                  <p className="text-xs">
                    Risk Score: {(h.risk_score * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs">
                    Predicted Intensity: {h.predicted_intensity}
                  </p>
                  <p className="text-xs">Latitude: {h.latitude}</p>
                  <p className="text-xs">Longitude: {h.longitude}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

export default PredictionPage;
