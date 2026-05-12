export function saveLocalSettings(settings) {
  localStorage.setItem("app_settings", JSON.stringify(settings));
}

export function loadLocalSettings() {
  const raw = localStorage.getItem("app_settings");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}