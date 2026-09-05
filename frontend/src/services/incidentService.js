import { crimeApi } from "../api/crimeApi";

export async function getIncidents(params = {}) {
  const res = await crimeApi.getCrimes(params);
  return res;
}

export async function getIncidentById(id) {
  return crimeApi.getCrimeById(id);
}
