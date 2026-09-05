import { mockPredictionResult } from "../data/mockPredictions";

const wait = (ms = 900) => new Promise((r) => setTimeout(r, ms));

export async function predictCrime(payload) {
  await wait();
  return {
    ...mockPredictionResult,
    input: payload,
    generatedAt: new Date().toISOString(),
  };
}
