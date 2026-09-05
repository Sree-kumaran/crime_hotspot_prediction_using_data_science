import {
  crimeDistribution,
  riskOverview,
  trendData,
} from "../data/mockAnalytics";

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function getAnalytics() {
  await wait();
  return { trendData, crimeDistribution, riskOverview };
}
