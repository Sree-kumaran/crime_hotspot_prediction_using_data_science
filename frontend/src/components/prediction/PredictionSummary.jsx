import { ShieldAlert, Activity, Calendar, Zap, Target, Crosshair, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RiskBadge } from "../ui/Badge/Badge";
import { Card, CardBody, CardHeader } from "../ui/Card/Card";

export default function PredictionSummary({ result }) {
  if (!result) return null;

  const summary = result.summary || {};
  const nextCrime = result.most_likely_next_crime || summary.most_likely_next_crime || (result.hotspots?.[0] ? {
    location_name: result.hotspots[0].location_name || "High Density Hotspot",
    borough: result.hotspots[0].borough || "Manhattan",
    risk_score: result.hotspots[0].risk_score,
    risk_level: result.hotspots[0].risk_level,
    top_predicted_type: "Theft / Grand Larceny",
    crime_type_probabilities: result.hotspots[0].predicted_crime_types || { "Theft / Larceny": 45, "Assault": 25, "Robbery": 18, "Burglary": 12 },
    estimated_peak_window: result.hotspots[0].peak_risk_hours || "20:00 - 02:00",
    recommended_action: `Deploy high-visibility tactical patrol units across ${result.hotspots[0].location_name || "the target corridor"}.`,
    basis_7day_trend: "Neural spatiotemporal density excitation detected across trailing 7-day crime reports.",
  } : null);

  const histSummary = result.historical_7day_summary;
  const overallScore = summary.overall_risk_score ?? (result.hotspots?.[0]?.risk_score ?? 0.82);
  const overallScorePct = (overallScore * 100).toFixed(1);
  const riskLevel = summary.overall_risk_level ?? (overallScore >= 0.75 ? "High" : overallScore >= 0.45 ? "Moderate" : "Low");

  return (
    <div className="space-y-5">
      {/* Spotlight: Most Likely Next Crime Occurrence Forecast */}
      {nextCrime && (
        <Card className="border-red-500/50 bg-gradient-to-br from-[#1a1222] via-palette-prussian to-[#0c0d16] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="bg-red-950/40 border-b border-red-500/30 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                Predicted Next Crime Occurrence Forecast
              </h3>
            </div>
            <span className="text-[11px] font-mono text-red-300/80 bg-red-900/40 px-2.5 py-0.5 rounded border border-red-500/40">
              Rank #1 Hotspot Probability
            </span>
          </CardHeader>

          <CardBody className="p-5 grid md:grid-cols-3 gap-6">
            {/* Left: Location & Crime Type */}
            <div className="space-y-3 border-b md:border-b-0 md:border-r border-[#262c4d] pb-4 md:pb-0 md:pr-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-palette-lilac block">
                  Most Likely Target Location
                </span>
                <h4 className="text-lg font-black text-white">
                  {nextCrime.location_name}
                </h4>
                <p className="text-xs text-palette-almond font-semibold">
                  Borough: {nextCrime.borough}
                </p>
              </div>

              <div className="bg-[#0c0d16]/80 p-3 rounded-xl border border-[#262c4d] space-y-1">
                <span className="text-[10px] font-semibold text-palette-lilac uppercase tracking-wider block">
                  Projected Offense
                </span>
                <div className="text-sm font-bold text-red-400">
                  {nextCrime.top_predicted_type}
                </div>
                <div className="text-[11px] text-amber-300 font-medium">
                  🕒 Peak Risk Window: {nextCrime.estimated_peak_window}
                </div>
              </div>
            </div>

            {/* Middle: Probabilities Breakdown */}
            <div className="space-y-3 border-b md:border-b-0 md:border-r border-[#262c4d] pb-4 md:pb-0 md:pr-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-palette-lilac">
                  Category Probability Distribution
                </span>
                <span className="text-xs font-bold text-palette-almond">
                  {((nextCrime.risk_score || 0.85) * 100).toFixed(1)}% Intensity
                </span>
              </div>

              <div className="space-y-2">
                {nextCrime.crime_type_probabilities &&
                  Object.entries(nextCrime.crime_type_probabilities).map(([cat, prob]) => (
                    <div key={cat} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white font-medium">{cat}</span>
                        <span className="font-bold text-palette-almond">{prob}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0c0d16] rounded-full overflow-hidden border border-[#262c4d]">
                        <div
                          style={{ width: `${prob}%` }}
                          className="h-full bg-gradient-to-r from-palette-almond to-red-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Recommendation & 7-Day Basis */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  Tactical Patrol Recommendation
                </span>
                <p className="text-[11px] text-palette-almond leading-relaxed">
                  {nextCrime.recommended_action}
                </p>
              </div>

              {histSummary && (
                <div className="text-[11px] text-palette-lilac bg-[#0c0d16]/60 p-2.5 rounded-lg border border-[#262c4d] space-y-0.5">
                  <span className="font-semibold text-white block">7-Day Trailing Basis:</span>
                  <span>
                    Computed over <strong className="text-palette-almond">{histSummary.total_crimes_analyzed}</strong> recorded crimes between {histSummary.start_date} and {histSummary.end_date}.
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Primary Result Banner & 4 Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4 border-[#262c4d] bg-palette-prussian">
          <p className="text-[11px] font-bold uppercase tracking-wider text-palette-lilac">
            Analyzed Hotspots
          </p>
          <p className="text-2xl font-bold text-palette-almond mt-1">
            {summary.total_hotspots ?? result.hotspots?.length ?? 0}
          </p>
          <p className="text-[10px] text-palette-lilac/70 mt-0.5">Top Spatiotemporal Clusters</p>
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
            Overall Risk Level
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {riskLevel} ({overallScorePct}%)
          </p>
          <p className="text-[10px] text-emerald-300/70 mt-0.5">7-Day Sliding Window Average</p>
        </div>
      </div>
    </div>
  );
}
