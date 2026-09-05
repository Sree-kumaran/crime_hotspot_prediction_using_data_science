import { apiClient } from "./apiClient";

export const analyticsApi = {
  getOverview: () => apiClient.get("/api/analytics/overview"),
  getCrimeTypes: () => apiClient.get("/api/analytics/crime-types"),
};
