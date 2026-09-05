import { useState } from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import { generateReport } from "../../services/reportService";

function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const onGenerate = async () => {
    setLoading(true);
    const r = await generateReport({ scope: "weekly" });
    setReport(r);
    setLoading(false);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Reports</h2>
        <p className="section-subtitle">
          Generate and preview reports (mock export flow).
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>Report Filters</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input label="From" type="date" />
          <Input label="To" type="date" />
          <Select
            label="Crime Type"
            options={[{ value: "theft", label: "Theft" }]}
          />
          <Select
            label="Risk Level"
            options={[{ value: "high", label: "High" }]}
          />
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Button onClick={onGenerate} loading={loading}>
          Generate Report
        </Button>
        <Button variant="outline">Export PDF (Mock)</Button>
        <Button variant="outline">Export CSV (Mock)</Button>
      </div>

      {report && (
        <Card>
          <CardHeader>
            <h3>Report Preview</h3>
          </CardHeader>
          <CardBody>
            <p>
              <strong>Report ID:</strong> {report.id}
            </p>
            <p>
              <strong>Status:</strong> {report.status}
            </p>
            <p>{report.summary}</p>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

export default ReportsPage;
