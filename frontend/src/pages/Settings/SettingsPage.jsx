import { useState } from "react";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";

function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <section className="space-y-6">
      <div className="pb-1 border-b border-[#262c4d]">
        <h2 className="section-title flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-palette-almond" />
          System Preferences & Configuration
        </h2>
        <p className="section-subtitle">
          Geospatial parameters, organization profiles, and alert thresholds
        </p>
      </div>

      {saved && (
        <Alert
          type="success"
          title="Configuration Saved"
          message="System preferences and notification settings have been updated successfully."
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-[#262c4d]">
          <CardHeader className="bg-palette-ink/40 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
              Organization & Environment Settings
            </h3>
          </CardHeader>
          <CardBody className="p-5 grid sm:grid-cols-2 gap-4">
            <Input
              label="Agency / Division Name"
              defaultValue="NYC Geospatial Safety Unit"
            />
            <Input
              label="Primary Target Jurisdiction"
              defaultValue="New York City, NY"
            />
          </CardBody>
        </Card>

        <Card className="border-[#262c4d]">
          <CardHeader className="bg-palette-ink/40 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
              ConvLSTM Hotspot Alert Thresholds
            </h3>
          </CardHeader>
          <CardBody className="p-5 grid sm:grid-cols-2 gap-4">
            <Select
              label="High-Risk Alert Sensitivity"
              defaultValue="high"
              options={[
                { value: "high", label: "High Sensitivity (>75% risk threshold)" },
                { value: "medium", label: "Moderate Sensitivity (>60% threshold)" },
                { value: "low", label: "Low Sensitivity (>85% threshold)" },
              ]}
            />
            <Select
              label="Primary Notification Channel"
              defaultValue="inapp"
              options={[
                { value: "inapp", label: "Real-Time In-App HUD Alert" },
                { value: "email", label: "Automated Email Intelligence Dispatch" },
              ]}
            />
          </CardBody>
        </Card>

        <div>
          <Button type="submit" variant="primary" className="font-bold flex items-center gap-1.5">
            <Save size={15} /> Save Preferences
          </Button>
        </div>
      </form>
    </section>
  );
}

export default SettingsPage;
