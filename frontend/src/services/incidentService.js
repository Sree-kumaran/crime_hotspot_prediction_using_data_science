import { mockIncidents } from "../data/mockIncidents";

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function getIncidents() {
  await wait();
  return [...mockIncidents];
}

export async function getIncidentById(id) {
  await wait();
  return mockIncidents.find((i) => i.id === id) || null;
}
