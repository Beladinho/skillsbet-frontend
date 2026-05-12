import { useEffect, useState } from "react";
import { completeDuelWithBotScore } from "../../utils/duelHelpers";

export default function ReflexGame({ duel, playerId, onGameFinished }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted]);

  useEffect(() => {
    if (timeLeft <= 0 && gameStarted) {
      finishGame();
    }
  }, [timeLeft, gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setTargetVisible(true);

      setTimeout(() => {
        setTargetVisible(false);
      }, 800);
    }, 1500);

    return () => clearInterval(interval);
  }, [gameStarted]);

  function startGame() {
    setGameStarted(true);
  }

  function hitTarget() {
    if (!targetVisible) return;

    setScore((s) => s + 1);
    setTargetVisible(false);
  }

  async function finishGame() {
    try {
      setSubmitting(true);

      const result = await completeDuelWithBotScore({
        duel,
        playerId,
        playerScore: score,
        botScoreGenerator: () => Math.floor(Math.random() * 10),
      });

      onGameFinished(result);
    } catch (error) {
      console.error("Erreur fin ReflexGame :", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Reflex Game</h2>

      {!gameStarted && <button onClick={startGame}>Start</button>}

      {gameStarted && (
        <>
          <p>Temps restant : {timeLeft}s</p>
          <p>Score : {score}</p>

          <div
            onClick={hitTarget}
            style={{
              width: "100px",
              height: "100px",
              margin: "30px auto",
              backgroundColor: targetVisible ? "red" : "lightgray",
              cursor: "pointer",
            }}
          />
        </>
      )}

      {submitting && <p>Envoi du résultat...</p>}
    </div>
  );
}
