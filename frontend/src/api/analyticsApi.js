import { apiClient } from "./apiClient";

export const analyticsApi = {
  getOverview: () => apiClient.get("/api/analytics/overview"),
  getCrimeTypes: () => apiClient.get("/api/analytics/crime-types"),
  getTrends: () => apiClient.get("/api/analytics/crime-trends"),
  getRiskOverview: () => apiClient.get("/api/analytics/risk-overview"),
};

