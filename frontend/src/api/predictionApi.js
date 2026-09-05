import { apiClient } from "./apiClient";

export const predictionApi = {
  predict: (payload) => apiClient.post("/api/predictions/predict", payload),
};
