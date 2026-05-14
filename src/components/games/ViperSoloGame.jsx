import { useCallback, useEffect, useRef, useState } from "react";

const GRID = 20;
const CELL = 22;

const SPEED = { easy: 180, medium: 130, hard: 90, expert: 58 };

const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };

const INIT_SNAKE = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
const INIT_DIR   = { x: 1, y: 0 };

function randomFood(snake) {
  while (true) {
    const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) return f;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ViperSoloGame({ difficulty, playerId, onExit }) {
  const [snake,     setSnake]     = useState(INIT_SNAKE);
  const [food,      setFood]      = useState(() => randomFood(INIT_SNAKE));
  const [dir,       setDir]       = useState(INIT_DIR);
  const [score,     setScore]     = useState(0);
  const [best,      setBest]      = useState(0);
  const [phase,     setPhase]     = useState("waiting"); // waiting | running | over

  const dirRef      = useRef(INIT_DIR);
  const nextDirRef  = useRef(null);
  const snakeRef    = useRef(INIT_SNAKE);
  const foodRef     = useRef(food);
  const scoreRef    = useRef(0);
  const phaseRef    = useRef("waiting");

  // keep refs in sync
  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const endGame = useCallback(() => {
    setPhase("over");
    setBest(b => Math.max(b, scoreRef.current));
  }, []);

  // ── Keyboard input ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      const cur = dirRef.current;
      let nd = null;
      if      (e.key === "ArrowUp"    && cur.y !== 1)  nd = { x: 0, y: -1 };
      else if (e.key === "ArrowDown"  && cur.y !== -1) nd = { x: 0, y:  1 };
      else if (e.key === "ArrowLeft"  && cur.x !== 1)  nd = { x: -1, y: 0 };
      else if (e.key === "ArrowRight" && cur.x !== -1) nd = { x:  1, y: 0 };
      else if (e.key === " ") {
        if (phaseRef.current === "waiting") setPhase("running");
        return;
      }
      if (nd) {
        nextDirRef.current = nd;
        if (phaseRef.current === "waiting") setPhase("running");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Touch swipe ─────────────────────────────────────────────────────────────
  const touchStart = useRef(null);
  function onTouchStart(e) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    const cur = dirRef.current;
    let nd = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && cur.x !== -1) nd = { x: 1, y: 0 };
      else if (dx < 0 && cur.x !== 1) nd = { x: -1, y: 0 };
    } else {
      if (dy > 0 && cur.y !== -1) nd = { x: 0, y: 1 };
      else if (dy < 0 && cur.y !== 1) nd = { x: 0, y: -1 };
    }
    if (nd) {
      nextDirRef.current = nd;
      if (phaseRef.current === "waiting") setPhase("running");
    }
  }

  // ── D-pad button press ──────────────────────────────────────────────────────
  function pressDir(nd) {
    const cur = dirRef.current;
    if (nd.x === -cur.x && nd.x !== 0) return;
    if (nd.y === -cur.y && nd.y !== 0) return;
    nextDirRef.current = nd;
    if (phaseRef.current === "waiting") setPhase("running");
  }

  // ── Game loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;
    const ms = SPEED[difficulty] ?? 130;

    const id = setInterval(() => {
      if (nextDirRef.current) {
        dirRef.current = nextDirRef.current;
        setDir(nextDirRef.current);
        nextDirRef.current = null;
      }
      const cur = dirRef.current;
      const prev = snakeRef.current;
      const head = prev[0];
      const nh = { x: head.x + cur.x, y: head.y + cur.y };

      if (nh.x < 0 || nh.x >= GRID || nh.y < 0 || nh.y >= GRID ||
          prev.some(s => s.x === nh.x && s.y === nh.y)) {
        clearInterval(id);
        endGame();
        return;
      }

      const ate = nh.x === foodRef.current.x && nh.y === foodRef.current.y;
      const next = ate ? [nh, ...prev] : [nh, ...prev.slice(0, -1)];

      if (ate) {
        const ns = scoreRef.current + 10;
        scoreRef.current = ns;
        setScore(ns);
        const nf = randomFood(next);
        foodRef.current = nf;
        setFood(nf);
      }
      snakeRef.current = next;
      setSnake(next);
    }, ms);

    return () => clearInterval(id);
  }, [phase, difficulty, endGame]);

  // ── Replay ──────────────────────────────────────────────────────────────────
  function replay() {
    const s = INIT_SNAKE.map(p => ({ ...p }));
    const f = randomFood(s);
    snakeRef.current = s;
    foodRef.current  = f;
    dirRef.current   = INIT_DIR;
    scoreRef.current = 0;
    nextDirRef.current = null;
    setSnake(s);
    setFood(f);
    setDir(INIT_DIR);
    setScore(0);
    setPhase("waiting");
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const boardPx = GRID * CELL;
  const isRunning = phase === "running";

  return (
    <div
      style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif", userSelect: "none" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: "#ff6600", fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          Viper
        </h2>
        <span style={{
          background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.4)",
          color: "#ff8833", padding: "3px 10px", borderRadius: "4px",
          fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          Solo · {DIFFICULTY_LABELS[difficulty]}
        </span>
      </div>

      {/* Scores */}
      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ff6600", lineHeight: 1 }}>{score}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Meilleur</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#aaa", lineHeight: 1 }}>{best}</div>
        </div>
      </div>

      {/* Board */}
      <div style={{
        position: "relative",
        width: boardPx,
        height: boardPx,
        margin: "0 auto 12px",
        background: "#06101e",
        border: `2px solid ${isRunning ? "#ff6600" : phase === "over" ? "#c0392b" : "#2a4a6a"}`,
        borderRadius: "8px",
        boxShadow: isRunning
          ? "0 0 24px rgba(255,102,0,0.3)"
          : phase === "over" ? "0 0 24px rgba(192,57,43,0.4)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
        overflow: "hidden",
      }}>

        {/* Grid lines */}
        {Array.from({ length: GRID - 1 }, (_, i) => (
          <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: (i + 1) * CELL - 1, height: 1, background: "rgba(255,255,255,0.025)" }} />
        ))}
        {Array.from({ length: GRID - 1 }, (_, i) => (
          <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: (i + 1) * CELL - 1, width: 1, background: "rgba(255,255,255,0.025)" }} />
        ))}

        {/* Food */}
        <div style={{
          position: "absolute",
          left: food.x * CELL + 2,
          top:  food.y * CELL + 2,
          width: CELL - 4, height: CELL - 4,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ff3333, #cc0000)",
          boxShadow: "0 0 10px rgba(255,50,50,0.8), 0 0 4px rgba(255,100,100,0.6)",
          transition: "left 0.05s, top 0.05s",
        }} />

        {/* Snake */}
        {snake.map((seg, i) => {
          const isHead = i === 0;
          const t = 1 - i / snake.length;
          const r = Math.round(255 * (isHead ? 1 : 0.18 + 0.35 * t));
          const g = Math.round(isHead ? 102 : 80 + 120 * t);
          const b = Math.round(isHead ? 0 : 20);
          return (
            <div key={`${seg.x}-${seg.y}-${i}`} style={{
              position: "absolute",
              left: seg.x * CELL + 1,
              top:  seg.y * CELL + 1,
              width: CELL - 2, height: CELL - 2,
              borderRadius: isHead ? "5px" : "3px",
              background: `rgb(${r},${g},${b})`,
              boxShadow: isHead ? "0 0 12px rgba(255,102,0,0.7)" : "none",
              zIndex: isHead ? 2 : 1,
            }} />
          );
        })}

        {/* Overlays */}
        {phase === "waiting" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(6,16,30,0.78)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
          }}>
            <div style={{ color: "#ff6600", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Prêt ?
            </div>
            <div style={{ color: "#555", fontSize: "0.8rem" }}>
              Flèches clavier ou D-pad
            </div>
            <button onClick={() => setPhase("running")} style={{ padding: "10px 28px", fontSize: "0.9rem", marginTop: "4px" }}>
              ▶ Démarrer
            </button>
          </div>
        )}

        {phase === "over" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(6,16,30,0.82)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
          }}>
            <div style={{ color: "#c0392b", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", textShadow: "0 0 20px rgba(192,57,43,0.8)" }}>
              Game Over
            </div>
            <div style={{ color: "#ff6600", fontSize: "1.1rem", fontWeight: 700 }}>
              Score : {score}
            </div>
            {score >= best && score > 0 && (
              <div style={{ color: "#f9ca24", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ★ Nouveau record !
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <button onClick={replay} style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Rejouer</button>
              <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Quitter</button>
            </div>
          </div>
        )}
      </div>

      {/* D-pad */}
      <div style={{ display: "inline-grid", gridTemplateColumns: "48px 48px 48px", gridTemplateRows: "48px 48px 48px", gap: "4px", marginBottom: "14px" }}>
        {[
          [null,         { x: 0, y: -1 }, null        ],
          [{ x: -1, y: 0 }, null,         { x: 1, y: 0 }],
          [null,         { x: 0, y: 1 },  null        ],
        ].flat().map((d, i) => d ? (
          <button
            key={i}
            onMouseDown={() => pressDir(d)}
            onTouchStart={e => { e.preventDefault(); pressDir(d); }}
            style={{
              width: 48, height: 48, padding: 0,
              background: "rgba(255,102,0,0.1)",
              border: "1px solid rgba(255,102,0,0.3)",
              borderRadius: "6px", cursor: "pointer",
              fontSize: "1.3rem", color: "#ff6600",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,102,0,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,102,0,0.1)"; }}
          >
            {d.y === -1 ? "▲" : d.y === 1 ? "▼" : d.x === -1 ? "◄" : "►"}
          </button>
        ) : (
          <div key={i} style={{ width: 48, height: 48 }} />
        ))}
      </div>

      {/* Quit link */}
      {phase !== "over" && (
        <div>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>
            ← Quitter
          </button>
        </div>
      )}
    </div>
  );
}
