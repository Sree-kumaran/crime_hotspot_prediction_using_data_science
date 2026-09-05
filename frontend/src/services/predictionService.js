import { predictionApi } from "../api/predictionApi";

export async function predictCrime(payload) {
  return predictionApi.predict(payload);
}
