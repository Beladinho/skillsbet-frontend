import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { getMyNotifications } from "../api/skillsbetApi";

export default function SessionBar() {
  const { playerId, role, logoutPlayer } = useContext(PlayerContext);
  const { settings } = useAppSettings();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!playerId) return;

    loadUnread();

    const interval = window.setInterval(() => {
      loadUnread();
    }, 8000);

    return () => window.clearInterval(interval);
  }, [playerId]);

  async function loadUnread() {
    try {
      const data = await getMyNotifications();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        border: "1px solid #334155",
        borderRadius: "14px",
        marginBottom: "20px",
        background: "rgba(15, 23, 42, 0.75)",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <strong>Connecté :</strong> {playerId} ({role})
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          Langue : {settings.language} | Thème : {settings.theme} | Notifications : {settings.notifications_enabled ? "Oui" : "Non"}
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            background: unreadCount > 0 ? "#16a34a" : "#475569",
            color: "white",
            fontWeight: 700,
            fontSize: "12px",
          }}
        >
          Notifications : {unreadCount}
        </div>

        {role === "admin" && (
          <Link
            to="/admin"
            style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}
          >
            Admin
          </Link>
        )}

        <button onClick={logoutPlayer}>Déconnexion</button>
      </div>
    </div>
  );
}