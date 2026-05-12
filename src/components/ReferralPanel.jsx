import { useEffect, useState } from "react";
import { getMyReferralData } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function ReferralPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getMyReferralData();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError("Referrals", error.message || "Impossible de charger les données de parrainage.");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.my_code);
      notifySuccess("Referrals", "Referral code copied.");
    } catch (error) {
      console.error(error);
      notifyError("Referrals", "Impossible de copier le code.");
    }
  }

  if (!data) return null;

  return (
    <div className="card" style={{ marginTop: 20, padding: 16 }}>
      <h3>Referral Program</h3>

      <p><strong>My referral code:</strong> {data.my_code}</p>
      <button onClick={handleCopy}>Copy code</button>

      <p style={{ marginTop: "12px" }}>
        <strong>Total referrals:</strong> {data.total_referrals}
      </p>

      <p>
        <strong>Total earned:</strong> {data.total_earned} tokens
      </p>

      <div style={{ marginTop: "12px" }}>
        {data.rows.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          data.rows.map((row) => (
            <div key={row.id} className="simple-list-item">
              {row.referred_player_id} — reward: {row.referrer_reward}
            </div>
          ))
        )}
      </div>
    </div>
  );
}