import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getPlayerStats } from "../api/playerStatsAPI";

export default function PlayerStats() {
  const { playerId } = useContext(PlayerContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    loadStats();
  }, [playerId]);

  async function loadStats() {
    try {
      const data = await getPlayerStats(playerId);
      setStats(data);
    } catch (error) {
      console.error("Erreur chargement player stats :", error);
      setStats(null);
    }
  }

  if (!playerId) {
    return <p>Aucun joueur connecté</p>;
  }

  if (!stats) {
    return <p>Chargement...</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Player Stats</h2>

      <table border="1" style={{ margin: "auto" }}>
        <tbody>
          <tr>
            <td>Player</td>
            <td>{stats.player}</td>
          </tr>

          <tr>
            <td>ELO</td>
            <td>{stats.elo}</td>
          </tr>

          <tr>
            <td>Wins</td>
            <td>{stats.wins}</td>
          </tr>

          <tr>
            <td>Losses</td>
            <td>{stats.losses}</td>
          </tr>

          <tr>
            <td>Total Matches</td>
            <td>{stats.games_played}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}