import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAnalyticsDashboard,
  getAnalyticsCharts,
  getAnalyticsRetention,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0f1927",
    border: "1px solid #1e3a5f",
    color: "#e2e8f0",
    fontSize: 12,
  },
};

function MetricCard({ label, value, color = "#00d4ff" }) {
  return (
    <div
      style={{
        background: "#0f1927",
        border: "1px solid #1e3a5f",
        borderRadius: 8,
        padding: "14px 18px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ color, fontSize: 26, fontWeight: 700 }}>{value ?? "—"}</div>
    </div>
  );
}

function SectionCard({ title, children, style }) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 16, ...style }}>
      <h4 style={{ margin: "0 0 14px", color: "#e2e8f0" }}>{title}</h4>
      {children}
    </div>
  );
}

function PlayerRow({ rank, player }) {
  const initial = (player.display_name || player.email)[0].toUpperCase();
  return (
    <tr style={{ borderBottom: "1px solid #0f1927" }}>
      <td style={{ padding: "8px 6px", color: "#64748b", width: 32 }}>{rank}</td>
      <td style={{ padding: "8px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {player.avatar_url ? (
            <img
              src={player.avatar_url}
              alt=""
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1e3a5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}
          <span style={{ color: "#e2e8f0" }}>{player.display_name || player.email}</span>
        </div>
      </td>
      <td style={{ padding: "8px 6px", color: "#94a3b8", fontSize: 12 }}>{player.country || "—"}</td>
      <td style={{ padding: "8px 6px", textAlign: "right", color: "#7c3aed", fontSize: 12 }}>
        Niv. {player.level}
      </td>
      <td style={{ padding: "8px 6px", textAlign: "right", color: "#00d4ff", fontWeight: 600 }}>
        {player.games_played}
      </td>
      <td style={{ padding: "8px 6px", textAlign: "right", color: "#64748b", fontSize: 12 }}>
        ~{Math.round(player.games_played * 8)} min
      </td>
    </tr>
  );
}

function UserChip({ user }) {
  const initial = (user.display_name || user.email)[0].toUpperCase();
  return (
    <div
      style={{
        background: "#0f1927",
        border: "1px solid #10b981",
        borderRadius: 8,
        padding: "7px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt=""
          style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#1e3a5f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
      )}
      <span style={{ color: "#e2e8f0", fontSize: 13 }}>{user.display_name || user.email}</span>
    </div>
  );
}

function InactiveRow({ user }) {
  const initial = (user.display_name || user.email)[0].toUpperCase();
  return (
    <tr style={{ borderBottom: "1px solid #0f1927" }}>
      <td style={{ padding: "8px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#1e3a5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}
          <span style={{ color: "#e2e8f0", fontSize: 13 }}>{user.display_name || user.email}</span>
        </div>
      </td>
      <td style={{ padding: "8px 6px", color: "#94a3b8", fontSize: 12 }}>{user.country || "—"}</td>
      <td style={{ padding: "8px 6px", color: "#64748b", fontSize: 12 }}>
        {user.last_seen
          ? new Date(user.last_seen).toLocaleDateString("fr-FR")
          : "Jamais connecté"}
      </td>
    </tr>
  );
}

const AXIS_TICK = { fill: "#94a3b8", fontSize: 11 };
const GRID_PROPS = { strokeDasharray: "3 3", stroke: "#1e3a5f" };

export default function AdminAnalyticsDashboardPanel() {
  const { notifyError } = useNotifications();
  const [dash, setDash] = useState(null);
  const [charts, setCharts] = useState(null);
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [d, c, r] = await Promise.all([
        getAnalyticsDashboard(),
        getAnalyticsCharts(),
        getAnalyticsRetention(),
      ]);
      setDash(d);
      setCharts(c);
      setRetention(r);
    } catch (err) {
      notifyError("Analytics Dashboard", err.message || "Erreur chargement analytics.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <h3>Analytics Dashboard</h3>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Analytics Dashboard</h3>
        <button onClick={loadAll}>Actualiser</button>
      </div>

      {/* === MÉTRIQUES CLÉS === */}
      <SectionCard title="Joueurs actifs">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricCard label="Aujourd'hui" value={dash?.active_today} />
          <MetricCard label="Cette semaine" value={dash?.active_week} />
          <MetricCard label="Ce mois" value={dash?.active_month} color="#10b981" />
        </div>
      </SectionCard>

      <SectionCard title="Nouvelles inscriptions">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricCard label="Aujourd'hui" value={dash?.new_today} color="#f59e0b" />
          <MetricCard label="Cette semaine" value={dash?.new_week} color="#f59e0b" />
        </div>
      </SectionCard>

      <SectionCard title="Autres métriques clés" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricCard label="Parties aujourd'hui" value={dash?.games_today} color="#7c3aed" />
          <MetricCard label="Parties cette semaine" value={dash?.games_week} color="#7c3aed" />
          <MetricCard
            label="Revenus Stripe (mois)"
            value={`${(dash?.stripe_revenue_month ?? 0).toFixed(2)} €`}
            color="#10b981"
          />
          <MetricCard
            label="Taux de rétention"
            value={`${dash?.retention_rate ?? 0}%`}
            color="#00d4ff"
          />
        </div>
      </SectionCard>

      {/* === GRAPHIQUES === */}
      <SectionCard title="Nouvelles inscriptions — 30 derniers jours">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={charts?.registrations_30d || []}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="day" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={false}
              name="Inscriptions"
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Parties jouées — 30 derniers jours">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={charts?.games_30d || []}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="day" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Parties"
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Top 5 jeux les plus joués">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts?.top_games || []}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="game" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#7c3aed" name="Parties" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Top 10 pays (nombre de joueurs)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={charts?.top_countries || []} layout="vertical">
            <CartesianGrid {...GRID_PROPS} />
            <XAxis type="number" tick={AXIS_TICK} allowDecimals={false} />
            <YAxis type="category" dataKey="country" tick={AXIS_TICK} width={72} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#f59e0b" name="Joueurs" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="ELO moyen de la plateforme — 30 derniers jours" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={charts?.elo_per_day || []}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="day" tick={AXIS_TICK} />
            <YAxis domain={["auto", "auto"]} tick={AXIS_TICK} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="avg_elo"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="ELO moyen"
            />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ color: "#64748b", fontSize: 11, margin: "8px 0 0" }}>
          ELO moyen des joueurs ayant participé à une partie chaque jour.
        </p>
      </SectionCard>

      {/* === TOP 20 JOUEURS ACTIFS === */}
      <SectionCard title="Top 20 joueurs les plus actifs (toutes périodes)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "#64748b", fontWeight: 500 }}>#</th>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "#94a3b8", fontWeight: 500 }}>Joueur</th>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "#94a3b8", fontWeight: 500 }}>Pays</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#94a3b8", fontWeight: 500 }}>Niveau</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#94a3b8", fontWeight: 500 }}>Parties</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#94a3b8", fontWeight: 500 }}>Temps estimé</th>
              </tr>
            </thead>
            <tbody>
              {(dash?.top_players || []).map((p, i) => (
                <PlayerRow key={p.email} rank={i + 1} player={p} />
              ))}
            </tbody>
          </table>
          {(!dash?.top_players || dash.top_players.length === 0) && (
            <p style={{ color: "#64748b", textAlign: "center", padding: 16 }}>Aucun joueur.</p>
          )}
        </div>
      </SectionCard>

      {/* === RÉTENTION === */}
      <SectionCard
        title={`Joueurs inactifs depuis 7 jours (${retention?.inactive_7d?.length ?? 0})`}
      >
        <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>
          Candidats pour une campagne de re-engagement
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "#94a3b8", fontWeight: 500 }}>Joueur</th>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "#94a3b8", fontWeight: 500 }}>Pays</th>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "#94a3b8", fontWeight: 500 }}>Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {(retention?.inactive_7d || []).map((u) => (
                <InactiveRow key={u.email} user={u} />
              ))}
            </tbody>
          </table>
          {(!retention?.inactive_7d || retention.inactive_7d.length === 0) && (
            <p style={{ color: "#64748b", textAlign: "center", padding: 16 }}>Aucun joueur inactif.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={
          <span>
            Joueurs fidèles ({retention?.loyal_daily?.length ?? 0}){" "}
            <span
              style={{
                marginLeft: 8,
                background: "#10b981",
                color: "#fff",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Fidèle
            </span>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>
          Joueurs ayant joué chaque jour de la semaine
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(retention?.loyal_daily || []).map((u) => (
            <UserChip key={u.email} user={u} />
          ))}
          {(!retention?.loyal_daily || retention.loyal_daily.length === 0) && (
            <p style={{ color: "#64748b", margin: 0 }}>Aucun joueur fidèle cette semaine.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
