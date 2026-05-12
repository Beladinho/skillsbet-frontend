import { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import {
  resetTournaments,
  resetMissions,
  resetHistory,
  resetDuels,
  resetQueue,
  resetDemoData,
  closeCurrentSeason,
  startNewSeason,
} from "../api/skillsbetApi";

export default function AdminDevPanel() {
  const { role } = useContext(PlayerContext);
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();

  const [status, setStatus] = useState("");

  if (role !== "admin") {
    return null;
  }

  async function runAction(label, action) {
    try {
      playClick();
      setStatus(`${label}...`);

      const result = await action();

      const message =
        result?.message ||
        result?.status ||
        `${label} completed`;

      setStatus(message);
      notifySuccess("Admin dev", message);
    } catch (error) {
      console.error(error);
      const message = error.message || "Action failed";
      setStatus(message);
      notifyError("Admin dev", message);
    }
  }

  return (
    <div className="card" style={{ marginTop: "30px", padding: "20px" }}>
      <h3>Admin Dev Panel</h3>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => runAction("Reset tournaments", resetTournaments)}>
          Reset tournaments
        </button>

        <button onClick={() => runAction("Reset missions", resetMissions)}>
          Reset missions
        </button>

        <button onClick={() => runAction("Reset history", resetHistory)}>
          Reset history
        </button>

        <button onClick={() => runAction("Reset duels", resetDuels)}>
          Reset duels
        </button>

        <button onClick={() => runAction("Reset queue", resetQueue)}>
          Reset queue
        </button>

        <button onClick={() => runAction("Close current season", closeCurrentSeason)}>
          Close current season
        </button>

        <button onClick={() => runAction("Start new season", startNewSeason)}>
          Start new season
        </button>

        <button onClick={() => runAction("Reset demo data", resetDemoData)}>
          Reset demo data
        </button>
      </div>

      {status ? <p style={{ marginTop: "14px" }}>{status}</p> : null}
    </div>
  );
}