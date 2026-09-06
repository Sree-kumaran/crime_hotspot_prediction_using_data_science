import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../../../lib/utils";

const map = {
  success: {
    icon: CheckCircle2,
    box: "bg-emerald-950/60 border-emerald-700/60 text-emerald-200",
    iconColor: "text-emerald-400",
  },
  warning: {
    icon: AlertTriangle,
    box: "bg-amber-950/60 border-amber-700/60 text-amber-200",
    iconColor: "text-amber-400",
  },
  error: {
    icon: AlertCircle,
    box: "bg-red-950/60 border-red-700/60 text-red-200",
    iconColor: "text-red-400",
  },
  info: {
    icon: Info,
    box: "bg-[#161b33] border-palette-grape text-palette-almond",
    iconColor: "text-palette-lilac",
  },
};

function Alert({ type = "info", title, message, className }) {
  const cfg = map[type] || map.info;
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex gap-3 shadow-md transition-all",
        cfg.box,
        className,
      )}
      role="alert"
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", cfg.iconColor)} />
      <div className="space-y-0.5 text-xs md:text-sm">
        {title && <p className="font-semibold tracking-tight">{title}</p>}
        {message && <p className="opacity-90">{message}</p>}
      </div>
    </div>
  );
}

export default Alert;
