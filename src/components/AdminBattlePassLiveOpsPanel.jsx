import { useEffect, useState } from "react";
import {
  getBattlePassLiveOpsStatusAdmin,
  runBattlePassLiveOpsAdmin,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminBattlePassLiveOpsPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getBattlePassLiveOpsStatusAdmin();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError(
        "Battle Pass Live Ops",
        error.message || "Impossible de charger le statut live ops."
      );
    }
  }

  async function handleRun() {
    try {
      const result = await runBattlePassLiveOpsAdmin();
      await load();
      notifySuccess(
        "Battle Pass Live Ops",
        result.message || "Live ops cycle executed successfully."
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "Battle Pass Live Ops",
        error.message || "Impossible d’exécuter le cycle live ops."
      );
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Admin Battle Pass Live Ops</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>Admin Battle Pass Live Ops</h3>

        <button
          onClick={() => {
            playClick();
            handleRun();
          }}
        >
          Run Live Ops Cycle
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        {data.active_season ? (
          <>
            <p><strong>Active season:</strong> {data.active_season.name} (#{data.active_season.id})</p>
            <p><strong>Start:</strong> {data.active_season.start_date}</p>
            <p><strong>End:</strong> {data.active_season.end_date}</p>
            <p><strong>Expired:</strong> {data.active_season.expired ? "Yes" : "No"}</p>
          </>
        ) : (
          <p>No active season.</p>
        )}

        <p><strong>Total seasons:</strong> {data.seasons_count}</p>
      </div>

      <div style={{ marginTop: "16px" }}>
        <h4>Recent Seasons</h4>

        {data.recent_seasons.length === 0 ? (
          <p>No seasons yet.</p>
        ) : (
          data.recent_seasons.map((season) => (
            <div key={season.id} className="simple-list-item">
              #{season.id} — {season.name} — {season.is_active ? "Active" : "Closed"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}