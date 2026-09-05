import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";

function SettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Settings</h2>
        <p className="section-subtitle">
          General and preference configuration UI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>General Settings</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 gap-3">
          <Input label="Organization Name" placeholder="Public Safety Unit" />
          <Input label="Default City" placeholder="Enter city" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Notification Preferences</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 gap-3">
          <Select
            label="Alert Sensitivity"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <Select
            label="Notification Channel"
            options={[
              { value: "email", label: "Email" },
              { value: "inapp", label: "In-App" },
            ]}
          />
        </CardBody>
      </Card>

      <Button>Save Settings</Button>
    </section>
  );
}

export default SettingsPage;
