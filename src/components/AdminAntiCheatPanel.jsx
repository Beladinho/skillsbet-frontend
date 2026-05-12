import { useEffect, useState } from "react";
import { getAntiCheatProfiles, updateAntiCheatRisk } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

function riskColor(level) {
  if (level === "banned") return "#dc2626";
  if (level === "flagged") return "#f97316";
  if (level === "watch") return "#eab308";
  return "#16a34a";
}

export default function AdminAntiCheatPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const data = await getAntiCheatProfiles();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Anti-cheat", error.message || "Impossible de charger les profils.");
    }
  }

  async function handleRiskChange(playerId, riskLevel) {
    try {
      await updateAntiCheatRisk(playerId, riskLevel);
      await loadRows();
      notifySuccess("Anti-cheat", `Risk updated to ${riskLevel}.`);
    } catch (error) {
      console.error(error);
      notifyError("Anti-cheat", error.message || "Impossible de mettre à jour le risque.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Admin Anti-Cheat</h3>

      {rows.length === 0 ? (
        <p>No anti-cheat profiles yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
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
                  <strong>{row.player_id}</strong>
                </p>
                <p style={{ margin: "0 0 6px 0" }}>
                  Suspicion: {row.suspicion_score} | Flags: {row.flags_count}
                </p>
                <p style={{ margin: "0 0 6px 0" }}>
                  Last reason: {row.last_reason || "-"}
                </p>
                <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>
                  Updated: {row.updated_at || "-"}
                </p>
              </div>

              <div>
                <div
                  style={{
                    marginBottom: "8px",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: riskColor(row.risk_level),
                    color: "white",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  {row.risk_level}
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      playClick();
                      handleRiskChange(row.player_id, "clean");
                    }}
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      handleRiskChange(row.player_id, "watch");
                    }}
                  >
                    Watch
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      handleRiskChange(row.player_id, "flagged");
                    }}
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      handleRiskChange(row.player_id, "banned");
                    }}
                  >
                    Ban
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}