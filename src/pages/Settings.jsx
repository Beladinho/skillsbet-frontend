import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../api/settingsApi";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function Settings() {
  const { settings, applyRemoteSettings, tr } = useAppSettings();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  const { playClick } = useSounds();

  const [form, setForm] = useState({
    language: "fr",
    theme: "dark",
    sound_enabled: true,
    music_enabled: true,
    notifications_enabled: true,
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setError("");
        const data = await getSettings();

        const normalized = {
          language: data.language ?? "fr",
          theme: data.theme ?? "dark",
          sound_enabled: data.sound_enabled ?? true,
          music_enabled: data.music_enabled ?? true,
          notifications_enabled: data.notifications_enabled ?? true,
        };

        setForm(normalized);
        applyRemoteSettings(normalized);
      } catch (err) {
        console.error(err);
        const msg = err.message || "Failed to load settings";
        setError(msg);
        notifyError("Erreur paramètres", msg);
      }
    }

    loadSettings();
  }, [applyRemoteSettings, notifyError]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setStatus("");

      const payload = {
        language: form.language,
        theme: form.theme,
        sound_enabled: form.sound_enabled,
        music_enabled: form.music_enabled,
        notifications_enabled: form.notifications_enabled,
      };

      const updated = await updateSettings(payload);

      const normalized = {
        language: updated.language ?? form.language,
        theme: updated.theme ?? form.theme,
        sound_enabled: updated.sound_enabled ?? form.sound_enabled,
        music_enabled: updated.music_enabled ?? form.music_enabled,
        notifications_enabled:
          updated.notifications_enabled ?? form.notifications_enabled,
      };

      setForm(normalized);
      applyRemoteSettings(normalized);
      setStatus("saved");

      if (normalized.notifications_enabled) {
        notifySuccess(
          "Paramètres sauvegardés",
          `Langue : ${normalized.language} / Thème : ${normalized.theme}`
        );
      } else {
        notifyInfo("Notifications désactivées", "Les alertes visuelles sont coupées.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to save settings";
      setError(msg);
      notifyError("Erreur paramètres", msg);
    }
  }

  return (
    <div className="card" style={{ padding: 16, marginTop: 16 }}>
      <h2>{tr("userSettings")}</h2>

      {error ? (
        <p style={{ color: "red" }}>
          {tr("error")} : {error}
        </p>
      ) : null}

      {status === "saved" ? <p>✅ {tr("saveSettings")}</p> : null}

      <form
        onSubmit={(e) => {
          playClick();
          handleSubmit(e);
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <label>{tr("language")}</label>
          <br />
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>{tr("theme")}</label>
          <br />
          <select name="theme" value={form.theme} onChange={handleChange}>
            <option value="dark">{tr("dark")}</option>
            <option value="light">{tr("light")}</option>
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            <input
              type="checkbox"
              name="sound_enabled"
              checked={form.sound_enabled}
              onChange={handleChange}
            />{" "}
            {tr("enableSounds")}
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            <input
              type="checkbox"
              name="music_enabled"
              checked={form.music_enabled}
              onChange={handleChange}
            />{" "}
            {tr("enableMusic")}
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            <input
              type="checkbox"
              name="notifications_enabled"
              checked={form.notifications_enabled}
              onChange={handleChange}
            />{" "}
            {tr("enableNotifications")}
          </label>
        </div>

        <button type="submit">{tr("saveSettings")}</button>
      </form>

      <p style={{ marginTop: 12 }}>
        {tr("currentSettings")} : {settings.language} / {settings.theme}
      </p>
    </div>
  );
}