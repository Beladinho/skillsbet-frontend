import { useEffect, useState } from "react";
import {
  claimBattlePassMission,
  getBattlePassMissions,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function BattlePassMissionsPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getBattlePassMissions();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass Missions", error.message || "Impossible de charger les missions Battle Pass.");
    }
  }

  async function handleClaim(missionId) {
    try {
      await claimBattlePassMission(missionId);
      await load();
      notifySuccess("Battle Pass Missions", "Mission claimed successfully.");
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass Missions", error.message || "Impossible de claim la mission.");
    }
  }

  if (!data) {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: 20, padding: 16 }}>
      <h3>Battle Pass Missions</h3>

      {data.rows.length === 0 ? (
        <p>No Battle Pass missions available.</p>
      ) : (
        data.rows.map((mission) => (
          <div key={mission.id} className="simple-list-item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>{mission.label}</strong>
                <div>
                  Type: {mission.mission_type} | Reset: {mission.reset_type}
                </div>
                <div>
                  Progress: {mission.current_count} / {mission.target_count}
                </div>
                <div>
                  Reward: {mission.xp_reward} BP XP
                </div>
              </div>

              <div>
                {mission.claimed ? (
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>Claimed</span>
                ) : mission.claimable ? (
                  <button
                    onClick={() => {
                      playClick();
                      handleClaim(mission.id);
                    }}
                  >
                    Claim
                  </button>
                ) : mission.completed ? (
                  <span style={{ color: "#eab308", fontWeight: 700 }}>Ready</span>
                ) : (
                  <span style={{ opacity: 0.7 }}>In progress</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}