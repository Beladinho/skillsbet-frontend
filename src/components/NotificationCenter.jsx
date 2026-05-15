import { useNotifications } from "../context/NotificationContext";

const TYPE_CONFIG = {
  success: {
    border: "rgba(34,197,94,0.4)",
    bg: "rgba(34,197,94,0.07)",
    accent: "#4ade80",
    icon: "✓",
  },
  error: {
    border: "rgba(239,68,68,0.4)",
    bg: "rgba(239,68,68,0.07)",
    accent: "#f87171",
    icon: "✕",
  },
  info: {
    border: "rgba(59,130,246,0.4)",
    bg: "rgba(59,130,246,0.07)",
    accent: "#60a5fa",
    icon: "i",
  },
};

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        width: "340px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {notifications.map((item) => {
        const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              padding: "12px 14px",
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderLeft: `3px solid ${cfg.accent}`,
              borderRadius: "8px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              animation: "notifSpring 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: cfg.accent,
                color: "#000",
                fontSize: "10px",
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "1px",
                fontFamily: "var(--font-heading)",
              }}
            >
              {cfg.icon}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#fff",
                  marginBottom: item.message ? "3px" : 0,
                }}
              >
                {item.title}
              </div>
              {item.message && (
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.65)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.message}
                </div>
              )}
            </div>

            <button
              onClick={() => removeNotification(item.id)}
              style={{
                border: "none",
                background: "rgba(255,255,255,0.08)",
                cursor: "pointer",
                fontSize: "13px",
                lineHeight: 1,
                color: "rgba(255,255,255,0.5)",
                width: "20px",
                height: "20px",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: 0,
                transform: "none",
                boxShadow: "none",
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
