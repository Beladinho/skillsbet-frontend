import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const W = 10;
const H = 20;

const SHAPES = [
  { name: "I", color: "#00cfff", cells: [[1,1,1,1]] },
  { name: "O", color: "#ffd500", cells: [[1,1],[1,1]] },
  { name: "T", color: "#a855f7", cells: [[0,1,0],[1,1,1]] },
  { name: "L", color: "#fb923c", cells: [[0,0,1],[1,1,1]] },
  { name: "J", color: "#3b82f6", cells: [[1,0,0],[1,1,1]] },
  { name: "S", color: "#22c55e", cells: [[0,1,1],[1,1,0]] },
  { name: "Z", color: "#ef4444", cells: [[1,1,0],[0,1,1]] },
];

const BASE_SPEED = { easy: 700, medium: 500, hard: 300, expert: 150 };
const SPEED_ACCEL = { easy: 0.85, medium: 0.88, hard: 0.90, expert: 0.92 };
const LINES_PER_LEVEL = 5;
const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };
const P1 = "#ff6600";

function emptyBoard() { return Array.from({ length: H }, () => Array(W).fill(null)); }
function rotate(m) { return m[0].map((_, c) => m.map(r => r[c]).reverse()); }
function randPiece() {
  const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { color: s.color, cells: s.cells, x: Math.floor(W / 2) - Math.ceil(s.cells[0].length / 2), y: 0 };
}
function collides(board, piece, dx = 0, dy = 0, cells = null) {
  const c = cells ?? piece.cells;
  for (let y = 0; y < c.length; y++)
    for (let x = 0; x < c[y].length; x++) {
      if (!c[y][x]) continue;
      const bx = piece.x + x + dx, by = piece.y + y + dy;
      if (bx < 0 || bx >= W || by >= H) return true;
      if (by >= 0 && board[by][bx]) return true;
    }
  return false;
}
function merge(board, piece) {
  const b = board.map(r => [...r]);
  for (let y = 0; y < piece.cells.length; y++)
    for (let x = 0; x < piece.cells[y].length; x++) {
      if (!piece.cells[y][x]) continue;
      const bx = piece.x + x, by = piece.y + y;
      if (by >= 0) b[by][bx] = piece.color;
    }
  return b;
}
function clearLines(board) {
  const kept = board.filter(r => r.some(c => c === null));
  const n = H - kept.length;
  return { board: [...Array.from({ length: n }, () => Array(W).fill(null)), ...kept], cleared: n };
}
function linePoints(n) { return [0, 100, 300, 500, 800][Math.min(n, 4)]; }

export default function BlockDropSoloGame({ difficulty, playerId, onExit }) {
  const [board, setBoard] = useState(emptyBoard);
  const [piece, setPiece] = useState(randPiece);
  const [next, setNext] = useState(randPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState("waiting"); // waiting | running | over
  const [best, setBest] = useState(0);

  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const phaseRef = useRef(phase);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const speed = useMemo(() => {
    const base = BASE_SPEED[difficulty] ?? 500;
    const accel = SPEED_ACCEL[difficulty] ?? 0.88;
    return Math.max(60, Math.round(base * Math.pow(accel, level - 1)));
  }, [difficulty, level]);

  const visibleBoard = useMemo(() => {
    const b = board.map(r => [...r]);
    for (let y = 0; y < piece.cells.length; y++)
      for (let x = 0; x < piece.cells[y].length; x++) {
        if (!piece.cells[y][x]) continue;
        const bx = piece.x + x, by = piece.y + y;
        if (by >= 0 && by < H && bx >= 0 && bx < W) b[by][bx] = piece.color;
      }
    return b;
  }, [board, piece]);

  // ghost piece
  const ghostPiece = useMemo(() => {
    let drop = 0;
    while (!collides(board, piece, 0, drop + 1)) drop++;
    return { ...piece, y: piece.y + drop };
  }, [board, piece]);

  const spawnNext = useCallback((b, nxt) => {
    const np = nxt;
    if (collides(b, np)) { setPhase("over"); setBest(bst => Math.max(bst, score)); return; }
    setPiece(np);
    setNext(randPiece());
  }, [score]);

  const lock = useCallback((b, p) => {
    const merged = merge(b, p);
    const { board: cleared, cleared: n } = clearLines(merged);
    if (n > 0) {
      const pts = linePoints(n);
      setScore(s => s + pts);
      setLines(l => {
        const nl = l + n;
        setLevel(Math.floor(nl / LINES_PER_LEVEL) + 1);
        return nl;
      });
    } else {
      setScore(s => s + 5);
    }
    setBoard(cleared);
    spawnNext(cleared, next);
  }, [next, spawnNext]);

  const movePiece = useCallback((dx, dy) => {
    const b = boardRef.current, p = pieceRef.current;
    if (phaseRef.current !== "running") return;
    if (!collides(b, p, dx, dy)) {
      setPiece(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    } else if (dy === 1) {
      lock(b, p);
    }
  }, [lock]);

  const rotatePiece = useCallback(() => {
    const b = boardRef.current, p = pieceRef.current;
    if (phaseRef.current !== "running") return;
    const rot = rotate(p.cells);
    if (!collides(b, p, 0, 0, rot)) setPiece(prev => ({ ...prev, cells: rot }));
    else if (!collides(b, p, 1, 0, rot)) setPiece(prev => ({ ...prev, cells: rot, x: prev.x + 1 }));
    else if (!collides(b, p, -1, 0, rot)) setPiece(prev => ({ ...prev, cells: rot, x: prev.x - 1 }));
  }, []);

  const hardDrop = useCallback(() => {
    const b = boardRef.current, p = pieceRef.current;
    if (phaseRef.current !== "running") return;
    let drop = 0;
    while (!collides(b, p, 0, drop + 1)) drop++;
    const dropped = { ...p, y: p.y + drop };
    setPiece(dropped);
    setTimeout(() => lock(b, dropped), 0);
  }, [lock]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === " ") { e.preventDefault(); if (phaseRef.current === "waiting") setPhase("running"); else hardDrop(); return; }
      if (phaseRef.current === "waiting") { setPhase("running"); }
      if (e.key === "ArrowLeft")  movePiece(-1, 0);
      if (e.key === "ArrowRight") movePiece(1, 0);
      if (e.key === "ArrowDown")  movePiece(0, 1);
      if (e.key === "ArrowUp")    rotatePiece();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [movePiece, rotatePiece, hardDrop]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => movePiece(0, 1), speed);
    return () => clearInterval(id);
  }, [phase, speed, movePiece]);

  function replay() {
    const p = randPiece();
    const n = randPiece();
    setBoard(emptyBoard());
    setPiece(p);
    setNext(n);
    setScore(0);
    setLines(0);
    setLevel(1);
    setPhase("waiting");
  }

  const CELL = 28;

  return (
    <div style={{ textAlign: "center", marginTop: "16px", fontFamily: "'Rajdhani','Arial Narrow',sans-serif", userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: P1, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          BlockDrop
        </h2>
        <span style={{ background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.4)", color: "#ff8833", padding: "3px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Solo · {DIFFICULTY_LABELS[difficulty]}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "10px" }}>
        {[["Score", score], ["Lignes", lines], ["Niveau", level], ["Record", best]].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: "0.68rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: l === "Record" ? "#f9ca24" : P1, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "inline-flex", gap: "14px", alignItems: "flex-start" }}>
        {/* Board */}
        <div style={{
          position: "relative",
          width: W * CELL, height: H * CELL,
          background: "#06101e",
          border: `2px solid ${phase === "over" ? "#c0392b" : phase === "running" ? P1 : "#2a4a6a"}`,
          borderRadius: "8px",
          boxShadow: phase === "running" ? `0 0 24px rgba(255,102,0,0.3)` : phase === "over" ? "0 0 24px rgba(192,57,43,0.4)" : "none",
          transition: "border-color 0.3s, box-shadow 0.3s",
          overflow: "hidden",
        }}>
          {/* Grid lines */}
          {Array.from({ length: H - 1 }, (_, i) => (
            <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: (i + 1) * CELL - 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
          ))}
          {Array.from({ length: W - 1 }, (_, i) => (
            <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: (i + 1) * CELL - 1, width: 1, background: "rgba(255,255,255,0.04)" }} />
          ))}

          {/* Ghost */}
          {phase === "running" && ghostPiece.cells.map((row, gy) =>
            row.map((val, gx) => {
              if (!val) return null;
              const bx = ghostPiece.x + gx, by = ghostPiece.y + gy;
              if (by < 0 || by >= H) return null;
              return (
                <div key={`g${gy}-${gx}`} style={{
                  position: "absolute", left: bx * CELL + 1, top: by * CELL + 1,
                  width: CELL - 2, height: CELL - 2,
                  border: `1px solid ${ghostPiece.color}`,
                  borderRadius: "2px", opacity: 0.22,
                }} />
              );
            })
          )}

          {/* Cells */}
          {visibleBoard.flat().map((cell, i) => {
            if (!cell) return null;
            const bx = i % W, by = Math.floor(i / W);
            return (
              <div key={i} style={{
                position: "absolute", left: bx * CELL + 1, top: by * CELL + 1,
                width: CELL - 2, height: CELL - 2,
                background: cell,
                borderRadius: "2px",
                boxShadow: `0 0 6px ${cell}88`,
              }} />
            );
          })}

          {/* Waiting overlay */}
          {phase === "waiting" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,30,0.82)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <div style={{ color: P1, fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Prêt ?</div>
              <div style={{ color: "#555", fontSize: "0.78rem" }}>← → Déplacer · ↑ Tourner · ↓ Descendre · Espace Chute</div>
              <button onClick={() => setPhase("running")} style={{ padding: "10px 28px", fontSize: "0.9rem", marginTop: "4px" }}>▶ Démarrer</button>
            </div>
          )}

          {/* Game over overlay */}
          {phase === "over" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,30,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <div style={{ color: "#c0392b", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", textShadow: "0 0 20px rgba(192,57,43,0.8)" }}>Game Over</div>
              <div style={{ color: P1, fontSize: "1.1rem", fontWeight: 700 }}>Score : {score}</div>
              {score >= best && score > 0 && <div style={{ color: "#f9ca24", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase" }}>★ Nouveau record !</div>}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button onClick={replay} style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Rejouer</button>
                <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Quitter</button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "4px" }}>
          <div style={{ background: "#0a1628", border: "1px solid rgba(255,102,0,0.3)", borderRadius: "8px", padding: "10px 14px", minWidth: "80px" }}>
            <div style={{ fontSize: "0.65rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Suivant</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${next.cells[0].length}, 18px)`, gap: "2px" }}>
              {next.cells.flat().map((v, i) => (
                <div key={i} style={{ width: 18, height: 18, background: v ? next.color : "transparent", borderRadius: "2px", boxShadow: v ? `0 0 4px ${next.color}88` : "none" }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: "0.62rem", color: "#444", lineHeight: 1.7 }}>
            <div>← → Déplacer</div>
            <div>↑ Tourner</div>
            <div>↓ Descente</div>
            <div>Espace Chute</div>
          </div>
        </div>
      </div>

      {phase !== "over" && (
        <div style={{ marginTop: "14px" }}>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      )}
    </div>
  );
}
