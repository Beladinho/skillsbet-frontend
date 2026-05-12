import { useEffect, useState } from "react";
import { getAllPlayerTiers } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminTiersPanel() {
  const { notifyError } = useNotifications();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const data = await getAllPlayerTiers();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Tiers", error.message || "Impossible de charger les tiers.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Admin Tiers</h3>

      {rows.length === 0 ? (
        <p>No player tiers yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            #{row.id} — {row.player_id} — {row.tier}
          </div>
        ))
      )}
    </div>
  );
}