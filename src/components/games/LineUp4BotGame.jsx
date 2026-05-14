import { useState, useEffect, useCallback, useRef } from "react";
import { useParticles } from "./ParticleEffect";

const COLS = 7;
const ROWS = 6;
const WIN_COUNT = 4;
const EMPTY = null;
const P1 = "p1";
const P2 = "p2";

const P1_COLOR = "#ff6600";
const P2_COLOR = "#00b4d8";

const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };
const BOT_DELAY = { easy: 300, medium: 450, hard: 700, expert: 700 };

function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
}

function dropPiece(board, col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = player;
      return { newBoard, row };
    }
  }
  return null;
}

function checkWin(board, row, col, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }
    if (count >= WIN_COUNT) return true;
  }
  return false;
}

function findWinningCells(board, row, col, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    const cells = [{ row, col }];
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }
    if (cells.length >= WIN_COUNT) return cells;
  }
  return [];
}

function isBoardFull(board) {
  return board[0].every(c => c !== EMPTY);
}

function getValidCols(board) {
  return Array.from({ length: COLS }, (_, i) => i).filter(c => board[0][c] === EMPTY);
}

function evalWindow(win, player) {
  const opp = player === P2 ? P1 : P2;
  const pc = win.filter(c => c === player).length;
  const ec = win.filter(c => c === EMPTY).length;
  const oc = win.filter(c => c === opp).length;
  if (pc === 4) return 100;
  if (pc === 3 && ec === 1) return 5;
  if (pc === 2 && ec === 2) return 2;
  if (oc === 3 && ec === 1) return -4;
  return 0;
}

function scoreBoard(board) {
  let score = 0;
  const center = Math.floor(COLS / 2);
  score += board.map(r => r[center]).filter(c => c === P2).length * 3;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += evalWindow(board[r].slice(c, c + 4), P2);
  for (let c = 0; c < COLS; c++) {
    const col = board.map(r => r[c]);
    for (let r = 0; r <= ROWS - 4; r++)
      score += evalWindow(col.slice(r, r + 4), P2);
  }
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += evalWindow([board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]], P2);
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += evalWindow([board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]], P2);
  return score;
}

function minimax(board, depth, alpha, beta, maximizing) {
  const validCols = getValidCols(board);
  if (validCols.length === 0) return { score: 0 };
  if (depth === 0) return { score: scoreBoard(board) };
  const player = maximizing ? P2 : P1;
  let best = { score: maximizing ? -Infinity : Infinity, col: validCols[0] };
  for (const col of validCols) {
    const res = dropPiece(board, col, player);
    if (!res) continue;
    if (checkWin(res.newBoard, res.row, col, player)) return { score: maximizing ? 1000000 + depth : -1000000 - depth, col };
    const child = minimax(res.newBoard, depth - 1, alpha, beta, !maximizing);
    if (maximizing ? child.score > best.score : child.score < best.score) best = { score: child.score, col };
    if (maximizing) alpha = Math.max(alpha, best.score);
    else beta = Math.min(beta, best.score);
    if (alpha >= beta) break;
  }
  return best;
}

function getBotMove(board, difficulty) {
  const validCols = getValidCols(board);
  if (!validCols.length) return null;
  if (difficulty === "easy") return validCols[Math.floor(Math.random() * validCols.length)];
  for (const col of validCols) {
    const res = dropPiece(board, col, P2);
    if (res && checkWin(res.newBoard, res.row, col, P2)) return col;
  }
  for (const col of validCols) {
    const res = dropPiece(board, col, P1);
    if (res && checkWin(res.newBoard, res.row, col, P1)) return col;
  }
  if (difficulty === "medium") return validCols[Math.floor(Math.random() * validCols.length)];
  const depth = difficulty === "expert" ? 7 : 5;
  try {
    const { col } = minimax(board, depth, -Infinity, Infinity, true);
    return col ?? validCols[Math.floor(Math.random() * validCols.length)];
  } catch {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }
}

export default function LineUp4BotGame({ difficulty, playerId, onExit }) {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(P1);
  const [winner, setWinner] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [dynamicMode, setDynamicMode] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const dmRef = useRef(false);
  dmRef.current = dynamicMode;

  const { triggerAt, ParticleLayer } = useParticles();

  function isWinningCell(r, c) {
    return winningCells.some(w => w.row === r && w.col === c);
  }

  function fireWinEffects(newBoard, row, col, player) {
    const cells = findWinningCells(newBoard, row, col, player);
    setWinningCells(cells);
    cells.forEach((cell, i) => {
      setTimeout(() => triggerAt(cell.row, cell.col, i % 2 === 0 ? "epic" : "normal"), i * 110);
    });
  }

  const botTurn = useCallback((boardState) => {
    setThinking(true);
    setTimeout(() => {
      const col = getBotMove(boardState, difficulty);
      if (col == null) { setWinner("draw"); setThinking(false); return; }
      const res = dropPiece(boardState, col, P2);
      if (!res) { setThinking(false); return; }
      const { newBoard, row } = res;
      setBoard(newBoard);
      if (checkWin(newBoard, row, col, P2)) {
        setWinner(P2);
        setScore(s => ({ ...s, bot: s.bot + 1 }));
        if (dmRef.current) fireWinEffects(newBoard, row, col, P2);
      } else if (isBoardFull(newBoard)) {
        setWinner("draw");
      } else {
        setCurrentPlayer(P1);
      }
      setThinking(false);
    }, BOT_DELAY[difficulty] ?? 500);
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentPlayer === P2 && !winner) botTurn(board);
  }, [currentPlayer, winner]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleColumnClick(col) {
    if (winner || thinking || currentPlayer !== P1) return;
    const res = dropPiece(board, col, P1);
    if (!res) return;
    const { newBoard, row } = res;
    setBoard(newBoard);
    if (checkWin(newBoard, row, col, P1)) {
      setWinner(P1);
      setScore(s => ({ ...s, player: s.player + 1 }));
      if (dynamicMode) fireWinEffects(newBoard, row, col, P1);
      return;
    }
    if (isBoardFull(newBoard)) { setWinner("draw"); return; }
    setCurrentPlayer(P2);
  }

  function handleReplay() {
    setBoard(createBoard());
    setCurrentPlayer(P1);
    setWinner(null);
    setHoveredCol(null);
    setThinking(false);
    setWinningCells([]);
  }

  const CELL = 68;
  const isHumanTurn = currentPlayer === P1 && !winner && !thinking;

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: P1_COLOR, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          LineUp4
        </h2>
        <span style={{ background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.4)", color: "#ff8833", padding: "3px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Solo · {DIFFICULTY_LABELS[difficulty]}
        </span>
        <button
          onClick={() => setDynamicMode(d => !d)}
          style={{
            background: dynamicMode ? "rgba(255,102,0,0.18)" : "transparent",
            border: `1px solid ${dynamicMode ? "#ff6600" : "#333"}`,
            color: dynamicMode ? "#ff6600" : "#555",
            borderRadius: "4px", padding: "3px 12px",
            cursor: "pointer", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.08em", transition: "all 0.2s", fontFamily: "inherit",
          }}
        >
          ⚡ DYN {dynamicMode ? "ON" : "OFF"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "14px" }}>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P1_COLOR }}>{playerId} <span style={{ color: "#fff" }}>{score.player}</span></span>
        <span style={{ color: "#555", fontSize: "1.1rem", alignSelf: "center" }}>—</span>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P2_COLOR }}>BOT <span style={{ color: "#fff" }}>{score.bot}</span></span>
      </div>

      {!winner && (
        <p style={{ color: thinking ? P2_COLOR : P1_COLOR, fontWeight: "bold", fontSize: "1.05rem", marginBottom: "14px", letterSpacing: "1px", minHeight: "1.5em" }}>
          {thinking ? "BOT réfléchit…" : "Votre tour"}
        </p>
      )}

      {winner && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ color: winner === "draw" ? "#aaa" : winner === P1 ? P1_COLOR : P2_COLOR, fontWeight: "bold", fontSize: "1.5rem", letterSpacing: "3px", textTransform: "uppercase", textShadow: winner !== "draw" ? `0 0 20px ${winner === P1 ? P1_COLOR : P2_COLOR}` : "none" }}>
            {winner === "draw" ? "ÉGALITÉ !" : winner === P1 ? `${playerId} GAGNE !` : "BOT GAGNE !"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "14px" }}>
            <button onClick={handleReplay} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Rejouer</button>
            <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Quitter</button>
          </div>
        </div>
      )}

      <div style={{ display: "inline-block", background: "#0a1628", border: `2px solid ${isHumanTurn ? P1_COLOR : thinking ? P2_COLOR : "#555"}`, borderRadius: "10px", padding: "14px", boxShadow: `0 0 24px rgba(${isHumanTurn ? "255,102,0" : thinking ? "0,180,216" : "0,0,0"},0.25), inset 0 0 40px rgba(0,0,0,0.4)`, transition: "border-color 0.3s, box-shadow 0.3s" }}>
        <div style={{ display: "flex", marginBottom: "6px" }}>
          {Array(COLS).fill(null).map((_, col) => (
            <div key={col} style={{ width: CELL, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {hoveredCol === col && isHumanTurn && (
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: P1_COLOR, opacity: 0.85, boxShadow: `0 0 8px ${P1_COLOR}` }} />
              )}
            </div>
          ))}
        </div>
        {board.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex" }}>
            {row.map((cell, colIdx) => {
              const winning = dynamicMode && isWinningCell(rowIdx, colIdx);
              return (
                <div
                  key={colIdx}
                  data-cell={`${rowIdx}-${colIdx}`}
                  onClick={() => handleColumnClick(colIdx)}
                  onMouseEnter={() => { if (isHumanTurn) setHoveredCol(colIdx); }}
                  onMouseLeave={() => setHoveredCol(null)}
                  style={{ width: CELL, height: CELL, display: "flex", alignItems: "center", justifyContent: "center", cursor: isHumanTurn ? "pointer" : "default", background: hoveredCol === colIdx && isHumanTurn ? "rgba(255,102,0,0.06)" : "transparent", transition: "background 0.1s" }}
                >
                  <div style={{
                    width: CELL - 14, height: CELL - 14, borderRadius: "50%",
                    background: cell === P1 ? P1_COLOR : cell === P2 ? P2_COLOR : "#0d1f3c",
                    border: cell ? "none" : "2px solid #1a3a5c",
                    boxShadow: cell === P1 ? "0 0 14px rgba(255,102,0,0.7), 0 2px 4px rgba(0,0,0,0.5)" : cell === P2 ? "0 0 14px rgba(0,180,216,0.7), 0 2px 4px rgba(0,0,0,0.5)" : "inset 0 2px 6px rgba(0,0,0,0.6)",
                    transition: winning ? "none" : "all 0.15s",
                    animation: winning ? "dm-pulse 550ms ease-in-out infinite" : undefined,
                  }} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "20px" }}>
        {[{ color: P1_COLOR, name: playerId, label: "Vous" }, { color: P2_COLOR, name: "BOT", label: DIFFICULTY_LABELS[difficulty] }].map(({ color, name, label }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
            <span style={{ color: "#ccc", fontSize: "0.9rem" }}>{name} <span style={{ color: "#666", fontSize: "0.8rem" }}>({label})</span></span>
          </div>
        ))}
      </div>

      {!winner && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      )}

      <ParticleLayer />
    </div>
  );
}
