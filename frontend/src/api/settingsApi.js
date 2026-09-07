import { apiClient } from "./apiClient";

export const settingsApi = {
  getSettings: () => apiClient.get("/api/settings"),
  updateSettings: (payload) => apiClient.put("/api/settings", payload),
  resetSettings: () => apiClient.post("/api/settings/reset"),
};
