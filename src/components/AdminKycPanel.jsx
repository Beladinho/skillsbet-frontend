import { useEffect, useState } from "react";
import { decideKyc, getAllKycProfiles } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminKycPanel() {
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();

  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const data = await getAllKycProfiles();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("KYC", error.message || "Impossible de charger les profils KYC.");
    }
  }

  async function handleDecision(playerId, status) {
    try {
      await decideKyc({
        playerId,
        status,
        adminNote: notes[playerId] || "",
      });

      await loadRows();
      notifySuccess("KYC", `KYC ${status} for ${playerId}.`);
    } catch (error) {
      console.error(error);
      notifyError("KYC", error.message || "Impossible de traiter la décision KYC.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Admin KYC</h3>

      {rows.length === 0 ? (
        <p>No KYC profiles yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            <p style={{ margin: "0 0 6px 0" }}>
              <strong>{row.player_id}</strong> — {row.status}
            </p>
            <p style={{ margin: "0 0 6px 0" }}>
              {row.full_name || "-"} | {row.country || "-"} | {row.document_type || "-"}
            </p>
            <p style={{ margin: "0 0 6px 0" }}>
              Ref: {row.document_reference || "-"}
            </p>

            <input
              type="text"
              placeholder="Admin note"
              value={notes[row.player_id] || ""}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [row.player_id]: e.target.value,
                }))
              }
              style={{ marginBottom: "8px", width: "260px" }}
            />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  playClick();
                  handleDecision(row.player_id, "approved");
                }}
              >
                Approve
              </button>

              <button
                onClick={() => {
                  playClick();
                  handleDecision(row.player_id, "rejected");
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}