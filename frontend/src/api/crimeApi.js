import { apiClient } from "./apiClient";

export const crimeApi = {
  getCrimes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/crimes${query ? `?${query}` : ""}`);
  },
  getCrimeById: (id) => apiClient.get(`/api/crimes/${id}`),
  createCrime: (payload) => apiClient.post("/api/crimes", payload),
  updateCrime: (id, payload) => apiClient.put(`/api/crimes/${id}`, payload),
  deleteCrime: (id) => apiClient.delete(`/api/crimes/${id}`),
};
