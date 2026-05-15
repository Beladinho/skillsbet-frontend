import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBadges, getPlayerStats } from "../api/skillsbetApi";
import { useAppSettings } from "../context/AppSettingsContext";
import { PlayerContext } from "../context/PlayerContext";
import SectionCard from "./SectionCard";

const PERF_GAMES = [
  { key: "snake", label: "Viper" },
  { key: "reflex", label: "QuickShot" },
  { key: "memory", label: "FlipMatch" },
  { key: "tetris", label: "BlockDrop" },
  { key: "checkers", label: "DraughtWar" },
  { key: "chess", label: "KingSlayer" },
];

function computePerformanceBadges(overallStats, allGameStats) {
  const streak = overallStats?.win_streak || 0;
  const snake = allGameStats.find(g => g.key === "snake");
  const playedCount = allGameStats.filter(g => g.games_played > 0).length;
  const allPlayed = allGameStats.length > 0 && playedCount === PERF_GAMES.length;

  return [
    {
      id: "streak5",
      icon: "🔥",
      name: "Série de 5 victoires",
      desc: "5 victoires consécutives",
      earned: streak >= 5,
      progress: `${Math.min(streak, 5)}/5`,
    },
    {
      id: "expert_viper",
      icon: "🐍",
      name: "Expert Viper",
      desc: "100 parties de Viper jouées",
      earned: (snake?.games_played || 0) >= 100,
      progress: `${Math.min(snake?.games_played || 0, 100)}/100`,
    },
    {
      id: "invincible",
      icon: "🛡️",
      name: "Imbattable",
      desc: "10 victoires consécutives",
      earned: streak >= 10,
      progress: `${Math.min(streak, 10)}/10`,
    },
    {
      id: "versatile",
      icon: "🎮",
      name: "Polyvalent",
      desc: "Joué à tous les jeux",
      earned: allPlayed,
      progress: allPlayed ? "✓ Complet" : `${playedCount}/${PERF_GAMES.length} jeux`,
    },
  ];
}

export default function BadgesPanel() {
  const { tr } = useAppSettings();
  const { playerId } = useContext(PlayerContext);
  const [badges, setBadges] = useState([]);
  const [perfBadges, setPerfBadges] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load();
  }, [playerId]);

  async function load() {
    try {
      const serverBadges = await getBadges();
      setBadges(serverBadges || []);
    } catch (e) {
      console.error(e);
    }

    if (!playerId) return;
    try {
      const [overall, ...gameStats] = await Promise.all([
        getPlayerStats(playerId),
        ...PERF_GAMES.map(async (g) => {
          try {
            const s = await getPlayerStats(playerId, g.key);
            const wins = s?.current_game_stats?.wins || 0;
            const losses = s?.current_game_stats?.losses || 0;
            return { key: g.key, games_played: wins + losses };
          } catch {
            return { key: g.key, games_played: 0 };
          }
        }),
      ]);
      setPerfBadges(computePerformanceBadges(overall, gameStats));
    } catch (e) {
      console.error(e);
    } finally {
      setLoaded(true);
    }
  }

  const earnedPerf = perfBadges.filter(b => b.earned);
  const unearnedPerf = perfBadges.filter(b => !b.earned);

  return (
    <SectionCard title={`🏅 ${tr ? tr("badges") : "Badges"}`} style={{ "--section-delay": "0.18s" }}>
      {/* Performance Badges */}
      {perfBadges.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{
            fontSize: "0.72rem",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--clr-text-muted)",
            marginBottom: "10px",
          }}>
            Performances
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
            {perfBadges.map(badge => (
              <div
                key={badge.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: badge.earned ? "rgba(255,107,0,0.07)" : "var(--clr-surface-2)",
                  border: `1px solid ${badge.earned ? "rgba(255,107,0,0.4)" : "var(--clr-border)"}`,
                  borderRadius: "8px",
                  opacity: badge.earned ? 1 : 0.45,
                  transition: "all 0.2s",
                  boxShadow: badge.earned ? "0 0 10px rgba(255,107,0,0.1)" : "none",
                }}
              >
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{badge.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: badge.earned ? "var(--clr-orange)" : "var(--clr-text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--clr-text-muted)", marginTop: "1px" }}>
                    {badge.earned ? badge.desc : badge.progress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Server-side badges */}
      {badges.length > 0 && (
        <div>
          <div style={{
            fontSize: "0.72rem",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--clr-text-muted)",
            marginBottom: "10px",
          }}>
            Tous les badges
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
            {badges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: badge.earned ? "rgba(255,107,0,0.07)" : "var(--clr-surface-2)",
                  border: `1px solid ${badge.earned ? "rgba(255,107,0,0.35)" : "var(--clr-border)"}`,
                  borderRadius: "8px",
                  opacity: badge.earned ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{badge.earned ? "✅" : "🔒"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: badge.earned ? "var(--clr-orange)" : "var(--clr-text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--clr-text-muted)", marginTop: "1px" }}>
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loaded && badges.length === 0 && perfBadges.every(b => !b.earned) && (
        <p style={{ color: "var(--clr-text-muted)", fontSize: "0.85rem", margin: 0 }}>
          {tr ? tr("empty") : "Aucun badge débloqué"}
        </p>
      )}

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <Link
          to="/stats"
          style={{
            fontSize: "0.78rem",
            color: "var(--clr-orange)",
            textDecoration: "none",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            opacity: 0.85,
          }}
        >
          Voir toutes mes stats →
        </Link>
      </div>
    </SectionCard>
  );
}
