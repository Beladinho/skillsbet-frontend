import { useEffect, useState } from "react";
import { getAntiChurnRoiAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

function roiColor(value) {
  if (value > 0) return "#16a34a";
  if (value < 0) return "#dc2626";
  return "#eab308";
}

export default function AdminAntiChurnRoiPanel() {
  const { notifyError } = useNotifications();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getAntiChurnRoiAdmin();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError(
        "Anti-Churn ROI",
        error.message || "Impossible de charger le ROI anti-churn."
      );
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Admin Anti-Churn ROI</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  const { summary, by_risk_level } = data;

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Anti-Churn ROI</h3>

      <div className="stats-grid" style={{ marginTop: "16px" }}>
        <div className="stat-box">
          <strong>Total actions:</strong> {summary.total_actions}
        </div>

        <div className="stat-box">
          <strong>Reactivated:</strong> {summary.total_reactivated}
        </div>

        <div className="stat-box">
          <strong>Reactivation rate:</strong> {summary.reactivation_rate}%
        </div>

        <div className="stat-box">
          <strong>Rewards sent:</strong> {summary.total_rewards_sent}
        </div>

        <div className="stat-box">
          <strong>Games after:</strong> {summary.total_games_after}
        </div>

        <div className="stat-box">
          <strong>Deposits after:</strong> {summary.total_deposit_amount_after}
        </div>

        <div className="stat-box">
          <strong>ROI:</strong>{" "}
          <span style={{ color: roiColor(summary.roi), fontWeight: 700 }}>
            {summary.roi}%
          </span>
        </div>
      </div>

      <div style={{ marginTop: "20px", overflowX: "auto" }}>
        <h4>ROI by Risk Level</h4>

        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Actions</th>
              <th>Reactivated</th>
              <th>Reactivation %</th>
              <th>Rewards Sent</th>
              <th>Deposits After</th>
              <th>ROI</th>
            </tr>
          </thead>

          <tbody>
            {["high", "medium"].map((risk) => {
              const row = by_risk_level[risk];

              return (
                <tr key={risk}>
                  <td>{risk}</td>
                  <td>{row.actions}</td>
                  <td>{row.reactivated}</td>
                  <td>{row.reactivation_rate}%</td>
                  <td>{row.rewards_sent}</td>
                  <td>{row.deposit_amount_after}</td>
                  <td style={{ color: roiColor(row.roi), fontWeight: 700 }}>
                    {row.roi}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}