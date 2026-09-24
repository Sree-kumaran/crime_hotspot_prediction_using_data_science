import { crimeApi } from "../api/crimeApi";

export async function getIncidents(params = {}) {
  const res = await crimeApi.getCrimes(params);
  return res;
}

export async function getLast7DaysCrimes(params = {}) {
  if (typeof params === "string") {
    return crimeApi.getLast7DaysCrimes({ target_date: params, days: 7 });
  }
  return crimeApi.getLast7DaysCrimes(params);
}

export async function getCrimesWindow(params = {}) {
  return crimeApi.getCrimesWindow(params);
}

export async function getIncidentById(id) {
  return crimeApi.getCrimeById(id);
}

export async function createCrimeRecord(payload) {
  return crimeApi.createCrime(payload);
}

