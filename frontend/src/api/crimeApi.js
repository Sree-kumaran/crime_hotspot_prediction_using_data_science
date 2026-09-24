import { apiClient } from "./apiClient";

export const crimeApi = {
  getCrimes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/crimes${query ? `?${query}` : ""}`);
  },
  getLast7DaysCrimes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/crimes/last-7-days${query ? `?${query}` : ""}`);
  },
  getCrimesWindow: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/crimes/window${query ? `?${query}` : ""}`);
  },
  getCrimeById: (id) => apiClient.get(`/api/crimes/${id}`),
  createCrime: (payload) => apiClient.post("/api/crimes", payload),
  updateCrime: (id, payload) => apiClient.put(`/api/crimes/${id}`, payload),
  deleteCrime: (id) => apiClient.delete(`/api/crimes/${id}`),
};

