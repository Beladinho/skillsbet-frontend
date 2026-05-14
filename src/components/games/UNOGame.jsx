import { useState } from "react";
import { submitResult } from "../../api/skillsbetApi";

const COLORS = ["red", "blue", "green", "yellow"];

export default function UNOGame({ duel, playerId, onGameFinished }) {
  const [card] = useState(COLORS[Math.floor(Math.random() * 4)]);
  const [status, setStatus] = useState("playing");

  async function play(color) {
    const isWin = color === card;
    setStatus(isWin ? "win" : "lose");

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
      <h2>ColorBlitz</h2>
      <p>
        {duel.player1} vs {duel.player2}
      </p>

      {status === "playing" && (
        <>
          <p>Choisissez une couleur :</p>
          {COLORS.map((c) => (
            <button key={c} onClick={() => play(c)} style={{ margin: 4 }}>
              {c}
            </button>
          ))}
        </>
      )}

      {status === "win" && <h3>Victoire !</h3>}
      {status === "lose" && <h3>Défaite</h3>}
    </div>
  );
}
