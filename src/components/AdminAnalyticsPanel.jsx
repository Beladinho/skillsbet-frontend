import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export default function AdminAnalyticsPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("all");
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    loadAnalytics(period);
  }, [period]);

  async function loadAnalytics(selectedPeriod) {
    try {
      const result = await getAdminAnalytics(selectedPeriod);
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError("Analytics", error.message || "Impossible de charger les analytics.");
    }
  }

  async function downloadExport(path, filename) {
    try {
      setExporting(filename);

      const token = localStorage.getItem("skillsbet_token");

      const res = await fetch(`${API_URL}${path}`, {
        method: "GET",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      notifySuccess("Export", `${filename} téléchargé.`);
    } catch (error) {
      console.error(error);
      notifyError("Export", error.message || "Impossible de télécharger le fichier.");
    } finally {
      setExporting("");
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
        <h3>Admin Analytics</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>Admin Analytics</h3>

      <div className="inline-button-group" style={{ marginBottom: "16px" }}>
        <button onClick={() => setPeriod("today")}>Today</button>
        <button onClick={() => setPeriod("7d")}>7 Days</button>
        <button onClick={() => setPeriod("30d")}>30 Days</button>
        <button onClick={() => setPeriod("all")}>All Time</button>
      </div>

      <div className="inline-button-group" style={{ marginBottom: "16px" }}>
        <button
          onClick={() => downloadExport("/admin/export/revenue", "revenue.csv")}
          disabled={exporting !== ""}
        >
          {exporting === "revenue.csv" ? "Export..." : "Export Revenue"}
        </button>

        <button
          onClick={() => downloadExport("/admin/export/withdrawals", "withdrawals.csv")}
          disabled={exporting !== ""}
        >
          {exporting === "withdrawals.csv" ? "Export..." : "Export Withdrawals"}
        </button>

        <button
          onClick={() => downloadExport("/admin/export/duels", "duels.csv")}
          disabled={exporting !== ""}
        >
          {exporting === "duels.csv" ? "Export..." : "Export Duels"}
        </button>

        <button
          onClick={() => downloadExport("/admin/export/users", "users.csv")}
          disabled={exporting !== ""}
        >
          {exporting === "users.csv" ? "Export..." : "Export Users"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <strong>Total Users :</strong> {data.total_users}
        </div>

        <div className="stat-box">
          <strong>Total Duels :</strong> {data.total_duels}
        </div>

        <div className="stat-box">
          <strong>Total Tournaments :</strong> {data.total_tournaments}
        </div>

        <div className="stat-box">
          <strong>Total Withdrawals :</strong> {data.total_withdrawals}
        </div>

        <div className="stat-box">
          <strong>Pending Withdrawals :</strong> {data.pending_withdrawals}
        </div>

        <div className="stat-box">
          <strong>Total Rake :</strong> {data.total_rake}
        </div>

        <div className="stat-box">
          <strong>Platform Balance :</strong> {data.platform_balance}
        </div>
      </div>
    </div>
  );
}