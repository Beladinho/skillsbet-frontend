import { useEffect, useRef, useState } from "react";

type Props = {
  bet: number;
  onExit: () => void;
};

export default function ReflexGame({ bet, onExit }: Props) {
  const [status, setStatus] = useState<
    "idle" | "waiting" | "ready" | "clicked" | "tooSoon"
  >("idle");

  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  function startGame() {
    setStatus("waiting");
    setReactionTime(null);

    const delay = Math.floor(Math.random() * 3000) + 2000;

    timeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = Date.now();
      setStatus("ready");
    }, delay);
  }

  function handleClick() {
    if (status === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("tooSoon");
      return;
    }

    if (status === "ready") {
      const time = Date.now() - (startTimeRef.current || 0);
      setReactionTime(time);
      setStatus("clicked");
    }
  }

  function reset() {
    setStatus("idle");
    setReactionTime(null);
  }

  const isWin = reactionTime !== null && reactionTime < 350;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>⚡ Reflex</h2>
      <p>Mise : <strong>{bet} €</strong></p>

      <div
        onClick={handleClick}
        style={{
          width: 300,
          height: 200,
          margin: "20px auto",
          background:
            status === "ready"
              ? "#22c55e"
              : status === "tooSoon"
              ? "#ef4444"
              : "#334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 20,
          borderRadius: 12,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {status === "idle" && "Clique sur Démarrer"}
        {status === "waiting" && "Attends le vert..."}
        {status === "ready" && "CLIQUE !"}
        {status === "tooSoon" && "❌ Trop tôt"}
        {status === "clicked" && "Terminé"}
      </div>

      {status === "idle" && (
        <button onClick={startGame}>Démarrer</button>
      )}

      {status === "clicked" && reactionTime !== null && (
        <>
          <p>Temps de réaction : <strong>{reactionTime} ms</strong></p>

          {isWin ? (
            <>
              <h3 style={{ color: "green" }}>🎉 Victoire</h3>
              <p>Gain : {bet * 2} €</p>
            </>
          ) : (
            <h3 style={{ color: "red" }}>❌ Trop lent</h3>
          )}

          <button onClick={reset}>Rejouer</button>{" "}
          <button onClick={onExit}>Retour</button>
        </>
      )}

      {status === "tooSoon" && (
        <>
          <button onClick={reset}>Rejouer</button>{" "}
          <button onClick={onExit}>Retour</button>
        </>
      )}
    </div>
  );
}
