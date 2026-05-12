import { useEffect, useState } from "react";
import { getReferralsAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminReferralsPanel() {
  const { notifyError } = useNotifications();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getReferralsAdmin();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Referrals", error.message || "Impossible de charger les referrals.");
    }
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Referrals</h3>

      {rows.length === 0 ? (
        <p>No referrals yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            <div>
              <strong>{row.referrer_player_id}</strong> referred <strong>{row.referred_player_id}</strong>
            </div>
            <div>
              referrer reward: {row.referrer_reward} | referred reward: {row.referred_reward}
            </div>
          </div>
        ))
      )}
    </div>
  );
}