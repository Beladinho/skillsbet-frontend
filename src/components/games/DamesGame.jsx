import { useState } from "react";
import { submitResult } from "../../api/skillsbetApi";

export default function DamesGame({ duel, playerId, onGameFinished }) {
  const [status, setStatus] = useState("playing");

  async function handleResult(outcome) {
    setStatus(outcome);

    const isWin = outcome === "win";
    const opponent = duel.player1 === playerId ? duel.player2 : duel.player1;

    try {
      const result = await submitResult({
        duelId: duel.duel_id,
        winnerId: isWin ? playerId : opponent,
        loserId: isWin ? opponent : playerId,
      });
      onGameFinished(result);
    } catch (err) {
      console.error("submitResult error:", err);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>DraughtWar</h2>
      <p>
        {duel.player1} vs {duel.player2}
      </p>

      {status === "playing" && (
        <>
          <button onClick={() => handleResult("win")}>Simuler victoire</button>
          <button onClick={() => handleResult("lose")} style={{ marginLeft: 8 }}>
            Simuler défaite
          </button>
        </>
      )}

      {status === "win" && <h3>Victoire !</h3>}
      {status === "lose" && <h3>Défaite</h3>}
    </div>
  );
}
