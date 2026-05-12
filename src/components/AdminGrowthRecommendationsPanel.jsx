import { useEffect, useState } from "react";
import {
  createCampaignFromRecommendationAdmin,
  getGrowthRecommendationsAdmin,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

function priorityColor(priority) {
  if (priority === "high") return "#dc2626";
  if (priority === "medium") return "#eab308";
  return "#16a34a";
}

export default function AdminGrowthRecommendationsPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getGrowthRecommendationsAdmin();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError(
        "Growth Recommendations",
        error.message || "Impossible de charger les recommandations CRM."
      );
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Admin Growth Recommendations</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  async function handleCreateCampaign(recommendation) {
  try {
    const result = await createCampaignFromRecommendationAdmin(recommendation);

    notifySuccess(
      "Growth Recommendations",
      `Campaign created: ${result.name}`
    );
  } catch (error) {
    console.error(error);
    notifyError(
      "Growth Recommendations",
      error.message || "Impossible de créer la campagne depuis la recommandation."
    );
  }
}

  const { summary, recommendations } = data;

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Growth Recommendations</h3>

      <div className="stats-grid" style={{ marginTop: "16px" }}>
        <div className="stat-box">
          <strong>Total:</strong> {summary.recommendations_count}
        </div>

        <div className="stat-box">
          <strong>High:</strong> {summary.high_priority}
        </div>

        <div className="stat-box">
          <strong>Medium:</strong> {summary.medium_priority}
        </div>

        <div className="stat-box">
          <strong>Low:</strong> {summary.low_priority}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {recommendations.length === 0 ? (
          <p>No recommendations right now.</p>
        ) : (
          recommendations.map((row, index) => (
            <div key={index} className="simple-list-item">
              <div>
                <strong>{row.title}</strong>{" "}
                <span
                  style={{
                    color: priorityColor(row.priority),
                    fontWeight: 700,
                  }}
                >
                  [{row.priority}]
                </span>
              </div>

              <div>
                Category: {row.category}
              </div>

              <div>
                Reason: {row.reason}
              </div>

              <div>
                Suggested action: {row.suggested_action} | Segment:{" "}
                {row.suggested_segment} | Reward: {row.suggested_reward}
              </div>
              <button
                style={{ marginTop: "8px" }}
                onClick={() => handleCreateCampaign(row)}
              >
               Create Campaign
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}