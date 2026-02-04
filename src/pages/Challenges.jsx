import { useState } from "react";

export default function Challenges() {
  const [skill, setSkill] = useState("");
  const [betXp, setBetXp] = useState(10);
  const [opponent, setOpponent] = useState("");
  const [challenges, setChallenges] = useState([]);

  function createChallenge() {
    const newChallenge = {
      skill,
      betXp,
      opponent,
      status: "En attente"
    };

    setChallenges([...challenges, newChallenge]);

    setSkill("");
    setBetXp(10);
    setOpponent("");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>⚔️ Défis</h1>

      <h3>Créer un défi</h3>

      <input
        placeholder="Compétence utilisée"
        value={skill}
        onChange={e => setSkill(e.target.value)}
      />

      <input
        type="number"
        value={betXp}
        onChange={e => setBetXp(Number(e.target.value))}
      />

      <input
        placeholder="Adversaire"
        value={opponent}
        onChange={e => setOpponent(e.target.value)}
      />

      <button onClick={createChallenge}>Lancer le défi</button>

      <h3>📜 Défis en cours</h3>
      <ul>
        {challenges.map((c, i) => (
          <li key={i}>
            {c.skill} vs {c.opponent} — Mise: {c.betXp} XP — {c.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
