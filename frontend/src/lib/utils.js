import clsx from "clsx";

export const cn = (...inputs) => clsx(inputs);

export const riskMeta = {
  "Very Low": { color: "bg-risk-verylow", text: "text-white" },
  Low: { color: "bg-risk-low", text: "text-slate-900" },
  Moderate: { color: "bg-risk-moderate", text: "text-slate-900" },
  High: { color: "bg-risk-high", text: "text-white" },
  Critical: { color: "bg-risk-critical", text: "text-white" },
};

export const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "crime-map", label: "Crime Map" },
  { id: "predictions", label: "Predictions" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Crime Reports" },
  { id: "alerts", label: "Alerts" },
  { id: "settings", label: "Settings" },
];
