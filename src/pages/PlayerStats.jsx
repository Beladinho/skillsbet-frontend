import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getPlayerStats } from "../api/playerStatsAPI";

function XpNotification({ xpGained, levelUp, newLevel }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  if (levelUp) {
    return (
      <div style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 9999,
        background: "linear-gradient(135deg, #ff6b00, #ff9500)",
        color: "#fff",
        fontFamily: "var(--font-heading)",
        fontWeight: 900,
        fontSize: "1.2rem",
        padding: "14px 24px",
        borderRadius: 8,
        boxShadow: "0 0 32px rgba(255,107,0,0.7)",
        animation: "xpPopUp 2.8s ease forwards",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        NIVEAU {newLevel} !
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 80,
      right: 24,
      zIndex: 9999,
      background: "rgba(255,107,0,0.9)",
      color: "#fff",
      fontFamily: "var(--font-heading)",
      fontWeight: 700,
      fontSize: "1rem",
      padding: "10px 20px",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(255,107,0,0.4)",
      animation: "xpPopUp 2.8s ease forwards",
      letterSpacing: "0.06em",
    }}>
      +{xpGained} XP
    </div>
  );
}

export default function PlayerStats() {
  const { playerId, playerLevel, setPlayerLevel, playerXp, setPlayerXp } = useContext(PlayerContext);
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState(null);
  const prevXpRef = useRef(null);
  const prevLevelRef = useRef(null);

  useEffect(() => {
    if (!playerId) return;
    loadStats();
  }, [playerId]);

  async function loadStats() {
    try {
      const data = await getPlayerStats(playerId);
      setStats(data);

      const newXp = data.xp ?? 0;
      const newLevel = data.level ?? 1;

      if (prevXpRef.current !== null && newXp > prevXpRef.current) {
        const gained = newXp - prevXpRef.current;
        const didLevelUp = newLevel > (prevLevelRef.current ?? 1);
        setNotification({ xpGained: gained, levelUp: didLevelUp, newLevel });
        setTimeout(() => setNotification(null), 3000);
      }

      prevXpRef.current = newXp;
      prevLevelRef.current = newLevel;

      setPlayerXp(newXp);
      setPlayerLevel(newLevel);
    } catch (error) {
      console.error("Erreur chargement player stats :", error);
      setStats(null);
    }
  }

  if (!playerId) return <p>Aucun joueur connecté</p>;
  if (!stats) return <p>Chargement...</p>;

  const xp = stats.xp ?? 0;
  const level = stats.level ?? 1;
  const xpToNext = stats.xp_to_next_level ?? 100;
  const xpForThisLevel = (level - 1) ** 2 * 100;
  const xpTotalNeeded = level ** 2 * 100 - xpForThisLevel;
  const xpProgress = xp - xpForThisLevel;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpProgress / xpTotalNeeded) * 100)));

  return (
    <div style={{ marginTop: "20px" }}>
      <style>{`
        @keyframes xpPopUp {
          0%   { opacity: 0; transform: translateY(10px) scale(0.9); }
          15%  { opacity: 1; transform: translateY(0) scale(1); }
          75%  { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-16px) scale(0.95); }
        }
        @keyframes xpBarFill {
          from { width: 0%; }
        }
        .xp-bar-fill {
          animation: xpBarFill 0.8s ease-out forwards;
        }
      `}</style>

      {notification && (
        <XpNotification
          key={notification.xpGained + "-" + notification.newLevel}
          xpGained={notification.xpGained}
          levelUp={notification.levelUp}
          newLevel={notification.newLevel}
        />
      )}

      <h2>Player Stats</h2>

      {/* Level badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          background: "linear-gradient(135deg, #ff6b00, #ff9500)",
          color: "#fff",
          fontFamily: "var(--font-heading)",
          fontWeight: 900,
          fontSize: "1rem",
          padding: "6px 16px",
          borderRadius: 6,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          boxShadow: "0 0 12px rgba(255,107,0,0.4)",
        }}>
          NIVEAU {level}
        </div>
        <span style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem" }}>
          {xp} / {xp + xpToNext} XP
        </span>
      </div>

      {/* XP progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          background: "var(--clr-surface-2)",
          borderRadius: 8,
          height: 12,
          overflow: "hidden",
          position: "relative",
        }}>
          <div
            className="xp-bar-fill"
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ff6b00, #ff9500)",
              borderRadius: 8,
              boxShadow: "0 0 8px rgba(255,107,0,0.5)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: "0.75rem",
          color: "var(--clr-text-dim)",
        }}>
          <span>Niveau {level}</span>
          <span>{progressPercent}%</span>
          <span>Niveau {level + 1}</span>
        </div>
      </div>

      <table border="1" style={{ margin: "auto" }}>
        <tbody>
          <tr><td>Player</td><td>{stats.player}</td></tr>
          <tr><td>ELO</td><td>{stats.elo}</td></tr>
          <tr><td>Wins</td><td>{stats.wins}</td></tr>
          <tr><td>Losses</td><td>{stats.losses}</td></tr>
          <tr><td>Total Matches</td><td>{stats.games_played}</td></tr>
          <tr><td>XP Total</td><td>{xp}</td></tr>
          <tr><td>XP requis (prochain)</td><td>{xpToNext}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
