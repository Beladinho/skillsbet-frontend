import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const myXp = Number(localStorage.getItem("xp")) || 100;

    // Faux joueurs IA
    const bots = [
      { name: "ShadowX", xp: 320 },
      { name: "Nova", xp: 270 },
      { name: "Blaze", xp: 190 },
      { name: "Vortex", xp: 150 },
    ];

    const allPlayers = [
      { name: "Toi 🧠", xp: myXp },
      ...bots
    ];

    // Trier par XP décroissante
    allPlayers.sort((a, b) => b.xp - a.xp);

    setPlayers(allPlayers);
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>🏆 Classement</h1>
      <ol>
        {players.map((p, i) => (
          <li key={i}>
            {p.name} — {p.xp} XP
          </li>
        ))}
      </ol>
    </div>
  );
}

