import { useEffect, useState } from "react";
import { exportFinancialAudit, getFinancialAudit } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminFinancialAuditPanel() {
  const { notifyError } = useNotifications();
  const { playClick } = useSounds();

  const [period, setPeriod] = useState("all");
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAudit(period);
  }, [period]);

  async function loadAudit(selectedPeriod) {
    try {
      const result = await getFinancialAudit(selectedPeriod);
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError("Financial Audit", error.message || "Impossible de charger l’audit financier.");
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
        <h3>Financial Audit</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  const { summary, recent_revenue, recent_stripe_payments, recent_withdrawals } = data;

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>Financial Audit</h3>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() => {
              playClick();
              exportFinancialAudit(period);
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: "16px" }}>
        <div className="stat-box"><strong>Platform Balance :</strong> {summary.platform_balance}</div>
        <div className="stat-box"><strong>Total Rake :</strong> {summary.total_rake}</div>
        <div className="stat-box"><strong>Total Gross Revenue :</strong> {summary.total_gross_revenue}</div>
        <div className="stat-box"><strong>Total Net Revenue :</strong> {summary.total_net_revenue}</div>
        <div className="stat-box"><strong>Total Stripe In :</strong> {summary.total_stripe_in}</div>
        <div className="stat-box"><strong>Approved Withdrawals :</strong> {summary.total_withdrawals_approved}</div>
        <div className="stat-box"><strong>Rejected Withdrawals :</strong> {summary.total_withdrawals_rejected}</div>
        <div className="stat-box"><strong>Pending Withdrawals :</strong> {summary.total_withdrawals_pending}</div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Recent Platform Revenue</h4>
        {recent_revenue.length === 0 ? (
          <p>No revenue rows.</p>
        ) : (
          recent_revenue.map((row) => (
            <div key={`rev-${row.id}`} className="simple-list-item">
              #{row.id} — {row.source} — gross: {row.gross_amount} — rake: {row.rake_amount} — net: {row.net_amount}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Recent Stripe Payments</h4>
        {recent_stripe_payments.length === 0 ? (
          <p>No Stripe payments.</p>
        ) : (
          recent_stripe_payments.map((row) => (
            <div key={`stripe-${row.id}`} className="simple-list-item">
              #{row.id} — {row.player_id} — {row.amount} — {row.status}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Recent Withdrawals</h4>
        {recent_withdrawals.length === 0 ? (
          <p>No withdrawals.</p>
        ) : (
          recent_withdrawals.map((row) => (
            <div key={`wd-${row.id}`} className="simple-list-item">
              #{row.id} — {row.player_id} — {row.amount} — {row.status}
            </div>
          ))
        )}
      </div>
    </div>
  );
}