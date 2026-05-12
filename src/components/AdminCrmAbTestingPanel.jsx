import { useEffect, useState } from "react";
import {
  getCrmAbTestsAdmin,
  selectCrmAbTestWinnerAdmin,
  promoteCrmAbTestWinnerAdmin,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

function getParentId(row) {
  return row.parent_campaign_id || row.campaign_id;
}

export default function AdminCrmAbTestingPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [rows, setRows] = useState([]);
  const [promotionSchedule, setPromotionSchedule] = useState("weekly");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getCrmAbTestsAdmin();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM A/B Testing",
        error.message || "Impossible de charger les A/B tests."
      );
    }
  }

  async function handleSelectWinner(parentId) {
    try {
      const result = await selectCrmAbTestWinnerAdmin(parentId);
      await load();

      notifySuccess(
        "CRM A/B Testing",
        `Winner selected: variant ${result.winner.variant_name}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM A/B Testing",
        error.message || "Impossible de sélectionner un gagnant."
      );
    }
  }

  async function handlePromoteWinner(parentId) {
    try {
      const result = await promoteCrmAbTestWinnerAdmin(
        parentId,
        promotionSchedule
      );

      await load();

      notifySuccess(
        "CRM A/B Testing",
        `Winner promoted: ${result.winner_name} (${result.new_schedule_type})`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM A/B Testing",
        error.message || "Impossible de promouvoir la variante gagnante."
      );
    }
  }

  const parentIds = Array.from(new Set(rows.map((row) => getParentId(row))));

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin CRM A/B Testing</h3>

      {rows.length === 0 ? (
        <p>No A/B campaigns yet.</p>
      ) : (
        parentIds.map((parentId) => {
          const groupRows = rows.filter((row) => getParentId(row) === parentId);

          return (
            <div key={parentId} style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <h4 style={{ margin: 0 }}>A/B Test Parent #{parentId}</h4>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select
                    value={promotionSchedule}
                    onChange={(e) => setPromotionSchedule(e.target.value)}
                  >
                    <option value="manual">Manual</option>
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>

                  <button
                    onClick={() => {
                      playClick();
                      handleSelectWinner(parentId);
                    }}
                  >
                    Select Winner
                  </button>

                  <button
                    onClick={() => {
                      playClick();
                      handlePromoteWinner(parentId);
                    }}
                  >
                    Promote Winner
                  </button>
                </div>
              </div>

              {groupRows.map((row) => (
                <div key={row.campaign_id} className="simple-list-item">
                  <div>
                    <strong>{row.name}</strong> — Variant {row.variant_name}{" "}
                    {row.is_ab_winner ? "🏆 Winner" : ""}
                  </div>

                  <div>
                    Segment: {row.segment} | Reward: {row.reward_amount}
                  </div>

                  <div>
                    Assigned: {row.assigned_count} | Executed:{" "}
                    {row.affected_count}
                  </div>

                  <div>
                    Depositors: {row.depositors_after_campaign} | Conversion:{" "}
                    {row.conversion_rate}% | Stripe amount:{" "}
                    {row.total_deposit_amount}
                  </div>

                  {row.ab_winner_reason && (
                    <div style={{ marginTop: "6px", fontWeight: 700 }}>
                      Reason: {row.ab_winner_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}