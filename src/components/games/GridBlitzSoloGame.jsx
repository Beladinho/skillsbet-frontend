import { useCallback, useEffect, useRef, useState } from "react";

const TARGETS = { easy: 256, medium: 512, hard: 1024, expert: 2048 };
const DIFF_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };
const SIZE = 4;

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(board) {
  const empty = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map(row => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideRowLeft(row) {
  const nums = row.filter(v => v);
  let gained = 0;
  const merged = [];
  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      merged.push(nums[i] * 2);
      gained += nums[i] * 2;
      i += 2;
    } else {
      merged.push(nums[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}

function rotateCW(board) {
  return board[0].map((_, c) => board.map(row => row[c]).reverse());
}

function moveBoard(board, dir) {
  // dir: 0=left, 1=down, 2=right, 3=up
  let b = board.map(row => [...row]);
  for (let k = 0; k < dir; k++) b = rotateCW(b);
  let totalGained = 0;
  const moved = b.map(row => {
    const { row: r, gained } = slideRowLeft(row);
    totalGained += gained;
    return r;
  });
  let result = moved;
  for (let k = 0; k < (4 - dir) % 4; k++) result = rotateCW(result);
  return { board: result, gained: totalGained };
}

function boardsEqual(a, b) {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]));
}

function maxTile(board) {
  return Math.max(...board.flat());
}

function hasValidMoves(board) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
    }
  return false;
}

const TILE_STYLES = {
  0:    { bg: 'var(--clr-surface-3)', color: 'transparent' },
  2:    { bg: '#1e1e1e', color: '#e0e0e0' },
  4:    { bg: '#2a2000', color: '#FFD700' },
  8:    { bg: '#4d1a00', color: '#fff' },
  16:   { bg: '#7a2900', color: '#fff' },
  32:   { bg: '#a63500', color: '#fff' },
  64:   { bg: '#cc4400', color: '#fff' },
  128:  { bg: 'var(--clr-orange)', color: '#fff' },
  256:  { bg: 'var(--clr-orange-bright, #FF8C40)', color: '#fff' },
  512:  { bg: '#00b4d8', color: '#fff' },
  1024: { bg: '#0077b6', color: '#fff' },
  2048: { bg: '#FFD700', color: '#1a1400' },
};

function getTileStyle(v) {
  return TILE_STYLES[v] ?? { bg: '#7b2fbe', color: '#fff' };
}

export default function GridBlitzSoloGame({ difficulty, onExit }) {
  const target = TARGETS[difficulty] ?? TARGETS.medium;
  const [board, setBoard] = useState(() => addRandomTile(addRandomTile(emptyBoard())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState("playing");
  const touchStart = useRef(null);

  const applyMove = useCallback((dir) => {
    if (status !== "playing") return;
    setBoard(prev => {
      const { board: moved, gained } = moveBoard(prev, dir);
      if (boardsEqual(prev, moved)) return prev;
      const withNew = addRandomTile(moved);
      setScore(s => {
        const next = s + gained;
        setBest(b => Math.max(b, next));
        return next;
      });
      const top = maxTile(withNew);
      if (top >= target) setStatus("won");
      else if (!hasValidMoves(withNew)) setStatus("lost");
      return withNew;
    });
  }, [status, target]);

  useEffect(() => {
    const KEY_DIR = { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, ArrowUp: 3 };
    function onKey(e) {
      const dir = KEY_DIR[e.key];
      if (dir !== undefined) { e.preventDefault(); applyMove(dir); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyMove]);

  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > Math.abs(dy)) applyMove(dx > 0 ? 2 : 0);
    else applyMove(dy > 0 ? 1 : 3);
  }

  function restart() {
    setBoard(addRandomTile(addRandomTile(emptyBoard())));
    setScore(0);
    setStatus("playing");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", minHeight: "60vh" }}>
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 32, color: "var(--clr-orange)", letterSpacing: 3, textTransform: "uppercase" }}>
            GridBlitz
          </h2>
          <button className="btn-ghost btn-sm" onClick={onExit}>← Retour</button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {[
            { label: "SCORE", value: score },
            { label: "MEILLEUR", value: best },
            { label: "OBJECTIF", value: target },
            { label: "NIVEAU", value: DIFF_LABELS[difficulty] },
          ].map(({ label, value }) => (
            <div key={label} className="stat-box" style={{ flex: 1, textAlign: "center", padding: "10px 8px" }}>
              <div style={{ fontSize: 9, color: "var(--clr-text-muted)", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", color: "var(--clr-orange)", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {status !== "playing" && (
        <div style={{
          marginBottom: 16,
          padding: "16px 24px",
          background: status === "won" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid var(--clr-${status === "won" ? "success" : "error"})`,
          borderRadius: "var(--radius-lg)",
          textAlign: "center",
          maxWidth: 480,
          width: "100%",
        }}>
          <div style={{
            fontSize: 24,
            fontFamily: "var(--font-heading)",
            color: `var(--clr-${status === "won" ? "success" : "error"})`,
            letterSpacing: 2,
            marginBottom: 8,
          }}>
            {status === "won" ? "VICTOIRE !" : "GAME OVER"}
          </div>
          <div style={{ color: "var(--clr-text-dim)", marginBottom: 14, fontSize: 14 }}>
            {status === "won"
              ? `Tuile ${target} atteinte ! Score : ${score}`
              : `Plus de mouvements possibles. Score : ${score}`}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn-ghost btn-sm" onClick={restart}>Rejouer</button>
            <button className="btn-ghost btn-sm" onClick={onExit}>Quitter</button>
          </div>
        </div>
      )}

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: 8,
          padding: 12,
          background: "var(--clr-surface-2)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--clr-border)",
          width: "min(480px, 95vw)",
          touchAction: "none",
        }}
      >
        {board.flat().map((v, i) => {
          const { bg, color } = getTileStyle(v);
          const fontSize = v >= 1000 ? 18 : v >= 100 ? 22 : v >= 10 ? 26 : 30;
          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                color,
                fontFamily: "var(--font-heading)",
                fontSize,
                fontWeight: 900,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--clr-border)",
                transition: "background var(--transition-fast)",
                boxShadow: v >= 128 ? `0 0 10px ${bg}66` : "none",
                userSelect: "none",
              }}
            >
              {v || ""}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 14, color: "var(--clr-text-muted)", fontSize: 12, letterSpacing: 1 }}>
        FLÈCHES DIRECTIONNELLES · SWIPE SUR MOBILE
      </p>
    </div>
  );
}
