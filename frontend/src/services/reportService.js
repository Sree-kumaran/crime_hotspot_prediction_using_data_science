import { analyticsApi } from "../api/analyticsApi";
import { predictionApi } from "../api/predictionApi";

export async function generateReport(filters = {}) {
  const [overview, latestPred] = await Promise.all([
    analyticsApi.getOverview().catch(() => ({})),
    predictionApi.getLatest().catch(() => ({ data: null })),
  ]);

  const totalCrimes = overview?.total_crimes || 0;
  const highRisk = overview?.high_risk_count || 0;
  const hotspotsCount = latestPred?.data?.hotspots?.length || 0;
  const predDate = latestPred?.data?.prediction_date || "N/A";

  return {
    id: `RPT-${Date.now().toString().slice(-6)}`,
    status: "Completed",
    scope: filters.scope || "Citywide",
    generated_at: new Date().toLocaleString(),
    total_crimes: totalCrimes,
    high_risk_incidents: highRisk,
    active_hotspots: hotspotsCount,
    latest_prediction_date: predDate,
    summary: `Comprehensive Crime Intelligence Assessment: Analysis of ${totalCrimes} incidents across NYC boroughs identified ${highRisk} high-severity cases. Neural ConvLSTM hotspot modeling detected ${hotspotsCount} critical spatial density zones for target date ${predDate}.`,
    filters,
  };
}

