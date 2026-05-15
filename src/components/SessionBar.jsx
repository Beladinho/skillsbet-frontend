import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { getMyNotifications } from "../api/skillsbetApi";
import { useSounds } from "../context/SoundContext";

const AVATAR_COLORS = [
  "#FF6B00", "#00b4d8", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899",
];

function avatarColor(id) {
  let hash = 0;
  for (const c of String(id)) hash = ((hash * 31) + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function avatarInitials(id) {
  const parts = String(id || "?").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return String(id || "?").slice(0, 2).toUpperCase();
}

export default function SessionBar() {
  const { playerId, balance, role, logoutPlayer } = useContext(PlayerContext);
  const { settings, setSidebarOpen } = useAppSettings();
  const { unlockAudio } = useSounds();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!playerId) return;
    loadUnread();
    const interval = window.setInterval(loadUnread, 8000);
    return () => window.clearInterval(interval);
  }, [playerId]);

  async function loadUnread() {
    try {
      const data = await getMyNotifications();
      setUnreadCount(data.unread_count || 0);
    } catch {}
  }

  const color = avatarColor(playerId);
  const initials = avatarInitials(playerId);

  return (
    <nav className="session-bar">
      <div className="session-bar__brand">
        <span className="session-bar__logo">
          SKILLS<span>BET</span>
        </span>
      </div>

      <div className="session-bar__player">
        <div
          className="session-bar__avatar"
          style={{ background: color }}
          title={playerId}
        >
          {initials}
        </div>
        <div className="session-bar__player-info">
          <span className="session-bar__id">{playerId}</span>
          <span className="session-bar__balance">
            {Number(balance || 0).toLocaleString("fr-FR")} <span style={{ color: "var(--clr-orange)" }}>🪙</span>
          </span>
        </div>
        <span className="session-bar__role">{role}</span>
        <span className="session-bar__settings">
          {settings.language.toUpperCase()} · {settings.theme.toUpperCase()}
        </span>
      </div>

      <div className="session-bar__actions">
        <div className={`session-bar__notif${unreadCount > 0 ? " session-bar__notif--active" : ""}`}>
          {unreadCount > 0 ? `${unreadCount} NOTIF` : "0 NOTIF"}
        </div>

        <Link to="/creator" className="session-bar__creator">
          🎮 CRÉATEUR
        </Link>

        {role === "admin" && (
          <Link to="/admin" className="session-bar__admin">
            ⚙ ADMIN
          </Link>
        )}

        <button
          className="btn-ghost btn-sm"
          onClick={() => { unlockAudio(); setSidebarOpen(true); }}
          title="Paramètres"
          style={{ fontSize: 16 }}
        >
          ⚙
        </button>

        <button className="btn-ghost btn-sm" onClick={logoutPlayer}>
          DÉCONNEXION
        </button>
      </div>
    </nav>
  );
}
