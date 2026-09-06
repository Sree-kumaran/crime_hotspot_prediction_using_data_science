import { Info, ShieldAlert } from "lucide-react";
import { RiskBadge } from "../ui/Badge/Badge";
import { Card, CardBody, CardHeader } from "../ui/Card/Card";

export default function PredictionLegend() {
  const levels = [
    {
      level: "High",
      range: "> 75%",
      color: "bg-red-500",
      desc: "Critical risk density. High statistical probability of felony/violent incidents based on spatiotemporal sequence.",
    },
    {
      level: "Moderate",
      range: "45% – 75%",
      color: "bg-amber-500",
      desc: "Elevated risk zone. Recommended targeted patrol coverage.",
    },
    {
      level: "Low",
      range: "< 45%",
      color: "bg-emerald-500",
      desc: "Standard municipal baseline crime activity.",
    },
  ];

  return (
    <Card className="border-[#262c4d]">
      <CardHeader className="bg-palette-ink/40 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-palette-almond" />
          <h3 className="text-sm font-semibold text-palette-almond">
            ConvLSTM Risk Classification Legend
          </h3>
        </div>
        <span className="text-[11px] text-palette-lilac">
          20x20 NYC Grid Matrix
        </span>
      </CardHeader>
      <CardBody className="p-4 grid sm:grid-cols-3 gap-3">
        {levels.map((item) => (
          <div
            key={item.level}
            className="p-3.5 rounded-xl bg-palette-ink border border-[#262c4d] space-y-2"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#262c4d]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs font-bold text-palette-almond">
                  {item.level} Risk
                </span>
              </div>
              <span className="text-xs font-bold text-palette-almond bg-[#1e2444] px-2 py-0.5 rounded border border-[#2b3254]">
                {item.range}
              </span>
            </div>
            <p className="text-xs text-palette-lilac leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
