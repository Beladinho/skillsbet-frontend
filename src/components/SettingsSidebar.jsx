import { useAppSettings } from "../context/AppSettingsContext";
import { useMusic } from "../context/MusicContext";
import { openChat } from "../hooks/useCrisp";

export const COLOR_THEMES = {
  "cod-orange": {
    name: "COD Orange",
    accent: "#FF6B00",
    accentDim: "#CC5500",
    accentBright: "#FF8C40",
    glowRgb: "255, 107, 0",
    bg: "#0A0A0A",
    s1: "#111111", s2: "#1A1A1A", s3: "#242424", s4: "#2E2E2E",
    border: "#282828", borderBright: "#383838",
  },
  "casino-rouge": {
    name: "Casino Rouge",
    accent: "#C0392B",
    accentDim: "#96281B",
    accentBright: "#E74C3C",
    glowRgb: "192, 57, 43",
    bg: "#1A0505",
    s1: "#220808", s2: "#2C0D0D", s3: "#361212", s4: "#401717",
    border: "#4A1515", borderBright: "#5E1E1E",
  },
  "neon-vert": {
    name: "Néon Vert",
    accent: "#00FF41",
    accentDim: "#00CC33",
    accentBright: "#33FF66",
    glowRgb: "0, 255, 65",
    bg: "#0D0D0D",
    s1: "#111111", s2: "#161616", s3: "#1C1C1C", s4: "#222222",
    border: "#1A2E1A", borderBright: "#254025",
  },
  "ocean-bleu": {
    name: "Océan Bleu",
    accent: "#0066CC",
    accentDim: "#0052A3",
    accentBright: "#1A7FD4",
    glowRgb: "0, 102, 204",
    bg: "#001A33",
    s1: "#00213D", s2: "#002847", s3: "#003052", s4: "#00395E",
    border: "#00447A", borderBright: "#005599",
  },
  "violet-royal": {
    name: "Violet Royal",
    accent: "#7B2FBE",
    accentDim: "#5E2396",
    accentBright: "#9B45DE",
    glowRgb: "123, 47, 190",
    bg: "#0A0A0A",
    s1: "#12071A", s2: "#1A0C24", s3: "#22122E", s4: "#2A1838",
    border: "#2E1540", borderBright: "#3D1F55",
  },
  "dore-vip": {
    name: "Doré VIP",
    accent: "#FFD700",
    accentDim: "#CCA800",
    accentBright: "#FFE033",
    glowRgb: "255, 215, 0",
    bg: "#1A1400",
    s1: "#1F1A00", s2: "#252000", s3: "#2B2600", s4: "#323200",
    border: "#3D3500", borderBright: "#504600",
  },
};

function VolumeSlider({ label, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "var(--clr-text-muted)", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--clr-orange)", fontFamily: "var(--font-heading)" }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "var(--clr-orange)", opacity: disabled ? 0.4 : 1 }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--clr-border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--clr-text-dim)" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: value ? "var(--clr-orange)" : "var(--clr-surface-4)",
          cursor: "pointer",
          position: "relative",
          transition: "background var(--transition-fast)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left var(--transition-fast)",
          }}
        />
      </button>
    </div>
  );
}

export default function SettingsSidebar() {
  const { settings, setSettings, sidebarOpen, setSidebarOpen, tr } = useAppSettings();
  const { currentVolume, setMusicVolume } = useMusic();

  const currentTheme = settings.color_theme || "cod-orange";

  function setTheme(key) {
    setSettings(prev => ({ ...prev, color_theme: key }));
  }

  function setSoundVolume(v) {
    setSettings(prev => ({ ...prev, sound_volume: v }));
  }

  function toggleSetting(key) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 320,
          height: "100vh",
          background: "var(--clr-surface-1)",
          borderLeft: "2px solid var(--clr-orange)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--clr-border)",
            background: "var(--clr-surface-2)",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 18,
                color: "var(--clr-orange)",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Paramètres
            </div>
            <div style={{ fontSize: 10, color: "var(--clr-text-muted)", letterSpacing: 1, marginTop: 2 }}>
              PERSONNALISATION
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost btn-sm"
            style={{ fontSize: 18, padding: "4px 10px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px", flex: 1 }}>

          {/* Color Theme Section */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                color: "var(--clr-text-muted)",
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              {tr("themeColors")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(COLOR_THEMES).map(([key, theme]) => {
                const active = currentTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    style={{
                      border: `2px solid ${active ? theme.accent : "var(--clr-border)"}`,
                      borderRadius: "var(--radius-md)",
                      background: active ? `${theme.bg}` : "var(--clr-surface-3)",
                      cursor: "pointer",
                      padding: "10px 8px",
                      textAlign: "center",
                      transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                      boxShadow: active ? `0 0 10px ${theme.accent}55` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: theme.accent,
                        margin: "0 auto 6px",
                        boxShadow: active ? `0 0 8px ${theme.accent}` : "none",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-heading)",
                        color: active ? theme.accent : "var(--clr-text-muted)",
                        letterSpacing: 1,
                        lineHeight: 1.2,
                      }}
                    >
                      {theme.name.toUpperCase()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--clr-border)", marginBottom: 20 }} />

          {/* Music Section */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                color: "var(--clr-text-muted)",
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Audio
            </div>

            <Toggle
              label={tr("musicLabel")}
              value={settings.music_enabled !== false}
              onChange={v => toggleSetting("music_enabled")}
            />

            <div style={{ paddingTop: 12 }}>
              <VolumeSlider
                label={tr("volumeMusic")}
                value={currentVolume}
                onChange={setMusicVolume}
                disabled={!settings.music_enabled}
              />
            </div>

            <Toggle
              label={tr("soundsLabel")}
              value={settings.sound_enabled !== false}
              onChange={v => toggleSetting("sound_enabled")}
            />

            <div style={{ paddingTop: 12 }}>
              <VolumeSlider
                label={tr("volumeSounds")}
                value={settings.sound_volume ?? 0.5}
                onChange={setSoundVolume}
                disabled={!settings.sound_enabled}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--clr-border)", marginBottom: 20 }} />

          {/* Notifications Section */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                color: "var(--clr-text-muted)",
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Notifications
            </div>
            <Toggle
              label={tr("notificationsLabel")}
              value={settings.notifications_enabled !== false}
              onChange={v => toggleSetting("notifications_enabled")}
            />
            <div
              style={{
                paddingLeft: 12,
                borderLeft: "2px solid var(--clr-border)",
                marginLeft: 4,
                opacity: settings.notifications_enabled !== false ? 1 : 0.35,
                pointerEvents: settings.notifications_enabled !== false ? "auto" : "none",
                transition: "opacity var(--transition-fast)",
              }}
            >
              <Toggle
                label="🟢 Amis en ligne"
                value={settings.notif_friends_online !== false}
                onChange={() => toggleSetting("notif_friends_online")}
              />
              <Toggle
                label="⚔️ Défis acceptés"
                value={settings.notif_challenges !== false}
                onChange={() => toggleSetting("notif_challenges")}
              />
              <Toggle
                label="📉 Dépassé au classement"
                value={settings.notif_leaderboard !== false}
                onChange={() => toggleSetting("notif_leaderboard")}
              />
              <Toggle
                label="📊 Résumé quotidien (20h)"
                value={settings.notif_daily_summary !== false}
                onChange={() => toggleSetting("notif_daily_summary")}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--clr-border)",
            background: "var(--clr-surface-2)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={openChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              background: "var(--clr-surface-3)",
              border: "1px solid var(--clr-border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              cursor: "pointer",
              color: "var(--clr-text-dim)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              marginBottom: 10,
              transition: "border-color var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--clr-orange)";
              e.currentTarget.style.color = "var(--clr-orange)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--clr-border)";
              e.currentTarget.style.color = "var(--clr-text-dim)";
            }}
          >
            <span style={{ fontSize: 16 }}>💬</span>
            <span>Support en direct</span>
          </button>
          <div style={{ fontSize: 10, color: "var(--clr-text-muted)", textAlign: "center", letterSpacing: 1 }}>
            SKILLSBET · PERSONNALISATION
          </div>
        </div>
      </aside>
    </>
  );
}
