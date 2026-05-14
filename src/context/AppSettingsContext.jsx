import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { t as translate } from "../i18n";

const AppSettingsContext = createContext(null);

const defaultSettings = {
  language: "fr",
  theme: "dark",
  sound_enabled: true,
  music_enabled: true,
  notifications_enabled: true,
  music_style: "gaming-electro",
  music_volume: 0.4,
};

function areSettingsEqual(a, b) {
  return (
    a.language === b.language &&
    a.theme === b.theme &&
    a.sound_enabled === b.sound_enabled &&
    a.music_enabled === b.music_enabled &&
    a.notifications_enabled === b.notifications_enabled &&
    a.music_style === b.music_style &&
    a.music_volume === b.music_volume
  );
}

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => {
          const next = { ...prev, ...parsed };
          return areSettingsEqual(prev, next) ? prev : next;
        });
      } catch {
        // ignore corrupted local storage
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("app_settings", JSON.stringify(settings));

    const body = document.body;
    body.dataset.theme = settings.theme || "dark";

    if (settings.theme === "light") {
      body.classList.add("theme-light");
      body.classList.remove("theme-dark");
    } else {
      body.classList.add("theme-dark");
      body.classList.remove("theme-light");
    }
  }, [settings]);

  const applyRemoteSettings = useCallback((remote) => {
    if (!remote) return;

    setSettings((prev) => {
      const next = {
        ...prev,
        ...remote,
      };

      return areSettingsEqual(prev, next) ? prev : next;
    });
  }, []);

  const tr = useCallback(
    (key) => translate(settings.language || "fr", key),
    [settings.language]
  );

  const value = useMemo(() => {
    return {
      settings,
      setSettings,
      applyRemoteSettings,
      tr,
    };
  }, [settings, applyRemoteSettings, tr]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);

  if (!ctx) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }

  return ctx;
}