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

export default function PlayerAvatar({ playerId, avatarUrl, size = 36, style = {} }) {
  const baseStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...style,
  };

  if (avatarUrl && avatarUrl.startsWith("data:")) {
    return (
      <div style={{ ...baseStyle, padding: 0 }}>
        <img
          src={avatarUrl}
          alt={playerId}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
        />
      </div>
    );
  }

  if (avatarUrl) {
    return (
      <div style={{
        ...baseStyle,
        background: "#1A1A1A",
        border: "1px solid rgba(255,107,0,0.3)",
        fontSize: size * 0.55,
        lineHeight: 1,
      }}>
        {avatarUrl}
      </div>
    );
  }

  const color = avatarColor(playerId);
  const initials = avatarInitials(playerId);

  return (
    <div style={{
      ...baseStyle,
      background: color,
      fontFamily: "var(--font-heading)",
      fontWeight: 900,
      fontSize: size * 0.38,
      color: "#fff",
      letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}
