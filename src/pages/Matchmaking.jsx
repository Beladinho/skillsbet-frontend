import { useState } from "react";
import { api } from "../api";

export default function Matchmaking() {
  const [status, setStatus] = useState("idle");
  const [elo, setElo] = useState(null);

  const userId = "demo";

  const searchMatch = async () => {
    setStatus("searching");

    const res = await api.joinQueue(userId);

    if (res.match) {
      setStatus("match found: " + res.match.duel_id);
    } else {
      setStatus("waiting for opponent...");
    }
  };

  const loadElo = async () => {
    const res = await api.getElo(userId);
    setElo(res.elo);
  };

  return (
    <div>
      <h2>🎯 Matchmaking</h2>

      <button onClick={searchMatch}>
        Trouver un duel
      </button>

      <button onClick={loadElo}>
        Voir mon ELO
      </button>

      <p>Status: {status}</p>
      <p>ELO: {elo}</p>
    </div>
  );
}
