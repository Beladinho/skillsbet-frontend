import { useEffect, useState } from "react";
import { getGrowthCohortsAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

export default function AdminGrowthCohortsPanel() {
  const { notifyError } = useNotifications();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getGrowthCohortsAdmin();
      setRows(data.rows || []);
    } catch (error) {
      console.error(error);
      notifyError(
        "Growth Cohorts",
        error.message || "Impossible de charger les cohortes."
      );
    }
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Growth Cohorts</h3>

      {rows.length === 0 ? (
        <p>No cohorts yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="8" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Users</th>
                <th>Active</th>
                <th>Activation %</th>
                <th>Depositors</th>
                <th>Deposit %</th>
                <th>Referred</th>
                <th>Referral %</th>
                <th>VIP</th>
                <th>VIP %</th>
                <th>Avg Games</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.cohort}>
                  <td>{row.cohort}</td>
                  <td>{row.users}</td>
                  <td>{row.active_players}</td>
                  <td>{row.activation_rate}%</td>
                  <td>{row.depositors}</td>
                  <td>{row.deposit_conversion_rate}%</td>
                  <td>{row.referred_users}</td>
                  <td>{row.referral_share}%</td>
                  <td>{row.vip_users}</td>
                  <td>{row.vip_share}%</td>
                  <td>{row.avg_games_per_user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}