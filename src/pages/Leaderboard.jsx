import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/playerAPI";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard();
      setPlayers(data);
    } catch (error) {
      console.error("Erreur chargement leaderboard :", error);
      setPlayers([]);
    }
  }

  return (
    <div>
      <h2>Leaderboard</h2>

      <table border="1" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
            <th>ELO</th>
          </tr>
        </thead>

        <tbody>
          {players.map((p, i) => (
            <tr key={p.player}>
              <td>{i + 1}</td>
              <td>{p.player}</td>
              <td>{p.wins}</td>
              <td>{p.elo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}