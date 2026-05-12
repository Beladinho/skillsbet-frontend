import { useEffect, useState } from "react";
import { getStripePayments } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminStripePaymentsPanel() {
  const { notifyError } = useNotifications();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const data = await getStripePayments();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Stripe", error.message || "Impossible de charger les paiements Stripe.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Admin Stripe Payments</h3>

      {rows.length === 0 ? (
        <p>No Stripe payments yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            <p style={{ margin: "0 0 6px 0" }}>
              <strong>#{row.id}</strong> — {row.player_id} — {row.amount}
            </p>
            <p style={{ margin: "0 0 6px 0" }}>
              session: {row.session_id}
            </p>
            <p style={{ margin: "0 0 6px 0" }}>
              status: {row.status}
            </p>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>
              {row.created_at}
            </p>
          </div>
        ))
      )}
    </div>
  );
}