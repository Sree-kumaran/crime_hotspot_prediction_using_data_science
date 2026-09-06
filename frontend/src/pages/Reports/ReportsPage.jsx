import { useState } from "react";
import { FileText, Download, Sparkles, CheckCircle2 } from "lucide-react";
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
    const r = await generateReport({ scope: "Citywide Assessment" });
    setReport(r);
    setLoading(false);
  };

  return (
    <section className="space-y-6">
      <div className="pb-1 border-b border-[#262c4d]">
        <h2 className="section-title flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-palette-almond" />
          Intelligence Reports & Briefs
        </h2>
        <p className="section-subtitle">
          Generate structured crime analytics briefs and export summaries
        </p>
      </div>

      <Card className="border-[#262c4d]">
        <CardHeader className="bg-palette-ink/40 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
            Report Scope Parameters
          </h3>
        </CardHeader>
        <CardBody className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Period From" type="date" defaultValue="2024-01-01" />
          <Input label="Period To" type="date" defaultValue="2024-03-31" />
          <Select
            label="Category Focus"
            options={[
              { value: "all", label: "All Crime Types" },
              { value: "theft", label: "Theft & Larceny" },
              { value: "assault", label: "Assault & Violence" },
            ]}
          />
          <Select
            label="Priority Filter"
            options={[
              { value: "all", label: "All Severity Levels" },
              { value: "high", label: "High Priority Only" },
            ]}
          />
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onGenerate} loading={loading} variant="primary" className="font-bold">
          {loading ? "Synthesizing Report..." : "Generate Executive Brief"}
        </Button>
        <Button variant="outline" className="text-xs flex items-center gap-1.5">
          <Download size={14} /> Export Brief (PDF)
        </Button>
        <Button variant="outline" className="text-xs flex items-center gap-1.5">
          <Download size={14} /> Export Data (CSV)
        </Button>
      </div>

      {report && (
        <Card className="border-palette-grape bg-palette-prussian shadow-glow">
          <CardHeader className="flex justify-between items-center bg-palette-ink/50 border-[#262c4d]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-palette-almond">
                Executive Crime Intelligence Brief: #{report.id}
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300">
              {report.status}
            </span>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-palette-ink border border-[#262c4d]">
                <p className="text-[10px] uppercase font-bold text-palette-lilac">Total Incidents Sampled</p>
                <p className="text-xl font-bold text-palette-almond mt-0.5">{report.total_crimes}</p>
              </div>
              <div className="p-3 rounded-lg bg-palette-ink border border-[#262c4d]">
                <p className="text-[10px] uppercase font-bold text-red-300">High Risk Incidents</p>
                <p className="text-xl font-bold text-red-400 mt-0.5">{report.high_risk_incidents}</p>
              </div>
              <div className="p-3 rounded-lg bg-palette-ink border border-[#262c4d]">
                <p className="text-[10px] uppercase font-bold text-palette-almond">Active Hotspots</p>
                <p className="text-xl font-bold text-palette-almond mt-0.5">{report.active_hotspots}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-palette-ink border border-[#262c4d] space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-palette-almond">
                Executive Synthesis
              </p>
              <p className="text-xs md:text-sm text-palette-lilac leading-relaxed">
                {report.summary}
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

export default ReportsPage;
