import { useEffect, useRef, useState } from "react";

const CONFIG = {
  easy:   { duration: 30, interval: 2000, visible: 1200 },
  medium: { duration: 20, interval: 1500, visible:  800 },
  hard:   { duration: 15, interval: 1100, visible:  600 },
  expert: { duration: 10, interval:  800, visible:  400 },
};

const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };

export default function QuickShotSoloGame({ difficulty = "medium", onExit }) {
  const cfg = CONFIG[difficulty] ?? CONFIG.medium;

  const [phase, setPhase] = useState("waiting"); // waiting | running | over
  const [timeLeft, setTimeLeft] = useState(cfg.duration);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [targetPos, setTargetPos] = useState(null);
  const [missed, setMissed] = useState(0);

  const scoreRef = useRef(0);
  const phaseRef = useRef("waiting");

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Countdown
  useEffect(() => {
    if (phase !== "running") return;
    if (timeLeft <= 0) {
      setPhase("over");
      setBest(b => Math.max(b, scoreRef.current));
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Target spawner
  useEffect(() => {
    if (phase !== "running") return;

    const spawn = setInterval(() => {
      if (phaseRef.current !== "running") return;
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      setTargetPos({ x, y });

      setTimeout(() => {
        setTargetPos(cur => {
          if (cur) setMissed(m => m + 1);
          return null;
        });
      }, cfg.visible);
    }, cfg.interval);

    return () => clearInterval(spawn);
  }, [phase, cfg.interval, cfg.visible]);

  function startGame() {
    setPhase("running");
    setTimeLeft(cfg.duration);
    setScore(0);
    setMissed(0);
    setTargetPos(null);
  }

  function hitTarget() {
    setScore(s => s + 1);
    setTargetPos(null);
  }

  const accuracy = (score + missed) > 0 ? Math.round((score / (score + missed)) * 100) : 0;

  return (
    <div style={{ height: "100vh", background: "var(--clr-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--clr-accent)", margin: 0 }}>
        QuickShot
      </h2>
      <div style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {DIFFICULTY_LABELS[difficulty]}
      </div>

      {phase === "waiting" && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <p style={{ color: "var(--clr-text-dim)", maxWidth: 320, textAlign: "center", margin: 0, fontSize: "0.95rem" }}>
            Clique sur les cibles dès qu'elles apparaissent !<br />
            Durée : {cfg.duration}s
          </p>
          {best > 0 && (
            <p style={{ color: "var(--clr-orange)", fontWeight: 700, margin: 0 }}>Meilleur : {best} cibles</p>
          )}
          <button onClick={startGame} style={{ marginTop: 8 }}>Jouer</button>
          <button className="btn-ghost" onClick={onExit} style={{ fontSize: "0.85rem" }}>Quitter</button>
        </div>
      )}

      {phase === "running" && (
        <div style={{ position: "relative", width: "min(90vw, 500px)", height: "min(90vw, 500px)", background: "var(--clr-surface-2)", borderRadius: 8, border: "1px solid var(--clr-border)", overflow: "hidden", cursor: "crosshair" }}
          onClick={() => { if (targetPos) return; setMissed(m => m + 1); }}
        >
          <div style={{ position: "absolute", top: 8, left: 8, fontFamily: "var(--font-heading)", color: "var(--clr-text)", fontSize: "0.9rem", userSelect: "none" }}>
            Score : <strong style={{ color: "var(--clr-accent)" }}>{score}</strong>
          </div>
          <div style={{ position: "absolute", top: 8, right: 8, fontFamily: "var(--font-heading)", color: "var(--clr-text)", fontSize: "0.9rem", userSelect: "none" }}>
            {timeLeft}s
          </div>

          {targetPos && (
            <div
              onClick={(e) => { e.stopPropagation(); hitTarget(); }}
              style={{
                position: "absolute",
                left: `${targetPos.x}%`,
                top: `${targetPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: difficulty === "expert" ? 36 : difficulty === "hard" ? 44 : 54,
                height: difficulty === "expert" ? 36 : difficulty === "hard" ? 44 : 54,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #ff4d4d, #cc0000)",
                boxShadow: "0 0 12px rgba(255, 77, 77, 0.7)",
                cursor: "pointer",
                animation: "pulseTarget 0.2s ease-out",
              }}
            />
          )}
        </div>
      )}

      {phase === "over" && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--clr-text)", margin: 0 }}>
            Résultat
          </p>
          <div style={{ display: "flex", gap: 32, marginBottom: 8 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--clr-accent)", fontFamily: "var(--font-heading)" }}>{score}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--clr-text-dim)", textTransform: "uppercase" }}>Cibles touchées</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--clr-orange)", fontFamily: "var(--font-heading)" }}>{accuracy}%</div>
              <div style={{ fontSize: "0.78rem", color: "var(--clr-text-dim)", textTransform: "uppercase" }}>Précision</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#FFD700", fontFamily: "var(--font-heading)" }}>{best}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--clr-text-dim)", textTransform: "uppercase" }}>Record</div>
            </div>
          </div>
          <button onClick={startGame}>Rejouer</button>
          <button className="btn-ghost" onClick={onExit} style={{ fontSize: "0.85rem" }}>Quitter</button>
        </div>
      )}

      <style>{`
        @keyframes pulseTarget {
          from { transform: translate(-50%, -50%) scale(0.6); opacity: 0.5; }
          to   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
