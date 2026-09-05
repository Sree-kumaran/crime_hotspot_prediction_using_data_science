import { useState } from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import { predictCrime } from "../../services/predictionService";

const initial = {
  location: "",
  latitude: "",
  longitude: "",
  date: "",
  time: "",
  crimeType: "",
  dayOfWeek: "",
};

function PredictionPage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.location) e.location = "Location is required";
    if (
      form.latitude === "" ||
      Number(form.latitude) < -90 ||
      Number(form.latitude) > 90
    )
      e.latitude = "Latitude must be between -90 and 90";
    if (
      form.longitude === "" ||
      Number(form.longitude) < -180 ||
      Number(form.longitude) > 180
    )
      e.longitude = "Longitude must be between -180 and 180";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    if (!form.crimeType) e.crimeType = "Crime type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await predictCrime(form);
    setResult(res);
    setLoading(false);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Prediction</h2>
        <p className="section-subtitle">
          Demo prediction workflow with frontend mock processing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>Prediction Input</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              error={errors.location}
            />
            <Input
              label="Latitude"
              type="number"
              value={form.latitude}
              onChange={(e) => setField("latitude", e.target.value)}
              error={errors.latitude}
            />
            <Input
              label="Longitude"
              type="number"
              value={form.longitude}
              onChange={(e) => setField("longitude", e.target.value)}
              error={errors.longitude}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              error={errors.date}
            />
            <Input
              label="Time"
              type="time"
              value={form.time}
              onChange={(e) => setField("time", e.target.value)}
              error={errors.time}
            />
            <Select
              label="Crime Type"
              value={form.crimeType}
              onChange={(e) => setField("crimeType", e.target.value)}
              error={errors.crimeType}
              options={[
                { value: "theft", label: "Theft" },
                { value: "assault", label: "Assault" },
                { value: "robbery", label: "Robbery" },
              ]}
            />
            <Select
              label="Day of Week"
              value={form.dayOfWeek}
              onChange={(e) => setField("dayOfWeek", e.target.value)}
              options={[
                { value: "mon", label: "Monday" },
                { value: "tue", label: "Tuesday" },
                { value: "wed", label: "Wednesday" },
              ]}
            />
            <div className="md:col-span-2">
              <Button type="submit" loading={loading}>
                Run Prediction (Mock)
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <h3>Prediction Result (Demo)</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <Alert
              type="info"
              title="Mock Result"
              message="This prediction is generated from static frontend mock service."
            />
            <p>
              <strong>Risk:</strong> <RiskBadge level={result.riskLevel} />
            </p>
            <p>
              <strong>Risk Score:</strong> {result.riskScore}
            </p>
            <p>
              <strong>Predicted Category:</strong> {result.predictedCategory}
            </p>
            <p>
              <strong>Confidence:</strong> {result.confidence}
            </p>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

export default PredictionPage;
