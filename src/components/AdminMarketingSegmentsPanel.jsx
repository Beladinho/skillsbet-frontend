import { useEffect, useState } from "react";
import { getMarketingSegmentsAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

function SegmentBlock({ title, rows }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h4>{title}</h4>

      {rows.length === 0 ? (
        <p>No players in this segment.</p>
      ) : (
        rows.map((row) => (
          <div key={row.player_id} className="simple-list-item">
            <strong>{row.player_id}</strong> — games: {row.games_played} — tier: {row.tier}
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminMarketingSegmentsPanel() {
  const { notifyError } = useNotifications();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const result = await getMarketingSegmentsAdmin();
      setData(result);
    } catch (error) {
      console.error(error);
      notifyError(
        "Marketing Segments",
        error.message || "Impossible de charger les segments marketing."
      );
    }
  }

  if (!data) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Admin Marketing Segments</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  const { summary, segments } = data;

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Marketing Segments</h3>

      <div className="stats-grid" style={{ marginTop: "16px" }}>
        <div className="stat-box"><strong>New Users:</strong> {summary.new_users}</div>
        <div className="stat-box"><strong>Inactive Users:</strong> {summary.inactive_users}</div>
        <div className="stat-box"><strong>Never Depositors:</strong> {summary.never_depositors}</div>
        <div className="stat-box"><strong>Converted Users:</strong> {summary.converted_users}</div>
        <div className="stat-box"><strong>VIP Users:</strong> {summary.vip_users}</div>
        <div className="stat-box"><strong>Referred Users:</strong> {summary.referred_users}</div>
        <div className="stat-box"><strong>Referrers:</strong> {summary.referrers}</div>
      </div>

      <SegmentBlock title="New Users" rows={segments.new_users} />
      <SegmentBlock title="Inactive Users" rows={segments.inactive_users} />
      <SegmentBlock title="Never Depositors" rows={segments.never_depositors} />
      <SegmentBlock title="Converted Users" rows={segments.converted_users} />
      <SegmentBlock title="VIP Users" rows={segments.vip_users} />
      <SegmentBlock title="Referred Users" rows={segments.referred_users} />
      <SegmentBlock title="Referrers" rows={segments.referrers} />
    </div>
  );
}