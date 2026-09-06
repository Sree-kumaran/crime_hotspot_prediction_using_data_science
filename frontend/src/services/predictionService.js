import { predictionApi } from "../api/predictionApi";

export async function generateHotspotPrediction(predictionDate) {
  return predictionApi.predictHotspots({
    prediction_date: predictionDate,
  });
}

export async function getPredictionHistory(params = {}) {
  return predictionApi.getPredictions(params);
}

export async function getLatestPrediction() {
  return predictionApi.getLatest();
}

export async function getPredictionById(id) {
  return predictionApi.getById(id);
}

