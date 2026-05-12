import { useNotifications } from "../context/NotificationContext";

function getCardStyle(type) {
  const base = {
    borderRadius: "12px",
    padding: "12px 14px",
    marginBottom: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(6px)",
  };

  if (type === "success") {
    return {
      ...base,
      background: "rgba(16, 185, 129, 0.16)",
    };
  }

  if (type === "error") {
    return {
      ...base,
      background: "rgba(239, 68, 68, 0.16)",
    };
  }

  return {
    ...base,
    background: "rgba(59, 130, 246, 0.16)",
  };
}

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications.length) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        width: "340px",
        zIndex: 9999,
      }}
    >
      {notifications.map((item) => (
        <div key={item.id} style={getCardStyle(item.type)}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: item.message ? "4px" : "0" }}>
                {item.title}
              </div>

              {item.message ? (
                <div style={{ fontSize: "14px", opacity: 0.92 }}>{item.message}</div>
              ) : null}
            </div>

            <button
              onClick={() => removeNotification(item.id)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}