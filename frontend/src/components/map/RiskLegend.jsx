import { RiskBadge } from "../ui/Badge/Badge";

function RiskLegend() {
  const levels = ["Very Low", "Low", "Moderate", "High", "Critical"];
  return (
    <div className="card-base p-4 space-y-2">
      <h3 className="text-h3">Risk Legend</h3>
      <div className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <RiskBadge key={l} level={l} />
        ))}
      </div>
    </div>
  );
}
export default RiskLegend;
