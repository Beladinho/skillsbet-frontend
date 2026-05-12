import { useEffect, useState } from "react";
import { getBattlePassFinalGrantsAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminBattlePassFinalGrantsPanel() {
  const { notifyError } = useNotifications();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getBattlePassFinalGrantsAdmin();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError(
        "Battle Pass Final Grants",
        error.message || "Impossible de charger les grants de fin de saison."
      );
    }
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Battle Pass Final Grants</h3>

      {rows.length === 0 ? (
        <p>No final grants yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            <div>
              <strong>{row.player_id}</strong> — season #{row.season_id}
            </div>
            <div>
              Level: {row.final_level} | Base: {row.base_reward} | Premium bonus: {row.premium_bonus} | Total: {row.total_reward}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {row.created_at}
            </div>
          </div>
        ))
      )}
    </div>
  );
}