import { cn, riskMeta } from "../../../lib/utils";

export function Badge({ variant = "default", children }) {
  const styles = {
    default: "bg-slate-200 text-slate-800",
    success: "bg-success-soft text-green-800",
    warning: "bg-warning-soft text-amber-900",
    danger: "bg-danger-soft text-red-800",
    info: "bg-info-soft text-sky-900",
  };
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-1 rounded-full text-caption font-medium",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ level = "Moderate" }) {
  const meta = riskMeta[level] || riskMeta.Moderate;
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-1 rounded-full text-caption font-semibold",
        meta.color,
        meta.text,
      )}
    >
      {level} Risk
    </span>
  );
}
