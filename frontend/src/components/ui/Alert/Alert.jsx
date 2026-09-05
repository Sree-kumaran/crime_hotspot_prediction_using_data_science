import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const map = {
  success: {
    icon: CheckCircle2,
    box: "bg-success-soft border-success/40",
    text: "text-green-900",
  },
  warning: {
    icon: AlertTriangle,
    box: "bg-warning-soft border-warning/40",
    text: "text-amber-900",
  },
  error: {
    icon: AlertCircle,
    box: "bg-danger-soft border-danger/40",
    text: "text-red-900",
  },
  info: {
    icon: Info,
    box: "bg-info-soft border-info/40",
    text: "text-sky-900",
  },
};

function Alert({ type = "info", title, message }) {
  const cfg = map[type];
  const Icon = cfg.icon;
  return (
    <div
      className={`rounded-lg border p-3 flex gap-3 ${cfg.box} ${cfg.text}`}
      role="alert"
    >
      <Icon size={18} className="mt-0.5" />
      <div>
        {title && <p className="text-small font-semibold">{title}</p>}
        {message && <p className="text-small">{message}</p>}
      </div>
    </div>
  );
}
export default Alert;
