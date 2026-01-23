import { useState, useEffect } from "react";

// Exemple de données temporaires
type Player = {
  rank: number;
  name: string;
  score: number;
};

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Ici on simule la récupération depuis le backend
    const data: Player[] = [
      { rank: 1, name: "Alice", score: 1200 },
      { rank: 2, name: "Bob", score: 950 },
      { rank: 3, name: "Charlie", score: 870 },
      { rank: 4, name: "David", score: 650 },
      { rank: 5, name: "Eve", score: 500 },
    ];
    setPlayers(data);
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2 style={{ marginBottom: 30 }}>🏆 Classement des joueurs</h2>

      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #334155" }}>
              <th style={{ textAlign: "left", padding: 12 }}>#</th>
              <th style={{ textAlign: "left", padding: 12 }}>Nom</th>
              <th style={{ textAlign: "left", padding: 12 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr
                key={p.rank}
                style={{
                  borderBottom: "1px solid #1e293b",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "#1e293b")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "transparent")
                }
              >
                <td style={{ padding: 12 }}>{p.rank}</td>
                <td style={{ padding: 12 }}>{p.name}</td>
                <td style={{ padding: 12 }}>{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
