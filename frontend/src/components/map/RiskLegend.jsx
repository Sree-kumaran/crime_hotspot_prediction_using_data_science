import { RiskBadge } from "../ui/Badge/Badge";
import { Info, ShieldAlert } from "lucide-react";

function RiskLegend() {
  const levels = [
    { level: "High", desc: "Risk Score > 75% | High probability hotspot" },
    { level: "Moderate", desc: "Risk Score 45-75% | Elevated surveillance area" },
    { level: "Low", desc: "Risk Score < 45% | Standard patrol baseline" },
  ];

  return (
    <div className="card-base p-5 space-y-4 border-[#262c4d]">
      <div className="flex items-center gap-2 pb-2 border-b border-[#262c4d]">
        <ShieldAlert size={16} className="text-palette-almond" />
        <h3 className="text-sm font-semibold text-palette-almond">
          Hotspot Risk Classification
        </h3>
      </div>

      <div className="space-y-3">
        {levels.map((item) => (
          <div
            key={item.level}
            className="p-2.5 rounded-lg bg-[#12162a]/80 border border-[#262c4d] space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-palette-almond">
                {item.level} Priority
              </span>
              <RiskBadge level={item.level} />
            </div>
            <p className="text-[11px] text-palette-lilac/80">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-lg bg-palette-ink border border-[#262c4d] text-[10px] text-palette-lilac flex items-start gap-2">
        <Info size={14} className="text-palette-almond shrink-0 mt-0.5" />
        <span>
          Spatial cells correspond to NYC 20x20 grid regions parameterized by ConvLSTM spatiotemporal tensor inference.
        </span>
      </div>
    </div>
  );
}

export default RiskLegend;
