import { useEffect, useState } from "react";
import { getMyTier } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

function tierColor(tier) {
  if (tier === "platinum") return "#a855f7";
  if (tier === "gold") return "#eab308";
  if (tier === "silver") return "#94a3b8";
  return "#b45309";
}

export default function TierPanel() {
  const { notifyError } = useNotifications();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadTier();
  }, []);

  async function loadTier() {
    try {
      const result = await getMyTier();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError("Tier", error.message || "Impossible de charger le tier.");
    }
  }

  if (!data) return null;

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Account Tier</h3>

      <div
        style={{
          display: "inline-block",
          padding: "8px 14px",
          borderRadius: "999px",
          background: tierColor(data.tier),
          color: "white",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.tier}
      </div>

      <p style={{ marginTop: "12px" }}>
        Updated: {data.updated_at}
      </p>
    </div>
  );
}