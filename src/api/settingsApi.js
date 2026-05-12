import { apiRequest } from "./http";

export async function getSettings() {
  return apiRequest("/settings");
}

export async function updateSettings({
  language,
  theme,
  sound_enabled,
  music_enabled,
  notifications_enabled,
}) {
  return apiRequest("/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      language,
      theme,
      sound_enabled,
      music_enabled,
      notifications_enabled,
    },
  });
}