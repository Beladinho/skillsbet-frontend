import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import {
  connectNotifications,
  disconnectNotifications,
} from "../services/notificationsSocket";

export default function NotificationsPanel() {
  const { playerId } = useContext(PlayerContext);
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [rows, setRows] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    try {
      const data = await getMyNotifications();
      setRows(data.rows || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error(error);
      notifyError(
        "Notifications",
        error.message || "Impossible de charger les notifications."
      );
    }
  }

  useEffect(() => {
    if (!playerId) return;

    loadNotifications();

    connectNotifications(playerId, (data) => {
      if (data.type === "notification") {
        notifySuccess(data.title, data.message);
        loadNotifications();
      }
    });

    return () => {
      disconnectNotifications();
    };
  }, [playerId]);

  async function handleRead(notificationId) {
    try {
      await markNotificationRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error(error);
      notifyError(
        "Notifications",
        error.message || "Impossible de marquer comme lu."
      );
    }
  }

  async function handleReadAll() {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (error) {
      console.error(error);
      notifyError(
        "Notifications",
        error.message || "Impossible de tout marquer comme lu."
      );
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ""}
        </h3>

        <button
          onClick={() => {
            playClick();
            handleReadAll();
          }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        {rows.length === 0 ? (
          <p>No notifications</p>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="simple-list-item"
              style={{
                opacity: row.is_read ? 0.75 : 1,
                borderLeft: row.is_read
                  ? "4px solid #64748b"
                  : "4px solid #22c55e",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 6px 0" }}>
                    <strong>{row.title}</strong>
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>{row.message}</p>
                  <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>
                    {row.created_at}
                  </p>
                </div>

                {!row.is_read && (
                  <button
                    onClick={() => {
                      playClick();
                      handleRead(row.id);
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}