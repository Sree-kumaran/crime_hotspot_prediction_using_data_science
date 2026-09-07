import { settingsApi } from "../api/settingsApi";

export async function getAppSettings() {
  return settingsApi.getSettings();
}

export async function updateAppSettings(payload) {
  return settingsApi.updateSettings(payload);
}

export async function resetAppSettings() {
  return settingsApi.resetSettings();
}
