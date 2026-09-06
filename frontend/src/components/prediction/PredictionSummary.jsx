import { ShieldAlert, Activity, Calendar, Zap } from "lucide-react";
import { RiskBadge } from "../ui/Badge/Badge";
import { Card, CardBody, CardHeader } from "../ui/Card/Card";

export default function PredictionSummary({ result }) {
  if (!result) return null;

  const summary = result.summary || {};
  const overallScore = summary.overall_risk_score ?? (result.hotspots?.[0]?.risk_score ?? 0.82);
  const overallScorePct = (overallScore * 100).toFixed(1);
  const riskLevel = summary.overall_risk_level ?? (overallScore >= 0.75 ? "High" : overallScore >= 0.45 ? "Moderate" : "Low");

  return (
    <div className="space-y-4">
      {/* Primary Result Banner */}
      <Card className="border-palette-grape bg-palette-prussian shadow-glow overflow-hidden">
        <CardHeader className="bg-palette-ink/50 py-3 flex justify-between items-center border-[#262c4d]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-palette-almond" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-palette-almond">
              Prediction Result
            </h3>
          </div>
          <span className="text-[11px] font-mono text-palette-lilac">
            Model: {result.model?.name || "ConvLSTM 2D"} (v{result.model?.version || "1.0"})
          </span>
        </CardHeader>
        <CardBody className="p-6 grid md:grid-cols-3 gap-6 items-center">
          {/* Risk Level Badge & Title */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-[#262c4d] pb-4 md:pb-0 md:pr-4">
            <p className="text-xs uppercase font-bold tracking-wider text-palette-lilac">
              Assessed Risk Level
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-palette-almond tracking-tight">
                {riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-xs text-palette-lilac/80 pt-1">
              Evaluated for target date: <strong className="text-palette-almond">{result.prediction_date}</strong>
            </p>
          </div>

          {/* Overall Confidence / Risk Score Bar */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-[#262c4d] pb-4 md:pb-0 md:pr-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-palette-lilac">
                Overall Risk Score
              </span>
              <span className="text-xl font-black text-palette-almond">
                {overallScorePct}%
              </span>
            </div>
            {/* Visual Risk Progress Bar */}
            <div className="w-full h-3 rounded-full bg-palette-ink overflow-hidden border border-[#262c4d] p-0.5">
              <div
                style={{ width: `${Math.max(5, Math.min(100, overallScorePct))}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  riskLevel === "High"
                    ? "bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                    : riskLevel === "Moderate"
                    ? "bg-gradient-to-r from-emerald-500 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    : "bg-emerald-500"
                }`}
              />
            </div>
            <p className="text-[11px] text-palette-lilac/70">
              Mean spatial density probability across top clusters
            </p>
          </div>

          {/* Temporal & Execution Metadata */}
          <div className="space-y-1.5 text-xs text-palette-lilac">
            <div className="flex justify-between">
              <span>Analysis Sequence:</span>
              <span className="font-semibold text-palette-almond">7-Day Historical Window</span>
            </div>
            <div className="flex justify-between">
              <span>Grid Matrix:</span>
              <span className="font-semibold text-palette-almond">20 x 20 NYC Spatial Cells</span>
            </div>
            <div className="flex justify-between">
              <span>Feature Channels:</span>
              <span className="font-semibold text-palette-almond">5 Crime Categories</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 border-t border-[#262c4d]">
              <span>Inference Generated:</span>
              <span>{result.generated_at ? new Date(result.generated_at).toLocaleTimeString() : "Just now"}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4 Stat Breakdown Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4 border-[#262c4d] bg-palette-prussian">
          <p className="text-[11px] font-bold uppercase tracking-wider text-palette-lilac">
            Total Hotspots
          </p>
          <p className="text-2xl font-bold text-palette-almond mt-1">
            {summary.total_hotspots ?? result.hotspots?.length ?? 0}
          </p>
          <p className="text-[10px] text-palette-lilac/70 mt-0.5">Top-20 Density Clusters</p>
        </div>

        <div className="card-base p-4 border-red-900/50 bg-red-950/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-300">
            High Risk Zones
          </p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {summary.high_risk ?? 0}
          </p>
          <p className="text-[10px] text-red-300/70 mt-0.5">Score &gt; 75%</p>
        </div>

        <div className="card-base p-4 border-amber-900/50 bg-amber-950/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Moderate Risk Zones
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {summary.medium_risk ?? 0}
          </p>
          <p className="text-[10px] text-amber-300/70 mt-0.5">Score 45% - 75%</p>
        </div>

        <div className="card-base p-4 border-emerald-900/50 bg-emerald-950/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Low Risk Baseline
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {summary.low_risk ?? 0}
          </p>
          <p className="text-[10px] text-emerald-300/70 mt-0.5">Score &lt; 45%</p>
        </div>
      </div>
    </div>
  );
}
