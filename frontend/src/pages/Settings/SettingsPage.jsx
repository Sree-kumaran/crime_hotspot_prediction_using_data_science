import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  Bell,
  Building,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { SkeletonCard } from "../../components/ui/Loading/Loading";
import {
  getAppSettings,
  updateAppSettings,
  resetAppSettings,
} from "../../services/settingsService";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    agency_name: "NYC Geospatial Intelligence Unit",
    jurisdiction: "New York City, NY",
    low_risk_threshold: 0.45,
    high_risk_threshold: 0.75,
    top_k_hotspots: 20,
    default_zoom: 12,
    heatmap_radius: 25,
    notification_channel: "inapp",
    updated_at: null,
  });

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getAppSettings();
      if (res) {
        setFormData(res);
        setInitialData(res);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setStatusMessage({
        type: "error",
        title: "Settings Load Notice",
        message: err?.message || "Using local baseline configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.agency_name?.trim()) errs.agency_name = "Agency name is required.";
    if (!formData.jurisdiction?.trim()) errs.jurisdiction = "Jurisdiction is required.";

    const low = parseFloat(formData.low_risk_threshold);
    const high = parseFloat(formData.high_risk_threshold);

    if (isNaN(low) || low < 0.05 || low > 0.55) {
      errs.low_risk_threshold = "Low threshold must be between 0.05 (5%) and 0.55 (55%).";
    }
    if (isNaN(high) || high < 0.55 || high > 0.95) {
      errs.high_risk_threshold = "High threshold must be between 0.55 (55%) and 0.95 (95%).";
    }
    if (high <= low) {
      errs.high_risk_threshold = "High threshold must be strictly greater than low threshold.";
    }

    const topK = parseInt(formData.top_k_hotspots, 10);
    if (isNaN(topK) || topK < 5 || topK > 50) {
      errs.top_k_hotspots = "Hotspots count must be between 5 and 50.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        ...formData,
        low_risk_threshold: parseFloat(formData.low_risk_threshold),
        high_risk_threshold: parseFloat(formData.high_risk_threshold),
        top_k_hotspots: parseInt(formData.top_k_hotspots, 10),
        default_zoom: parseInt(formData.default_zoom, 10),
        heatmap_radius: parseInt(formData.heatmap_radius, 10),
      };

      const updated = await updateAppSettings(payload);
      setFormData(updated);
      setInitialData(updated);
      setStatusMessage({
        type: "success",
        title: "Configuration Saved to Database",
        message: `Preferences persisted to MongoDB. Risk thresholds (Low: ${(updated.low_risk_threshold * 100).toFixed(0)}%, High: ${(updated.high_risk_threshold * 100).toFixed(0)}%) are now active across prediction pipelines.`,
      });
    } catch (err) {
      console.error("Save failed:", err);
      setStatusMessage({
        type: "error",
        title: "Save Failed",
        message: err.response?.data?.detail || err.message || "Failed to persist settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setStatusMessage(null);

    try {
      const def = await resetAppSettings();
      setFormData(def);
      setInitialData(def);
      setErrors({});
      setStatusMessage({
        type: "success",
        title: "Settings Reset to Defaults",
        message: "System configuration and risk thresholds have been restored to factory defaults.",
      });
    } catch (err) {
      console.error("Reset failed:", err);
      setStatusMessage({
        type: "error",
        title: "Reset Failed",
        message: err.message || "Failed to reset settings.",
      });
    } finally {
      setResetting(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="pb-1 border-b border-[#262c4d]">
          <h2 className="section-title">System Preferences & Configuration</h2>
          <p className="section-subtitle">Loading persistent configuration from database...</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-palette-almond" />
            System Preferences & Configuration
          </h2>
          <p className="section-subtitle">
            Geospatial parameters, ConvLSTM risk thresholds, and notification controls stored in MongoDB
          </p>
        </div>

        {formData.updated_at && (
          <span className="text-[11px] font-mono text-palette-lilac bg-[#1e2444] px-2.5 py-1 rounded border border-[#2b3254] self-start sm:self-auto">
            Last Updated: {new Date(formData.updated_at).toLocaleString()}
          </span>
        )}
      </div>

      {statusMessage && (
        <Alert
          type={statusMessage.type}
          title={statusMessage.title}
          message={statusMessage.message}
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Organization & Jurisdiction */}
        <Card className="border-[#262c4d]">
          <CardHeader className="bg-palette-ink/40 py-3.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-palette-almond" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
              Organization & Jurisdiction Profile
            </h3>
          </CardHeader>
          <CardBody className="p-5 grid sm:grid-cols-2 gap-4">
            <Input
              label="Agency / Division Name *"
              value={formData.agency_name}
              onChange={(e) => handleChange("agency_name", e.target.value)}
              error={errors.agency_name}
              required
            />
            <Input
              label="Primary Target Jurisdiction *"
              value={formData.jurisdiction}
              onChange={(e) => handleChange("jurisdiction", e.target.value)}
              error={errors.jurisdiction}
              required
            />
          </CardBody>
        </Card>

        {/* Section 2: ConvLSTM Risk Thresholds */}
        <Card className="border-[#262c4d]">
          <CardHeader className="bg-palette-ink/40 py-3.5 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-palette-almond" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
              ConvLSTM Risk Classification & Cluster Tuning
            </h3>
          </CardHeader>
          <CardBody className="p-5 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Low Risk Cutoff (0.05 to 0.55) *"
                type="number"
                step="0.01"
                min="0.05"
                max="0.55"
                value={formData.low_risk_threshold}
                onChange={(e) => handleChange("low_risk_threshold", e.target.value)}
                error={errors.low_risk_threshold}
                helperText="Scores below this are classified as Low Risk (<45%)"
                required
              />

              <Input
                label="High Risk Cutoff (0.55 to 0.95) *"
                type="number"
                step="0.01"
                min="0.55"
                max="0.95"
                value={formData.high_risk_threshold}
                onChange={(e) => handleChange("high_risk_threshold", e.target.value)}
                error={errors.high_risk_threshold}
                helperText="Scores above this are classified as High Risk (>75%)"
                required
              />

              <Input
                label="Top Hotspots Extracted (5 to 50) *"
                type="number"
                min="5"
                max="50"
                value={formData.top_k_hotspots}
                onChange={(e) => handleChange("top_k_hotspots", e.target.value)}
                error={errors.top_k_hotspots}
                helperText="Number of prioritized spatial clusters"
                required
              />
            </div>

            {/* Visual Threshold Bar */}
            <div className="p-3.5 rounded-xl bg-palette-ink border border-[#262c4d] space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-emerald-400">
                  Low Risk (&lt;{(formData.low_risk_threshold * 100).toFixed(0)}%)
                </span>
                <span className="text-amber-400">
                  Moderate Risk ({(formData.low_risk_threshold * 100).toFixed(0)}% – {(formData.high_risk_threshold * 100).toFixed(0)}%)
                </span>
                <span className="text-red-400">
                  High Risk (&gt;{(formData.high_risk_threshold * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#161b33] border border-[#262c4d] overflow-hidden flex">
                <div
                  style={{ width: `${formData.low_risk_threshold * 100}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                />
                <div
                  style={{
                    width: `${(formData.high_risk_threshold - formData.low_risk_threshold) * 100}%`,
                  }}
                  className="bg-amber-500 transition-all duration-300"
                />
                <div
                  style={{ width: `${(1 - formData.high_risk_threshold) * 100}%` }}
                  className="bg-red-500 transition-all duration-300"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Section 3: Map & Dispatch Settings */}
        <Card className="border-[#262c4d]">
          <CardHeader className="bg-palette-ink/40 py-3.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-palette-almond" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
              Geospatial Visualizer & Alert Notification Settings
            </h3>
          </CardHeader>
          <CardBody className="p-5 grid sm:grid-cols-3 gap-4">
            <Input
              label="Default Map Zoom Level (8 - 18)"
              type="number"
              min="8"
              max="18"
              value={formData.default_zoom}
              onChange={(e) => handleChange("default_zoom", e.target.value)}
              helperText="Initial viewport zoom for NYC map"
            />

            <Input
              label="Heatmap Radius (10 - 60px)"
              type="number"
              min="10"
              max="60"
              value={formData.heatmap_radius}
              onChange={(e) => handleChange("heatmap_radius", e.target.value)}
              helperText="Pixel halo blur radius"
            />

            <Select
              label="Primary Notification Channel"
              value={formData.notification_channel}
              onChange={(e) => handleChange("notification_channel", e.target.value)}
              options={[
                { value: "inapp", label: "Real-Time In-App HUD Alert" },
                { value: "email", label: "Automated Email Intelligence Dispatch" },
              ]}
            />
          </CardBody>
        </Card>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || !hasChanges}
              loading={saving}
              className="font-bold flex items-center gap-1.5 shadow-glow"
            >
              <Save size={15} /> Save Changes
            </Button>

            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormData(initialData);
                  setErrors({});
                }}
                className="text-xs text-palette-lilac hover:text-palette-almond"
              >
                Discard Edits
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={resetting}
            loading={resetting}
            onClick={handleReset}
            className="text-xs flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Reset to System Defaults
          </Button>
        </div>
      </form>
    </section>
  );
}
