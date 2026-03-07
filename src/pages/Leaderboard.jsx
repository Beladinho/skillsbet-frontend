import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function Leaderboard() {

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    apiFetch("/leaderboard").then((data) => {
      setPlayers(data.players);
    });
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>

      {players.map((p, i) => (
        <div key={i}>
          {p.name} — {p.xp} XP
        </div>
      ))}
    </div>
  );
}