import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { getMyNotifications } from "../api/skillsbetApi";
import { useSounds } from "../context/SoundContext";
import { useSocial } from "../context/SocialContext";
import PlayerAvatar from "./PlayerAvatar";

export default function SessionBar() {
  const { playerId, balance, role, logoutPlayer, avatarUrl, playerLevel } = useContext(PlayerContext);
  const { settings, setSidebarOpen } = useAppSettings();
  const { unlockAudio } = useSounds();
  const { pendingCount: friendRequests } = useSocial();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <nav className="session-bar">
      <div className="session-bar__brand">
        <span className="session-bar__logo">
          SKILLS<span>BET</span>
        </span>
      </div>

      {/* Hamburger - visible seulement sur mobile via CSS */}
      <button
        className="session-bar__hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menu"
        style={{ display: "none" }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className="session-bar__player">
        <div style={{ position: "relative", flexShrink: 0 }}>
          <PlayerAvatar
            playerId={playerId}
            avatarUrl={avatarUrl}
            size={36}
            style={{ border: "2px solid rgba(255,107,0,0.4)" }}
          />
          <span style={{
            position: "absolute",
            bottom: -6,
            right: -6,
            background: "linear-gradient(135deg, #ff6b00, #ff9500)",
            color: "#fff",
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "0.6rem",
            padding: "1px 5px",
            borderRadius: 4,
            letterSpacing: "0.04em",
            lineHeight: 1.4,
            boxShadow: "0 0 6px rgba(255,107,0,0.5)",
            whiteSpace: "nowrap",
          }}>
            LVL {playerLevel || 1}
          </span>
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

        <Link to="/friends" className="session-bar__friends">
          👥 AMIS
          {friendRequests > 0 && (
            <span className="session-bar__friends-badge">{friendRequests}</span>
          )}
        </Link>

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

      {menuOpen && (
        <div className="session-bar__mobile-menu">
          <div className={`session-bar__notif${unreadCount > 0 ? " session-bar__notif--active" : ""}`}>
            {unreadCount > 0 ? `${unreadCount} NOTIF` : "0 NOTIF"}
          </div>
          <Link to="/friends" className="session-bar__friends" onClick={() => setMenuOpen(false)}>
            👥 AMIS
            {friendRequests > 0 && <span className="session-bar__friends-badge">{friendRequests}</span>}
          </Link>
          <Link to="/creator" className="session-bar__creator" onClick={() => setMenuOpen(false)}>
            🎮 CRÉATEUR
          </Link>
          {role === "admin" && (
            <Link to="/admin" className="session-bar__admin" onClick={() => setMenuOpen(false)}>
              ⚙ ADMIN
            </Link>
          )}
          <button className="btn-ghost btn-sm" onClick={() => { unlockAudio(); setSidebarOpen(true); setMenuOpen(false); }} style={{ fontSize: 16 }}>⚙ Paramètres</button>
          <button className="btn-ghost btn-sm" onClick={logoutPlayer}>DÉCONNEXION</button>
        </div>
      )}
    </nav>
  );
}
