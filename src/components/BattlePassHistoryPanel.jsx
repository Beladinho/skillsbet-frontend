import { useEffect, useState } from "react";
import { getMyBattlePassHistory } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function BattlePassHistoryPanel() {
  const { notifyError } = useNotifications();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyBattlePassHistory();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass History", error.message || "Impossible de charger l’historique Battle Pass.");
    }
  }

  return (
    <div className="card" style={{ marginTop: 20, padding: 16 }}>
      <h3>Battle Pass History</h3>

      {rows.length === 0 ? (
        <p>No finished seasons yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            Season #{row.season_id} — Level {row.final_level} — XP {row.final_xp} — {row.premium ? "Premium" : "Free"}
          </div>
        ))
      )}
    </div>
  );
}