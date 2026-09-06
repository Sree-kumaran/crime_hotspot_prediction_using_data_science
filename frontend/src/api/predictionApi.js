import { apiClient } from "./apiClient";

export const predictionApi = {
  createPrediction: (payload) => apiClient.post("/api/predictions", payload),
  predictHotspots: (payload) => apiClient.post("/api/predictions/hotspots", payload),
  predict: (payload) => apiClient.post("/api/predict", payload),
  getPredictions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/predictions${query ? `?${query}` : ""}`);
  },
  getLatest: () => apiClient.get("/api/predictions/latest"),
  getById: (id) => apiClient.get(`/api/predictions/${id}`),
};
