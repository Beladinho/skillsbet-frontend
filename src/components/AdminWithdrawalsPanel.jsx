import { useEffect, useState } from "react";
import { getAllWithdrawals, decideWithdrawal } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminWithdrawalsPanel() {
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const data = await getAllWithdrawals();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Withdrawals", error.message || "Erreur chargement");
    }
  }

  async function handleDecision(requestId, decision) {
    try {
      await decideWithdrawal(requestId, decision);
      await loadRows();
      notifySuccess("Withdrawals", `Request ${decision}.`);
    } catch (error) {
      console.error(error);
      notifyError("Withdrawals", error.message || "Erreur décision");
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Admin Withdrawals</h3>

      {rows.length === 0 ? (
        <p>No requests</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            <div>
              #{row.id} — {row.player_id} — {row.amount} — {row.status}
            </div>

            {row.status === "pending" && (
              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    playClick();
                    handleDecision(row.id, "approved");
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    playClick();
                    handleDecision(row.id, "rejected");
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}