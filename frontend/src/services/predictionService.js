import { apiClient } from "../api/apiClient";

export async function generateHotspotPrediction(predictionDate) {
  return apiClient.post("/api/predictions/hotspots", {
    prediction_date: predictionDate,
  });
}
