import { predictionApi } from "../api/predictionApi";

export async function generateHotspotPrediction(payloadOrDate) {
  if (typeof payloadOrDate === "string") {
    return predictionApi.createPrediction({
      prediction_date: payloadOrDate,
      date: payloadOrDate,
    });
  }
  return predictionApi.createPrediction(payloadOrDate);
}

export async function predictIncident(incidentData) {
  return predictionApi.createPrediction(incidentData);
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
