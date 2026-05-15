import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { t as translate } from "../i18n";
import { COLOR_THEMES } from "../components/SettingsSidebar";

const AppSettingsContext = createContext(null);

const defaultSettings = {
  language: "fr",
  theme: "dark",
  sound_enabled: true,
  music_enabled: true,
  notifications_enabled: true,
  music_style: "gaming-electro",
  music_volume: 0.4,
  color_theme: "cod-orange",
  sound_volume: 0.5,
};

function areSettingsEqual(a, b) {
  return (
    a.language === b.language &&
    a.theme === b.theme &&
    a.sound_enabled === b.sound_enabled &&
    a.music_enabled === b.music_enabled &&
    a.notifications_enabled === b.notifications_enabled &&
    a.music_style === b.music_style &&
    a.music_volume === b.music_volume &&
    a.color_theme === b.color_theme &&
    a.sound_volume === b.sound_volume
  );
}

function applyColorTheme(themeKey) {
  const theme = COLOR_THEMES[themeKey] ?? COLOR_THEMES["cod-orange"];
  const root = document.documentElement;
  root.style.setProperty("--clr-orange",        theme.accent);
  root.style.setProperty("--clr-orange-dim",     theme.accentDim);
  root.style.setProperty("--clr-orange-bright",  theme.accentBright);
  root.style.setProperty("--clr-orange-glow",    `rgba(${theme.glowRgb}, 0.35)`);
  root.style.setProperty("--clr-orange-subtle",  `rgba(${theme.glowRgb}, 0.07)`);
  root.style.setProperty("--clr-bg",             theme.bg);
  root.style.setProperty("--clr-surface-1",      theme.s1);
  root.style.setProperty("--clr-surface-2",      theme.s2);
  root.style.setProperty("--clr-surface-3",      theme.s3);
  root.style.setProperty("--clr-surface-4",      theme.s4);
  root.style.setProperty("--clr-border",         theme.border);
  root.style.setProperty("--clr-border-bright",  theme.borderBright);
  root.style.setProperty("--shadow-orange",      `0 0 20px rgba(${theme.glowRgb}, 0.3), 0 0 40px rgba(${theme.glowRgb}, 0.1)`);
}

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

    applyColorTheme(settings.color_theme || "cod-orange");
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
      sidebarOpen,
      setSidebarOpen,
    };
  }, [settings, applyRemoteSettings, tr, sidebarOpen]);

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