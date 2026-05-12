import { useEffect, useState } from "react";
import {
  getAntiChurnActionsAdmin,
  getGrowthChurnAdmin,
  measureAntiChurnActionsAdmin,
  runAntiChurnCampaignAdmin,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

function riskLabelColor(riskLevel) {
  if (riskLevel === "high") return "#dc2626";
  if (riskLevel === "medium") return "#eab308";
  return "#16a34a";
}

export default function AdminGrowthChurnPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [data, setData] = useState(null);
  const [actions, setActions] = useState([]);
  const [riskLevel, setRiskLevel] = useState("high");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [churnResult, actionsResult] = await Promise.all([
        getGrowthChurnAdmin(),
        getAntiChurnActionsAdmin(),
      ]);

      setData(churnResult);
      setActions(actionsResult || []);
    } catch (error) {
      console.error(error);
      notifyError(
        "Growth Churn",
        error.message || "Impossible de charger la prédiction churn."
      );
    }
  }

  async function handleRunAntiChurn() {
    try {
      const result = await runAntiChurnCampaignAdmin(riskLevel);
      await load();

      notifySuccess(
        "Anti-churn",
        `Campaign executed. Players affected: ${result.players_affected}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "Anti-churn",
        error.message || "Impossible d’exécuter la campagne anti-churn."
      );
    }
  }

  async function handleMeasureActions() {
  try {
    const result = await measureAntiChurnActionsAdmin();
    await load();

    notifySuccess(
      "Anti-churn",
      `Measurement completed. Actions measured: ${result.measured_count}`
    );
  } catch (error) {
    console.error(error);
    notifyError(
      "Anti-churn",
      error.message || "Impossible de mesurer les actions anti-churn."
    );
  }
}

  if (!data) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Admin Growth Churn Prediction</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  const { summary, rows } = data;

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Growth Churn Prediction</h3>

      <div className="stats-grid" style={{ marginTop: "16px" }}>
        <div className="stat-box">
          <strong>Total players:</strong> {summary.total_players}
        </div>
        <div className="stat-box">
          <strong>High risk:</strong> {summary.high_risk}
        </div>
        <div className="stat-box">
          <strong>Medium risk:</strong> {summary.medium_risk}
        </div>
        <div className="stat-box">
          <strong>Low risk:</strong> {summary.low_risk}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 16 }}>
        <h4>Run Anti-Churn Campaign</h4>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
          >
            <option value="high">High risk — 15 tokens</option>
            <option value="medium">Medium risk — 5 tokens</option>
          </select>

          <button
            onClick={() => {
              playClick();
              handleRunAntiChurn();
            }}
          >
            Run Anti-Churn
          </button>
          <button
            onClick={() => {
              playClick();
              handleMeasureActions();
            }}
          >
            Measure Results
         </button>
        </div>
      </div>

      <div style={{ marginTop: "20px", overflowX: "auto" }}>
        <h4>Churn Prediction</h4>

        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Games</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Deposited</th>
              <th>Tier</th>
              <th>Referred</th>
              <th>Referrer</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.player_id}>
                <td>{row.player_id}</td>
                <td>{row.churn_score}</td>
                <td
                  style={{
                    color: riskLabelColor(row.risk_level),
                    fontWeight: 700,
                  }}
                >
                  {row.risk_level}
                </td>
                <td>{row.games_played}</td>
                <td>{row.wins}</td>
                <td>{row.losses}</td>
                <td>{row.has_deposited ? "Yes" : "No"}</td>
                <td>{row.tier}</td>
                <td>{row.is_referred ? "Yes" : "No"}</td>
                <td>{row.is_referrer ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Anti-Churn Actions History</h4>

        {actions.length === 0 ? (
          <p>No anti-churn actions yet.</p>
        ) : (
          actions.map((action) => (
        <div key={action.id} className="simple-list-item">
          <div>
            <strong>{action.player_id}</strong> — {action.risk_level} risk
         </div>

         <div>
           Score: {action.churn_score} | Reward: {action.reward_amount}
         </div>

         <div>
           Games after: {action.games_after} | Deposited after:{" "}
           {action.deposited_after ? "Yes" : "No"} | Deposit amount:{" "}
           {action.deposit_amount_after}
         </div>

         <div>
           Reactivated:{" "}
           <strong style={{ color: action.reactivated ? "#16a34a" : "#dc2626" }}>
             {action.reactivated ? "Yes" : "No"}
           </strong>
         </div>

         <div style={{ fontSize: "12px", opacity: 0.8 }}>
           Sent: {action.created_at}
         </div>

         <div style={{ fontSize: "12px", opacity: 0.8 }}>
           Measured: {action.measured_at || "-"}
         </div>
        </div>
          ))
        )}
      </div>
    </div>
  );
}