import { useEffect, useState } from "react";
import {
  closeBattlePassSeasonAdmin,
  createBattlePassSeasonAdmin,
  getBattlePassSeasonsAdmin,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminBattlePassSeasonsPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [rows, setRows] = useState([]);
  const [name, setName] = useState("Season 2");
  const [durationDays, setDurationDays] = useState(30);
  const [copyFromSeasonId, setCopyFromSeasonId] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getBattlePassSeasonsAdmin();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass Seasons", error.message || "Impossible de charger les saisons.");
    }
  }

  async function handleCreate() {
    try {
      const result = await createBattlePassSeasonAdmin(
        name,
        durationDays,
        copyFromSeasonId
      );

      await load();

      notifySuccess(
        "Battle Pass Seasons",
        `Season created. Rewards copied: ${result.rewards_copied}, missions copied: ${result.missions_copied}.`
      );
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass Seasons", error.message || "Impossible de créer la saison.");
    }
  }

  async function handleClose(seasonId) {
    try {
      await closeBattlePassSeasonAdmin(seasonId);
      await load();
      notifySuccess("Battle Pass Seasons", "Season closed successfully.");
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass Seasons", error.message || "Impossible de clôturer la saison.");
    }
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Battle Pass Seasons</h3>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label>Season name</label>
          <br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Duration (days)</label>
          <br />
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Copy from season ID (optional)</label>
          <br />
          <input
            type="number"
            value={copyFromSeasonId}
            onChange={(e) => setCopyFromSeasonId(e.target.value)}
            placeholder="Example: 1"
          />
        </div>

        <button
          onClick={() => {
            playClick();
            handleCreate();
          }}
        >
          Create Season
        </button>
      </div>

      {rows.length === 0 ? (
        <p>No Battle Pass seasons yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
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
                <strong>{row.name}</strong> — #{row.id}
                <div>Active: {row.is_active ? "Yes" : "No"}</div>
                <div>Start: {row.start_date}</div>
                <div>End: {row.end_date}</div>
              </div>

              {row.is_active && (
                <button
                  onClick={() => {
                    playClick();
                    handleClose(row.id);
                  }}
                >
                  Close Season
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}