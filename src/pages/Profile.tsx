import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

type Badge = {
  name: string;
  icon: string;
};

export default function Profile() {
  const { wallet } = useGame();

  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // Simule récupération depuis backend
    setLevel(5);
    setXp(1200);
    setGamesPlayed(45);
    setWins(30);
    setBadges([
      { name: "Débutant", icon: "🌱" },
      { name: "Pro du Snake", icon: "🐍" },
      { name: "Tetris Master", icon: "🧱" },
    ]);
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>👤 Profil Utilisateur</h2>

      {/* Carte profil */}
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 25,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          marginBottom: 30,
        }}
      >
        <p>
          <strong>Wallet :</strong> 💰 {wallet} €
        </p>
        <p>
          <strong>Niveau :</strong> {level} ({xp} XP)
        </p>
        <p>
          <strong>Parties jouées :</strong> {gamesPlayed}
        </p>
        <p>
          <strong>Victoires :</strong> {wins}
        </p>
      </div>

      {/* Badges */}
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 25,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h3 style={{ marginBottom: 15 }}>🏅 Badges</h3>
        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          {badges.map((b) => (
            <div
              key={b.name}
              style={{
                background: "#334155",
                borderRadius: 12,
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "default",
              }}
            >
              <span style={{ fontSize: 24 }}>{b.icon}</span>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
