import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilePlus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  Sparkles,
  Layers,
  Database,
  Cpu,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import CrimeDataForm from "../../components/crime/CrimeDataForm";
import RecentCrimeRecords from "../../components/crime/RecentCrimeRecords";
import { createCrimeRecord, getIncidents } from "../../services/incidentService";

export default function AddCrimeDataPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const loadRecentRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await getIncidents({ limit: 8 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRecentRecords(list);
    } catch (err) {
      console.error("Failed to fetch recent records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecentRecords();
  }, []);

  const handleCreateCrime = async (formData) => {
    setLoading(true);
    setError("");
    setSubmissionResult(null);

    try {
      const response = await createCrimeRecord(formData);
      setSubmissionResult(response);
      // Reload recent records to reflect newly stored document
      await loadRecentRecords();
    } catch (err) {
      console.error("Failed to add crime record:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to save crime record to MongoDB. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setError("");
  };

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <FilePlus className="w-5 h-5 text-palette-almond" />
            Add Crime Data
          </h2>
          <p className="section-subtitle">
            Add a new crime record to the historical dataset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-xs"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/prediction")}
            className="flex items-center gap-1.5 text-xs"
          >
            <Sparkles size={14} />
            Predictions
          </Button>
        </div>
      </div>

      {/* Global API Error Display */}
      {error && <Alert type="error" title="Ingestion Error" message={error} />}

      {/* Dual-Status / Success Feedback Banner */}
      {submissionResult && (
        <Card className="border-palette-grape bg-palette-prussian shadow-glow animate-fadeIn">
          <CardHeader className="bg-palette-ink/50 py-3.5 border-[#262c4d] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-palette-almond">
                Ingestion & Prediction Pipeline Execution Complete
              </h3>
            </div>
            <span className="text-[11px] font-mono text-palette-lilac bg-[#1e2444] px-2.5 py-0.5 rounded border border-[#2b3254]">
              Status: 201 Created
            </span>
          </CardHeader>
          <CardBody className="p-5 space-y-4">
            {/* Double-Status Cards Row */}
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Status 1: Database Storage */}
              <div className="p-3.5 rounded-xl bg-palette-ink border border-emerald-900/60 flex items-start gap-3">
                <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-300">
                    ✓ Crime Record Saved to MongoDB
                  </p>
                  <p className="text-[11px] text-palette-lilac">
                    Document inserted in <code className="text-palette-almond">crimes</code> collection (ID: {submissionResult.crime?.id || "Saved"})
                  </p>
                </div>
              </div>

              {/* Status 2: ConvLSTM Model Update */}
              <div
                className={`p-3.5 rounded-xl bg-palette-ink border flex items-start gap-3 ${
                  submissionResult.prediction_status === "success"
                    ? "border-emerald-900/60"
                    : "border-amber-900/60"
                }`}
              >
                <Cpu
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    submissionResult.prediction_status === "success"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                />
                <div className="space-y-0.5">
                  {submissionResult.prediction_status === "success" ? (
                    <>
                      <p className="text-xs font-bold text-emerald-300">
                        ✓ Spatiotemporal Hotspot Prediction Updated
                      </p>
                      <p className="text-[11px] text-palette-lilac">
                        ConvLSTM evaluated 7-day tensor &amp; generated {submissionResult.prediction?.hotspots?.length || 20} hotspot clusters
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-amber-300">
                        ⚠ Prediction Update Encounted a Notice
                      </p>
                      <p className="text-[11px] text-palette-lilac">
                        Record was safely stored. Pipeline error: {submissionResult.prediction_error || "Check historical window"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ingested Record Summary Card */}
            {submissionResult.crime && (
              <div className="p-4 rounded-xl bg-palette-ink border border-[#262c4d] space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-palette-lilac">
                  Ingested Record Summary
                </p>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-palette-lilac">Crime Category: </span>
                    <strong className="text-palette-almond capitalize">
                      {submissionResult.crime.crime_type}
                    </strong>
                  </div>
                  <div>
                    <span className="text-palette-lilac">Date &amp; Time: </span>
                    <strong className="text-palette-almond">
                      {submissionResult.crime.date} {submissionResult.crime.time}
                    </strong>
                  </div>
                  <div>
                    <span className="text-palette-lilac">Location Area: </span>
                    <strong className="text-palette-almond">
                      {submissionResult.crime.location || submissionResult.crime.area}
                    </strong>
                  </div>
                  <div>
                    <span className="text-palette-lilac">GPS Coordinates: </span>
                    <span className="font-mono text-palette-almond">
                      {submissionResult.crime.latitude}, {submissionResult.crime.longitude}
                    </span>
                  </div>
                  <div>
                    <span className="text-palette-lilac">Severity: </span>
                    <RiskBadge level={submissionResult.crime.severity || "Moderate"} />
                  </div>
                  <div>
                    <span className="text-palette-lilac">Status: </span>
                    <span className="text-palette-almond font-medium">
                      {submissionResult.crime.status || "Reported"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation / Next Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleResetForm}
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <FilePlus size={14} />
                Add Another Record
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <LayoutDashboard size={14} />
                View Updated Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/map")}
                className="flex items-center gap-1.5 text-xs"
              >
                <Layers size={14} />
                View Updated Hotspot Map
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main Data Ingestion Form */}
      <CrimeDataForm onSubmit={handleCreateCrime} loading={loading} />

      {/* Live Feed: Recently Ingested MongoDB Crime Records */}
      <RecentCrimeRecords
        records={recentRecords}
        loading={loadingRecords}
        onRefresh={loadRecentRecords}
      />
    </section>
  );
}
