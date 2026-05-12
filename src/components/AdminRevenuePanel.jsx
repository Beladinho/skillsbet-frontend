import { useEffect, useState } from "react";
import { getPlatformRevenue, getPlatformWallet } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminRevenuePanel() {
  const { notifyError } = useNotifications();
  const [data, setData] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    loadRevenue();
  }, []);

  async function loadRevenue() {
    try {
      const [rev, wal] = await Promise.all([
        getPlatformRevenue(),
        getPlatformWallet(),
      ]);

      setData(rev);
      setWallet(wal);
    } catch (error) {
      console.error(error);
      notifyError("Revenue", error.message || "Erreur");
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
        <h3>Platform Revenue</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Platform Revenue</h3>

      <p><strong>Total Gross :</strong> {data.summary.total_gross}</p>
      <p><strong>Total Rake :</strong> {data.summary.total_rake}</p>
      <p><strong>Total Net :</strong> {data.summary.total_net}</p>
      <p><strong>Platform Balance :</strong> {wallet?.balance ?? 0}</p>

      <div style={{ marginTop: "16px" }}>
        {data.rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            #{row.id} — {row.source} — ref: {row.reference_id} — gross: {row.gross_amount} — rake: {row.rake_amount} — net: {row.net_amount}
          </div>
        ))}
      </div>
    </div>
  );
}