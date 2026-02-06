import { useEffect, useState } from "react";
import { getNotifications, readNotification } from "../api";
import "./notifications.css";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    getNotifications().then(setNotifs);
  }, []);

  const markRead = async (id) => {
    await readNotification(id);
    setNotifs(notifs.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  return (
    <div className="notif-box">
      <h3>🔔 Notifications</h3>
      {notifs.map(n => (
        <div
          key={n.id}
          className={`notif ${n.is_read ? "read" : ""}`}
          onClick={() => markRead(n.id)}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
