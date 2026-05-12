import { useEffect, useState } from "react";
import { getGrowthCrmDashboardAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminGrowthCrmPanel() {
  const { notifyError } = useNotifications();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getGrowthCrmDashboardAdmin();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError(
        "Growth CRM",
        error.message || "Impossible de charger le dashboard growth CRM."
      );
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Admin Growth CRM</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  const { summary, recent_promo_redemptions, recent_referrals, top_promo_codes } = data;

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Growth CRM</h3>

      <div className="stats-grid" style={{ marginTop: "16px" }}>
        <div className="stat-box"><strong>Total users:</strong> {summary.total_users}</div>
        <div className="stat-box"><strong>Promo codes:</strong> {summary.total_promo_codes}</div>
        <div className="stat-box"><strong>Promo redemptions:</strong> {summary.total_promo_redemptions}</div>
        <div className="stat-box"><strong>Promo rewards:</strong> {summary.total_promo_rewards}</div>

        <div className="stat-box"><strong>Total referrals:</strong> {summary.total_referrals}</div>
        <div className="stat-box"><strong>Referrer rewards:</strong> {summary.total_referrer_rewards}</div>
        <div className="stat-box"><strong>Referred rewards:</strong> {summary.total_referred_rewards}</div>
        <div className="stat-box"><strong>Referred users:</strong> {summary.referred_user_count}</div>

        <div className="stat-box"><strong>Non-referred users:</strong> {summary.non_referred_user_count}</div>
        <div className="stat-box"><strong>Stripe depositors:</strong> {summary.total_stripe_depositors}</div>
        <div className="stat-box"><strong>Non-depositors:</strong> {summary.total_non_depositors}</div>
        <div className="stat-box"><strong>Total Stripe amount:</strong> {summary.total_stripe_amount}</div>

        <div className="stat-box"><strong>Referred converted:</strong> {summary.referred_conversion_count}</div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Top Promo Codes</h4>
        {top_promo_codes.length === 0 ? (
          <p>No promo codes yet.</p>
        ) : (
          top_promo_codes.map((row) => (
            <div key={row.id} className="simple-list-item">
              <strong>{row.code}</strong> — type: {row.promo_type} — used: {row.used_count} / {row.max_uses === 0 ? "∞" : row.max_uses}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Recent Promo Redemptions</h4>
        {recent_promo_redemptions.length === 0 ? (
          <p>No promo redemptions yet.</p>
        ) : (
          recent_promo_redemptions.map((row) => (
            <div key={row.id} className="simple-list-item">
              {row.player_id} — reward: {row.reward_amount}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Recent Referrals</h4>
        {recent_referrals.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          recent_referrals.map((row) => (
            <div key={row.id} className="simple-list-item">
              {row.referrer_player_id} referred {row.referred_player_id}
            </div>
          ))
        )}
      </div>
    </div>
  );
}