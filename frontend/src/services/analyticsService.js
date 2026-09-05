import { analyticsApi } from "../api/analyticsApi";

export async function getAnalytics() {
  const [overview, crimeTypes] = await Promise.all([
    analyticsApi.getOverview(),
    analyticsApi.getCrimeTypes(),
  ]);

  // Keep structure compatible with existing DashboardPage usage
  return {
    trendData: [], // placeholder until /analytics/crime-trends endpoint is wired
    crimeDistribution: crimeTypes || [],
    riskOverview: [
      { label: "Low", value: 0 },
      { label: "Moderate", value: 0 },
      { label: "High", value: overview?.high_risk_count || 0 },
      { label: "Critical", value: 0 },
    ],
    overview,
  };
}

export async function getAnalyticsOverview() {
  return analyticsApi.getOverview();
}

export async function getCrimeTypes() {
  return analyticsApi.getCrimeTypes();
}
