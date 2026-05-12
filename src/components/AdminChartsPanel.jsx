import { useEffect, useState } from "react";
import { getAdminCharts } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import SimpleBarChart from "./SimpleBarChart";

export default function AdminChartsPanel() {
  const { notifyError } = useNotifications();
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    loadCharts(period);
  }, [period]);

  async function loadCharts(selectedPeriod) {
    try {
      const result = await getAdminCharts(selectedPeriod);
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError("Charts", error.message || "Impossible de charger les graphiques.");
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
        <h3>Admin Charts</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <div className="inline-button-group" style={{ marginBottom: "16px" }}>
        <button onClick={() => setPeriod("today")}>Today</button>
        <button onClick={() => setPeriod("7d")}>7 Days</button>
        <button onClick={() => setPeriod("30d")}>30 Days</button>
        <button onClick={() => setPeriod("all")}>All Time</button>
      </div>

      <SimpleBarChart
        title="Revenue by Source"
        rows={data.revenue_by_source || []}
      />

      <SimpleBarChart
        title="Duels by Game"
        rows={data.duels_by_game || []}
      />

      <SimpleBarChart
        title="Withdrawals by Status"
        rows={data.withdrawals_by_status || []}
      />
    </div>
  );
}