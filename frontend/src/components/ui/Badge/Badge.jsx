import { cn, riskMeta } from "../../../lib/utils";

export function Badge({ variant = "default", className, children }) {
  const styles = {
    default: "bg-[#1e2444] text-palette-lilac border border-[#2b3254]",
    grape: "bg-palette-grape text-palette-almond border border-[#575a8a]",
    almond: "bg-palette-almond text-palette-ink font-semibold",
    success: "bg-emerald-950/70 text-emerald-300 border border-emerald-700/50",
    warning: "bg-amber-950/70 text-amber-300 border border-amber-700/50",
    danger: "bg-red-950/70 text-red-300 border border-red-700/50",
    info: "bg-sky-950/70 text-sky-300 border border-sky-700/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase",
        styles[variant] || styles.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ level = "Moderate", className }) {
  const normalizedLevel =
    level === "Medium" ? "Moderate" : level || "Moderate";
  const meta = riskMeta[normalizedLevel] || riskMeta.Moderate;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase shadow-sm",
        meta.color,
        meta.text,
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          normalizedLevel === "High" || normalizedLevel === "Critical"
            ? "bg-red-400 animate-pulse"
            : normalizedLevel === "Moderate"
            ? "bg-amber-400"
            : "bg-emerald-400",
        )}
      />
      {normalizedLevel} Risk
    </span>
  );
}
