import clsx from "clsx";

export const cn = (...inputs) => clsx(inputs);

export const riskMeta = {
  "Very Low": {
    color: "bg-emerald-950/60 border border-emerald-700/50",
    text: "text-emerald-300",
  },
  Low: {
    color: "bg-emerald-950/60 border border-emerald-600/50",
    text: "text-emerald-300",
  },
  Moderate: {
    color: "bg-amber-950/60 border border-amber-600/50",
    text: "text-amber-300",
  },
  High: {
    color: "bg-red-950/60 border border-red-600/50",
    text: "text-red-300",
  },
  Critical: {
    color: "bg-red-900/80 border border-red-500",
    text: "text-red-200",
  },
};

export const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "map", label: "Crime Map" },
  { id: "incidents", label: "Incidents" },
  { id: "prediction", label: "Prediction" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];
