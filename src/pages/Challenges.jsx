import { useState } from "react";

export default function Challenges() {
  const [skill, setSkill] = useState("");
  const [betXp, setBetXp] = useState(10);
  const [opponent, setOpponent] = useState("");
  const [challenges, setChallenges] = useState([]);

  function createChallenge() {
    if (!skill || !opponent) return alert("Remplis tous les champs");

    const newChallenge = {
      skill,
      betXp,
      opponent,
      status: "En attente",
      result: null
    };

    setChallenges([...challenges, newChallenge]);
    setSkill("");
    setBetXp(10);
    setOpponent("");
  }

  function fight(index) {
    const updated = [...challenges];
    const challenge = updated[index];

    const playerWins = Math.random() > 0.5;

    challenge.status = "Terminé";
    challenge.result = playerWins ? "Victoire 🎉" : "Défaite 💀";

    let xp = Number(localStorage.getItem("xp")) || 100;

    if (playerWins) xp += challenge.betXp;
    else xp = Math.max(0, xp - challenge.betXp);

    localStorage.setItem("xp", xp);

    setChallenges(updated);

    // 🔥 Notifie le Dashboard
    window.dispatchEvent(new Event("xpUpdate"));
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>⚔️ Défis</h1>

      <h3>Créer un défi</h3>

      <input
        placeholder="Compétence"
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
            {c.status === "En attente" && (
              <button onClick={() => fight(i)}>⚔️ Combattre</button>
            )}
            {c.result && <strong> → {c.result}</strong>}
          </li>
        ))}
      </ul>
    </div>
  );
}
