import { analyticsApi } from "../api/analyticsApi";

export async function getAnalytics() {
  const [overview, crimeTypes, trends, riskOverview] = await Promise.all([
    analyticsApi.getOverview().catch(() => null),
    analyticsApi.getCrimeTypes().catch(() => []),
    analyticsApi.getTrends().catch(() => []),
    analyticsApi.getRiskOverview().catch(() => []),
  ]);

  const formattedTrends = Array.isArray(trends)
    ? trends.map((t) => ({ label: t.date?.slice(5) || t.date, value: t.count }))
    : [];

  return {
    trendData: formattedTrends,
    crimeDistribution: Array.isArray(crimeTypes) ? crimeTypes : [],
    riskOverview: Array.isArray(riskOverview) && riskOverview.length > 0
      ? riskOverview
      : [
          { label: "Low", value: 0 },
          { label: "Moderate", value: 0 },
          { label: "High", value: overview?.high_risk_count || 0 },
          { label: "Critical", value: 0 },
        ],
    overview: overview || {},
  };
}

export async function getAnalyticsOverview() {
  return analyticsApi.getOverview();
}

export async function getCrimeTypes() {
  return analyticsApi.getCrimeTypes();
}

export async function getCrimeTrends() {
  return analyticsApi.getTrends();
}

export async function getRiskOverview() {
  return analyticsApi.getRiskOverview();
}

