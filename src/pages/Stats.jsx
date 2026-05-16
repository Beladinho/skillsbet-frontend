import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { getPlayerStats, getMatchHistory, getLeaderboard } from "../api/skillsbetApi";
import SessionBar from "../components/SessionBar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar,
  PieChart, Pie, Cell,
} from "recharts";

const GAMES = [
  { key: "snake",    label: "Viper" },
  { key: "reflex",   label: "QuickShot" },
  { key: "memory",   label: "FlipMatch" },
  { key: "tetris",   label: "BlockDrop" },
  { key: "checkers", label: "DraughtWar" },
  { key: "chess",    label: "KingSlayer" },
];

const PIE_COLORS = ["#ff6b00", "#ff9500", "#e84545", "#00b4d8", "#a855f7", "#22c55e"];
const TICK_STYLE = { fill: "rgba(255,255,255,0.45)", fontSize: 11 };
const GRID_COLOR = "rgba(255,107,0,0.08)";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(8,8,8,0.96)",
      border: "1px solid rgba(255,107,0,0.35)",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: "0.82rem",
      minWidth: "100px",
    }}>
      {label && (
        <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: "0.75rem" }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ color: entry.color || "#ff6b00", fontWeight: 700 }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}

function buildEloHistory(matchHistory, currentElo, playerId) {
  const relevant = (matchHistory || [])
    .filter(m => m.player1 === playerId || m.player2 === playerId)
    .slice(0, 20);

  if (!relevant.length) {
    return [{ label: "Actuel", elo: currentElo || 1000 }];
  }

  let elo = currentElo || 1000;
  const points = [{ label: `#${relevant.length}`, elo }];

  for (let i = 0; i < relevant.length - 1; i++) {
    const m = relevant[i];
    const won = m.winner === playerId;
    const draw = !m.winner;
    if (won) elo = Math.max(1000, elo - 20);
    else if (!draw) elo = elo + 20;
    points.unshift({ label: i === relevant.length - 2 ? "Départ" : `#${relevant.length - 1 - i}`, elo });
  }

  return points;
}

function computePerformanceBadges(overallStats, allGameStats, tr) {
  const streak = overallStats?.win_streak || 0;
  const snake = allGameStats.find(g => g.key === "snake");
  const playedCount = allGameStats.filter(g => g.games_played > 0).length;
  const allPlayed = allGameStats.length > 0 && playedCount === GAMES.length;

  return [
    {
      id: "streak5",
      icon: "🔥",
      name: tr("badgeStreak5Name"),
      desc: tr("badgeStreak5Desc"),
      earned: streak >= 5,
      progress: `${Math.min(streak, 5)}/5`,
    },
    {
      id: "expert_viper",
      icon: "🐍",
      name: tr("badgeExpertViperName"),
      desc: tr("badgeExpertViperDesc"),
      earned: (snake?.games_played || 0) >= 100,
      progress: `${Math.min(snake?.games_played || 0, 100)}/100`,
    },
    {
      id: "invincible",
      icon: "🛡️",
      name: tr("badgeInvincibleName"),
      desc: tr("badgeInvincibleDesc"),
      earned: streak >= 10,
      progress: `${Math.min(streak, 10)}/10`,
    },
    {
      id: "versatile",
      icon: "🎮",
      name: tr("badgeVersatileName"),
      desc: tr("badgeVersatileDesc"),
      earned: allPlayed,
      progress: allPlayed ? tr("badgeComplete") : `${playedCount}/${GAMES.length} jeux`,
    },
  ];
}

async function loadGameStatsFor(pid) {
  return Promise.all(
    GAMES.map(async (g) => {
      try {
        const s = await getPlayerStats(pid, g.key);
        const wins = s?.current_game_stats?.wins || 0;
        const losses = s?.current_game_stats?.losses || 0;
        return { key: g.key, label: g.label, wins, losses, elo: s?.current_game_elo || 1000, games_played: wins + losses };
      } catch {
        return { key: g.key, label: g.label, wins: 0, losses: 0, elo: 1000, games_played: 0 };
      }
    })
  );
}

export default function Stats() {
  const { playerId } = useContext(PlayerContext);
  const { tr } = useAppSettings();
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState(null);
  const [allGameStats, setAllGameStats] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);
  const [compareSearch, setCompareSearch] = useState("");
  const [compareId, setCompareId] = useState(null);
  const [compareStats, setCompareStats] = useState(null);
  const [compareGameStats, setCompareGameStats] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    async function load() {
      setLoading(true);
      try {
        const [overall, hist] = await Promise.all([getPlayerStats(playerId), getMatchHistory(playerId)]);
        const gameStats = await loadGameStatsFor(playerId);
        setOverallStats(overall);
        setMatchHistory(Array.isArray(hist) ? hist : []);
        setAllGameStats(gameStats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  useEffect(() => {
    if (tab !== "compare" || leaderboard.length > 0) return;
    getLeaderboard().then(lb => setLeaderboard(Array.isArray(lb) ? lb : [])).catch(() => {});
  }, [tab]);

  async function handleCompare(targetId) {
    setCompareId(targetId);
    setShowDropdown(false);
    setCompareLoading(true);
    try {
      const [overall, gameStats] = await Promise.all([
        getPlayerStats(targetId),
        loadGameStatsFor(targetId),
      ]);
      setCompareStats(overall);
      setCompareGameStats(gameStats);
    } catch (e) {
      console.error(e);
    } finally {
      setCompareLoading(false);
    }
  }

  if (!playerId) return <p style={{ padding: 24 }}>{tr("notConnected")}</p>;

  const eloHistory = buildEloHistory(matchHistory, overallStats?.elo, playerId);

  const radarData = GAMES.map(g => {
    const gs = allGameStats.find(s => s.key === g.key) || {};
    const total = (gs.wins || 0) + (gs.losses || 0);
    return { game: gs.label || g.label, "Win Rate": total > 0 ? Math.round((gs.wins / total) * 100) : 0 };
  });

  const barData = GAMES.map(g => {
    const gs = allGameStats.find(s => s.key === g.key) || {};
    return { game: gs.label || g.label, [tr("wins")]: gs.wins || 0, [tr("losses")]: gs.losses || 0 };
  });

  const pieData = GAMES.map(g => {
    const gs = allGameStats.find(s => s.key === g.key) || {};
    return { name: gs.label || g.label, value: gs.games_played || 0 };
  }).filter(d => d.value > 0);

  const badges = computePerformanceBadges(overallStats, allGameStats, tr);

  const radarCompareData = compareStats
    ? GAMES.map(g => {
        const myGs = allGameStats.find(s => s.key === g.key) || {};
        const theirGs = compareGameStats.find(s => s.key === g.key) || {};
        const myTotal = (myGs.wins || 0) + (myGs.losses || 0);
        const theirTotal = (theirGs.wins || 0) + (theirGs.losses || 0);
        return {
          game: g.label,
          [tr("myLabel")]: myTotal > 0 ? Math.round((myGs.wins / myTotal) * 100) : 0,
          [compareId]: theirTotal > 0 ? Math.round((theirGs.wins / theirTotal) * 100) : 0,
        };
      })
    : [];

  const filteredLeaderboard = leaderboard
    .filter(p => p.player !== playerId && (compareSearch === "" || p.player.toLowerCase().includes(compareSearch.toLowerCase())))
    .slice(0, 8);

  return (
    <div className="app-shell">
      <SessionBar />

      <style>{`
        .stats-page { max-width: 860px; margin: 0 auto; padding-bottom: 60px; }
        .stats-back { display: inline-flex; align-items: center; gap: 8px; color: var(--clr-orange); text-decoration: none; font-family: var(--font-heading); font-weight: 700; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px; opacity: 0.85; transition: opacity 0.2s; }
        .stats-back:hover { opacity: 1; }
        .stats-tabs { display: flex; gap: 4px; background: var(--clr-surface-1); border-radius: 10px; padding: 4px; margin-bottom: 28px; border: 1px solid var(--clr-border); }
        .stats-tab { flex: 1; padding: 10px; border: none; background: transparent; color: var(--clr-text-muted); font-family: var(--font-heading); font-weight: 800; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; border-radius: 7px; transition: all 0.2s; }
        .stats-tab.active { background: linear-gradient(135deg, #ff6b00, #ff9500); color: #fff; box-shadow: 0 0 16px rgba(255,107,0,0.3); }
        .stats-chart-card { background: var(--clr-surface-1); border: 1px solid rgba(255,107,0,0.12); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .stats-chart-title { font-family: var(--font-heading); font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--clr-orange); margin-bottom: 18px; }
        .stats-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        @media (max-width: 600px) { .stats-charts-grid { grid-template-columns: 1fr; } }
        .badge-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--clr-surface-2); border-radius: 10px; border: 1px solid var(--clr-border); transition: all 0.2s; }
        .badge-card.earned { border-color: rgba(255,107,0,0.45); background: rgba(255,107,0,0.07); box-shadow: 0 0 14px rgba(255,107,0,0.1); }
        .badge-card.unearned { opacity: 0.4; }
        .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .history-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); gap: 12px; flex-wrap: wrap; }
        .history-row:last-child { border-bottom: none; }
        .compare-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .compare-row:last-child { border-bottom: none; }
        .player-suggestion { padding: 9px 14px; cursor: pointer; border-radius: 8px; transition: background 0.15s; display: flex; justify-content: space-between; align-items: center; }
        .player-suggestion:hover { background: rgba(255,107,0,0.1); }
      `}</style>

      <div className="stats-page">
        <Link to="/lobby" className="stats-back">{tr("backToLobbyStats")}</Link>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "linear-gradient(135deg, #ff6b00, #ff9500)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "10px",
          }}>
            {tr("statsAdvanced")}
          </h1>
          {overallStats && (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", color: "var(--clr-text-dim)", fontSize: "0.88rem" }}>
              <span><strong style={{ color: "var(--clr-text)" }}>{overallStats.player || playerId}</strong></span>
              <span>ELO <strong style={{ color: "var(--clr-orange)" }}>{overallStats.elo}</strong></span>
              <span><strong style={{ color: "#22c55e" }}>{overallStats.wins}V</strong> / <strong style={{ color: "#e84545" }}>{overallStats.losses}D</strong></span>
              {(overallStats.win_streak || 0) > 0 && (
                <span>Streak <strong style={{ color: "#ff9500" }}>🔥{overallStats.win_streak}</strong></span>
              )}
            </div>
          )}
        </div>

        <div className="stats-tabs">
          <button className={`stats-tab${tab === "stats" ? " active" : ""}`} onClick={() => setTab("stats")}>
            {tr("myStats")}
          </button>
          <button className={`stats-tab${tab === "compare" ? " active" : ""}`} onClick={() => setTab("compare")}>
            {tr("compareTab")}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--clr-text-muted)" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: "14px" }}>📊</div>
            {tr("loadingStats")}
          </div>
        )}

        {/* ─── TAB: MES STATS ─── */}
        {!loading && tab === "stats" && (
          <>
            {/* Performance Badges */}
            <div style={{ marginBottom: "24px" }}>
              <div className="stats-chart-title">{tr("performanceBadges")}</div>
              <div className="badges-grid">
                {badges.map(badge => (
                  <div key={badge.id} className={`badge-card${badge.earned ? " earned" : " unearned"}`}>
                    <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{badge.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: badge.earned ? "var(--clr-orange)" : "var(--clr-text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {badge.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)", marginTop: "2px" }}>
                        {badge.earned ? badge.desc : badge.progress}
                      </div>
                    </div>
                    {badge.earned && (
                      <span style={{ color: "var(--clr-orange)", fontSize: "1rem", flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ELO Evolution */}
            <div className="stats-chart-card">
              <div className="stats-chart-title">{tr("eloEvolution")}</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={eloHistory} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="label" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} domain={["auto", "auto"]} width={54} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="elo"
                    name="ELO"
                    stroke="#ff6b00"
                    strokeWidth={2.5}
                    dot={{ fill: "#ff9500", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#ff6b00", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Radar + Bar grid */}
            <div className="stats-charts-grid">
              <div className="stats-chart-card" style={{ marginBottom: 0 }}>
                <div className="stats-chart-title">{tr("performanceRadar")}</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <PolarGrid stroke={GRID_COLOR} />
                    <PolarAngleAxis dataKey="game" tick={TICK_STYLE} />
                    <Radar
                      name="Win Rate %"
                      dataKey="Win Rate"
                      fill="#ff6b00"
                      fillOpacity={0.28}
                      stroke="#ff6b00"
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="stats-chart-card" style={{ marginBottom: 0 }}>
                <div className="stats-chart-title">{tr("winsVsLosses")}</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barGap={2} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis dataKey="game" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={tr("wins")} fill="#ff6b00" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    <Bar dataKey={tr("losses")} fill="#e84545" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: "8px" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart */}
            <div className="stats-chart-card">
              <div className="stats-chart-title">{tr("playTimeDistribution")}</div>
              {pieData.length === 0 ? (
                <p style={{ color: "var(--clr-text-muted)", textAlign: "center", padding: "28px 0", margin: 0 }}>
                  {tr("noGamesPlayed")}
                </p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={76}
                        innerRadius={36}
                        paddingAngle={2}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, minWidth: "140px", display: "flex", flexDirection: "column", gap: "7px" }}>
                    {pieData.map((d, i) => {
                      const total = pieData.reduce((s, x) => s + x.value, 0);
                      const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: "0.8rem", color: "var(--clr-text-dim)", flex: 1 }}>
                            {d.name}
                          </span>
                          <strong style={{ color: "var(--clr-text)", fontSize: "0.82rem" }}>{d.value}</strong>
                          <span style={{ color: "var(--clr-text-muted)", fontSize: "0.75rem", minWidth: "34px", textAlign: "right" }}>
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Match History */}
            <div className="stats-chart-card">
              <div className="stats-chart-title">{tr("last20Games")}</div>
              {matchHistory.length === 0 ? (
                <p style={{ color: "var(--clr-text-muted)", textAlign: "center", padding: "28px 0", margin: 0 }}>
                  {tr("noGamesFound")}
                </p>
              ) : (
                <div>
                  {matchHistory.slice(0, 20).map((m, i) => {
                    const opponent = m.player1 === playerId ? m.player2 : m.player1;
                    const won = m.winner === playerId;
                    const draw = !m.winner;
                    const eloChange = won ? "+20" : draw ? "±0" : "-20";
                    const eloColor = won ? "#22c55e" : draw ? "#ff9500" : "#e84545";
                    const resultLabel = won ? tr("statsVictory") : draw ? tr("statsDraw") : tr("statsDefeat");
                    const resultBadge = won ? "badge-success" : draw ? "" : "badge-error";

                    return (
                      <div key={i} className="history-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 800,
                            color: "var(--clr-orange)",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            minWidth: "68px",
                          }}>
                            {m.game?.toUpperCase() || "?"}
                          </span>
                          <span style={{ color: "var(--clr-text-dim)", fontSize: "0.82rem" }}>
                            vs <strong style={{ color: "var(--clr-text)" }}>{opponent || "—"}</strong>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: eloColor, fontWeight: 700, fontFamily: "var(--font-heading)", fontSize: "0.88rem" }}>
                            {eloChange}
                          </span>
                          <span
                            className={`badge ${resultBadge}`}
                            style={draw ? { background: "rgba(255,149,0,0.1)", color: "#ff9500", border: "1px solid rgba(255,149,0,0.3)" } : {}}
                          >
                            {resultLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── TAB: COMPARER ─── */}
        {!loading && tab === "compare" && (
          <div>
            <div className="stats-chart-card">
              <div className="stats-chart-title">{tr("compareWithPlayer")}</div>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder={tr("searchPlayer")}
                  value={compareSearch}
                  onChange={e => { setCompareSearch(e.target.value); setCompareId(null); setCompareStats(null); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  style={{ width: "100%", marginBottom: 0 }}
                />
                {showDropdown && filteredLeaderboard.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "var(--clr-surface-2)",
                    border: "1px solid rgba(255,107,0,0.25)",
                    borderRadius: 8,
                    overflow: "hidden",
                    zIndex: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}>
                    {filteredLeaderboard.map((p, i) => (
                      <div
                        key={i}
                        className="player-suggestion"
                        onMouseDown={() => { setCompareSearch(p.player); handleCompare(p.player); }}
                      >
                        <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{p.player}</span>
                        <span style={{ color: "var(--clr-orange)", fontSize: "0.8rem" }}>
                          ELO {p.display_elo ?? p.elo ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {compareSearch && !compareId && filteredLeaderboard.length === 0 && !compareLoading && (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>
                  {tr("noPlayerFoundLeaderboard")}
                </div>
              )}
            </div>

            {compareLoading && (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--clr-text-muted)" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>⏳</div>
                {tr("loadingProfile")}
              </div>
            )}

            {compareStats && !compareLoading && (
              <>
                {/* Side-by-side key stats */}
                <div className="stats-chart-card">
                  <div className="stats-chart-title">{tr("compareKeyStats")}</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center", marginBottom: "8px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,107,0,0.12)" }}>
                    <div style={{ textAlign: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", color: "#ff6b00" }}>
                      {overallStats?.player || playerId}
                    </div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, color: "var(--clr-orange)", fontSize: "1.2rem", textAlign: "center" }}>VS</div>
                    <div style={{ textAlign: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", color: "#00b4d8" }}>
                      {compareStats.player || compareId}
                    </div>
                  </div>

                  {[
                    { label: tr("globalEloLabel"), myVal: overallStats?.elo, theirVal: compareStats?.elo },
                    { label: tr("wins"), myVal: overallStats?.wins, theirVal: compareStats?.wins },
                    { label: tr("losses"), myVal: overallStats?.losses, theirVal: compareStats?.losses },
                    { label: tr("gamesPlayedLabel"), myVal: overallStats?.games_played, theirVal: compareStats?.games_played },
                    { label: tr("winStreakLabel"), myVal: overallStats?.win_streak, theirVal: compareStats?.win_streak },
                  ].map(({ label, myVal, theirVal }) => {
                    const mv = myVal ?? 0;
                    const tv = theirVal ?? 0;
                    return (
                      <div key={label} className="compare-row">
                        <div style={{
                          textAlign: "right",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900,
                          fontSize: "1.1rem",
                          color: mv > tv ? "#ff6b00" : mv === tv ? "var(--clr-text)" : "var(--clr-text-muted)",
                        }}>
                          {myVal ?? "—"}
                          {mv > tv && <span style={{ fontSize: "0.6rem", marginLeft: "4px" }}>▲</span>}
                        </div>
                        <div style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--clr-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                          {label}
                        </div>
                        <div style={{
                          textAlign: "left",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900,
                          fontSize: "1.1rem",
                          color: tv > mv ? "#00b4d8" : tv === mv ? "var(--clr-text)" : "var(--clr-text-muted)",
                        }}>
                          {theirVal ?? "—"}
                          {tv > mv && <span style={{ fontSize: "0.6rem", marginLeft: "4px" }}>▲</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Overlapping radar */}
                <div className="stats-chart-card">
                  <div className="stats-chart-title">{tr("comparativeRadar")}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "12px", fontSize: "0.78rem" }}>
                    <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#ff6b00", borderRadius: 2, marginRight: 5 }} />{overallStats?.player || tr("myLabel")}</span>
                    <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#00b4d8", borderRadius: 2, marginRight: 5 }} />{compareStats.player || compareId}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarCompareData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <PolarGrid stroke={GRID_COLOR} />
                      <PolarAngleAxis dataKey="game" tick={TICK_STYLE} />
                      <Radar
                        name={tr("myLabel")}
                        dataKey={tr("myLabel")}
                        fill="#ff6b00"
                        fillOpacity={0.22}
                        stroke="#ff6b00"
                        strokeWidth={2}
                      />
                      <Radar
                        name={compareId}
                        dataKey={compareId}
                        fill="#00b4d8"
                        fillOpacity={0.22}
                        stroke="#00b4d8"
                        strokeWidth={2}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
