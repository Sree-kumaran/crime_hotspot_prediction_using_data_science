import { MapPin, Target, Layers } from "lucide-react";
import { RiskBadge } from "../ui/Badge/Badge";
import { Card, CardBody, CardHeader } from "../ui/Card/Card";

export default function HotspotList({
  hotspots = [],
  selectedHotspot = null,
  onSelectHotspot = () => {},
}) {
  if (!hotspots || hotspots.length === 0) return null;

  return (
    <Card className="border-[#262c4d]">
      <CardHeader className="flex justify-between items-center bg-palette-ink/40 py-3.5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-palette-almond" />
          <h3 className="text-sm font-semibold text-palette-almond">
            Top Predicted Hotspots ({hotspots.length} Clusters)
          </h3>
        </div>
        <span className="text-[11px] text-palette-lilac">
          Sorted by ConvLSTM neural density intensity
        </span>
      </CardHeader>
      <CardBody className="p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hotspots.map((h, idx) => {
            const isSelected =
              selectedHotspot &&
              selectedHotspot.latitude === h.latitude &&
              selectedHotspot.longitude === h.longitude;

            const scorePct = ((h.risk_score || 0) * 100).toFixed(1);

            return (
              <div
                key={idx}
                onClick={() => onSelectHotspot(h)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-palette-grape/50 border-palette-almond ring-1 ring-palette-almond shadow-glow scale-[1.02]"
                    : "bg-palette-ink border-[#262c4d] hover:border-palette-grape hover:bg-[#161b33]"
                }`}
              >
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#262c4d]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#1e2444] border border-[#2b3254] flex items-center justify-center text-[10px] font-bold text-palette-almond">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-palette-almond">
                      Cluster {idx + 1}
                    </span>
                  </div>
                  <RiskBadge
                    level={
                      h.risk_level === "Medium" ? "Moderate" : h.risk_level
                    }
                  />
                </div>

                <div className="space-y-1 text-xs text-palette-lilac">
                  <div className="flex justify-between items-center">
                    <span>Risk Score:</span>
                    <span className="font-bold text-palette-almond text-sm">
                      {scorePct}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Density Intensity:</span>
                    <span className="font-mono text-palette-almond">
                      {h.predicted_intensity}
                    </span>
                  </div>
                  <div className="text-[11px] text-palette-lilac/70 pt-1.5 mt-1 border-t border-[#262c4d] flex items-center justify-between">
                    <span>Location:</span>
                    <span className="font-mono text-palette-almond">
                      {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
