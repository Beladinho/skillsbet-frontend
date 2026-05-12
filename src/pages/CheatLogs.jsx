import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getCheatLogs } from "../api/skillsbetApi";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";

export default function CheatLogs() {
  const { role } = useContext(PlayerContext);
  const { tr } = useAppSettings();
  const { notifyError } = useNotifications();

  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      return;
    }

    async function loadLogs() {
      try {
        setError("");
        const data = await getCheatLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        const msg = err.message || tr("adminOnly");
        setError(msg);
        notifyError(tr("cheatLogs"), msg);
      }
    }

    loadLogs();
  }, [role, tr, notifyError]);

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: "30px", padding: "16px" }}>
      <h3>{tr("cheatLogs")}</h3>

      {error ? (
        <p style={{ color: "red" }}>
          {tr("error")} : {error}
        </p>
      ) : logs.length === 0 ? (
        <p>{tr("noCheatLogs")}</p>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            style={{
              border: "1px solid #999",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>ID :</strong> {log.id}
            </p>
            <p>
              <strong>Duel ID :</strong> {log.duel_id}
            </p>
            <p>
              <strong>{tr("email")} :</strong> {log.player_id}
            </p>
            <p>
              <strong>{tr("matchmakingGame")} :</strong> {log.game}
            </p>
            <p>
              <strong>{tr("submittedScore")} :</strong> {log.submitted_score}
            </p>
            <p>
              <strong>{tr("reason")} :</strong> {log.reason}
            </p>
          </div>
        ))
      )}
    </div>
  );
}