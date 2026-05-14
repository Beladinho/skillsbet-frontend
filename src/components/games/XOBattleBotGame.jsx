import { useState, useEffect, useCallback, useRef } from "react";
import { useParticles } from "./ParticleEffect";

const GRID_OPTIONS = [
  { size: 3, label: "3×3", winCount: 3 },
  { size: 5, label: "5×5", winCount: 4 },
  { size: 7, label: "7×7", winCount: 5 },
];

const P1 = "p1";
const P2 = "p2";
const P1_COLOR = "#ff6600";
const P2_COLOR = "#00b4d8";

const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };
const BOT_DELAY = { easy: 280, medium: 420, hard: 650, expert: 650 };

function createBoard(size) {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

function checkWin(board, row, col, player, winCount) {
  const size = board.length;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < winCount; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
      count++;
    }
    for (let i = 1; i < winCount; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
      count++;
    }
    if (count >= winCount) return true;
  }
  return false;
}

function findWinningCells(board, row, col, player, winCount) {
  const size = board.length;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    const cells = [{ row, col }];
    for (let i = 1; i < winCount; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }
    for (let i = 1; i < winCount; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }
    if (cells.length >= winCount) return cells;
  }
  return [];
}

function isBoardFull(board) {
  return board.every(row => row.every(c => c !== null));
}

function getEmptyCells(board) {
  const cells = [];
  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[r].length; c++)
      if (!board[r][c]) cells.push([r, c]);
  return cells;
}

function evalWindow(win, player, winCount) {
  const opp = player === P2 ? P1 : P2;
  const pc = win.filter(c => c === player).length;
  const ec = win.filter(c => c === null).length;
  const oc = win.filter(c => c === opp).length;
  if (oc > 0) return 0;
  if (pc === winCount) return 10000;
  if (pc === winCount - 1 && ec >= 1) return 100;
  if (pc === winCount - 2 && ec >= 2) return 10;
  return pc;
}

function scoreBoard(board, winCount) {
  const size = board.length;
  let score = 0;
  const mid = Math.floor(size / 2);
  if (board[mid][mid] === P2) score += 4;
  if (board[mid][mid] === P1) score -= 4;
  const evalDir = (cells) => {
    for (let i = 0; i <= cells.length - winCount; i++) {
      const win = cells.slice(i, i + winCount);
      score += evalWindow(win, P2, winCount);
      score -= evalWindow(win, P1, winCount);
    }
  };
  for (let r = 0; r < size; r++) evalDir(board[r]);
  for (let c = 0; c < size; c++) evalDir(board.map(r => r[c]));
  for (let r = 0; r <= size - winCount; r++)
    for (let c = 0; c <= size - winCount; c++)
      evalDir(Array.from({ length: size - Math.max(r, c) }, (_, i) => board[r + i]?.[c + i]).filter(Boolean));
  for (let r = winCount - 1; r < size; r++)
    for (let c = 0; c <= size - winCount; c++)
      evalDir(Array.from({ length: Math.min(r + 1, size - c) }, (_, i) => board[r - i]?.[c + i]).filter(Boolean));
  return score;
}

function minimax(board, depth, alpha, beta, maximizing, winCount) {
  const empty = getEmptyCells(board);
  if (empty.length === 0 || depth === 0) return { score: scoreBoard(board, winCount) };
  const player = maximizing ? P2 : P1;
  let best = { score: maximizing ? -Infinity : Infinity, row: -1, col: -1 };
  for (const [r, c] of empty) {
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = player;
    if (checkWin(newBoard, r, c, player, winCount)) return { score: maximizing ? 100000 + depth : -100000 - depth, row: r, col: c };
    const child = minimax(newBoard, depth - 1, alpha, beta, !maximizing, winCount);
    if (maximizing ? child.score > best.score : child.score < best.score) best = { score: child.score, row: r, col: c };
    if (maximizing) alpha = Math.max(alpha, best.score);
    else beta = Math.min(beta, best.score);
    if (alpha >= beta) break;
  }
  return best;
}

function getDepth(gridSize, difficulty) {
  if (gridSize === 3) return 9;
  if (gridSize === 5) return difficulty === "expert" ? 6 : 4;
  return difficulty === "expert" ? 4 : 3;
}

function getBotMove(board, winCount, difficulty) {
  const empty = getEmptyCells(board);
  if (!empty.length) return null;
  if (difficulty === "easy") return empty[Math.floor(Math.random() * empty.length)];
  for (const [r, c] of empty) {
    const nb = board.map(row => [...row]);
    nb[r][c] = P2;
    if (checkWin(nb, r, c, P2, winCount)) return [r, c];
  }
  for (const [r, c] of empty) {
    const nb = board.map(row => [...row]);
    nb[r][c] = P1;
    if (checkWin(nb, r, c, P1, winCount)) return [r, c];
  }
  if (difficulty === "medium") return empty[Math.floor(Math.random() * empty.length)];
  try {
    const depth = getDepth(board.length, difficulty);
    const { row, col } = minimax(board, depth, -Infinity, Infinity, true, winCount);
    if (row >= 0) return [row, col];
  } catch { }
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function XOBattleBotGame({ difficulty, playerId, onExit }) {
  const [gridOption, setGridOption] = useState(null);
  const [board, setBoard] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(P1);
  const [winner, setWinner] = useState(null);
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

  function fireWinEffects(newBoard, row, col, player, winCount) {
    const cells = findWinningCells(newBoard, row, col, player, winCount);
    setWinningCells(cells);
    cells.forEach((cell, i) => {
      setTimeout(() => triggerAt(cell.row, cell.col, i % 2 === 0 ? "epic" : "normal"), i * 110);
    });
  }

  const botTurn = useCallback((boardState, opt) => {
    setThinking(true);
    setTimeout(() => {
      const move = getBotMove(boardState, opt.winCount, difficulty);
      if (!move) { setWinner("draw"); setThinking(false); return; }
      const [r, c] = move;
      const newBoard = boardState.map(row => [...row]);
      newBoard[r][c] = P2;
      setBoard(newBoard);
      if (checkWin(newBoard, r, c, P2, opt.winCount)) {
        setWinner(P2);
        setScore(s => ({ ...s, bot: s.bot + 1 }));
        if (dmRef.current) fireWinEffects(newBoard, r, c, P2, opt.winCount);
      } else if (isBoardFull(newBoard)) {
        setWinner("draw");
      } else {
        setCurrentPlayer(P1);
      }
      setThinking(false);
    }, BOT_DELAY[difficulty] ?? 500);
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentPlayer === P2 && !winner && board && gridOption) botTurn(board, gridOption);
  }, [currentPlayer, winner]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectGrid(opt) {
    setGridOption(opt);
    setBoard(createBoard(opt.size));
    setCurrentPlayer(P1);
    setWinner(null);
    setWinningCells([]);
  }

  function handleCellClick(row, col) {
    if (!board || winner || thinking || currentPlayer !== P1 || board[row][col]) return;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = P1;
    setBoard(newBoard);
    if (dynamicMode) triggerAt(row, col, "normal");
    if (checkWin(newBoard, row, col, P1, gridOption.winCount)) {
      setWinner(P1);
      setScore(s => ({ ...s, player: s.player + 1 }));
      if (dynamicMode) fireWinEffects(newBoard, row, col, P1, gridOption.winCount);
      return;
    }
    if (isBoardFull(newBoard)) { setWinner("draw"); return; }
    setCurrentPlayer(P2);
  }

  function handleReplay() {
    if (!gridOption) return;
    setBoard(createBoard(gridOption.size));
    setCurrentPlayer(P1);
    setWinner(null);
    setThinking(false);
    setWinningCells([]);
  }

  const isHumanTurn = currentPlayer === P1 && !winner && !thinking && !!board;

  if (!gridOption) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "8px" }}>
          <h2 style={{ color: P1_COLOR, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
            XO Battle
          </h2>
          <span style={{ background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.4)", color: "#ff8833", padding: "3px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Solo · {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>
        <p style={{ color: "#aaa", marginBottom: "36px", fontSize: "1rem" }}>Choisissez la taille de la grille</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {GRID_OPTIONS.map(opt => (
            <button key={opt.size} onClick={() => selectGrid(opt)} style={{ background: "transparent", border: "2px solid #ff6600", color: "#ff6600", borderRadius: "8px", padding: "24px 36px", fontSize: "1.3rem", fontWeight: "bold", cursor: "pointer", letterSpacing: "2px", transition: "all 0.2s", minWidth: "120px" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff6600"; e.currentTarget.style.color = "#000"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,102,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff6600"; e.currentTarget.style.boxShadow = "none"; }}>
              <div>{opt.label}</div>
              <div style={{ fontSize: "0.72rem", marginTop: "8px", opacity: 0.75, letterSpacing: "1px" }}>Aligner {opt.winCount}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: "32px" }}>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      </div>
    );
  }

  const cellSize = Math.min(82, Math.floor(530 / gridOption.size));
  const fontSize = Math.floor(cellSize * 0.52);

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: P1_COLOR, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          XO Battle
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

      <p style={{ color: "#555", fontSize: "0.8rem", marginBottom: "8px", letterSpacing: "1px" }}>
        Grille {gridOption.label} — Aligner {gridOption.winCount}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "12px" }}>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P1_COLOR }}>{playerId} <span style={{ color: "#fff" }}>{score.player}</span></span>
        <span style={{ color: "#555", fontSize: "1.1rem", alignSelf: "center" }}>—</span>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P2_COLOR }}>BOT <span style={{ color: "#fff" }}>{score.bot}</span></span>
      </div>

      {!winner && (
        <p style={{ color: thinking ? P2_COLOR : P1_COLOR, fontWeight: "bold", fontSize: "1.05rem", marginBottom: "14px", letterSpacing: "1px", minHeight: "1.5em" }}>
          {thinking ? "BOT réfléchit…" : "Votre tour (X)"}
        </p>
      )}

      {winner && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ color: winner === "draw" ? "#aaa" : winner === P1 ? P1_COLOR : P2_COLOR, fontWeight: "bold", fontSize: "1.5rem", letterSpacing: "3px", textTransform: "uppercase", textShadow: winner !== "draw" ? `0 0 20px ${winner === P1 ? P1_COLOR : P2_COLOR}` : "none" }}>
            {winner === "draw" ? "ÉGALITÉ !" : winner === P1 ? `${playerId} GAGNE !` : "BOT GAGNE !"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "14px" }}>
            <button onClick={handleReplay} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Rejouer</button>
            <button onClick={() => { setGridOption(null); setBoard(null); setWinner(null); setWinningCells([]); }} className="btn-ghost" style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Changer grille</button>
            <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Quitter</button>
          </div>
        </div>
      )}

      <div style={{ display: "inline-block", background: "#0a1628", border: `2px solid ${isHumanTurn ? P1_COLOR : thinking ? P2_COLOR : "#555"}`, borderRadius: "10px", padding: "12px", boxShadow: `0 0 24px rgba(${isHumanTurn ? "255,102,0" : thinking ? "0,180,216" : "0,0,0"},0.25), inset 0 0 40px rgba(0,0,0,0.4)`, transition: "border-color 0.3s, box-shadow 0.3s" }}>
        {board.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex" }}>
            {row.map((cell, colIdx) => {
              const cellColor = cell === P1 ? P1_COLOR : cell === P2 ? P2_COLOR : null;
              const isEmpty = !cell;
              const winning = dynamicMode && isWinningCell(rowIdx, colIdx);
              return (
                <div
                  key={colIdx}
                  data-cell={`${rowIdx}-${colIdx}`}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  style={{
                    width: cellSize, height: cellSize,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid #1a3a5c",
                    cursor: isHumanTurn && isEmpty ? "pointer" : "default",
                    fontSize, fontWeight: "bold",
                    color: cellColor || "transparent",
                    userSelect: "none",
                    textShadow: cellColor ? `0 0 14px ${cellColor}` : "none",
                    transition: winning ? "none" : "background 0.1s",
                    animation: winning ? "dm-pulse 550ms ease-in-out infinite" : undefined,
                  }}
                  onMouseEnter={e => { if (isEmpty && isHumanTurn) e.currentTarget.style.background = "rgba(255,102,0,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {cell === P1 ? "X" : cell === P2 ? "O" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "20px" }}>
        {[{ color: P1_COLOR, symbol: "X", name: playerId, label: "Vous" }, { color: P2_COLOR, symbol: "O", name: "BOT", label: DIFFICULTY_LABELS[difficulty] }].map(({ color, symbol, name, label }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color, fontWeight: "bold", fontSize: "1.2rem", textShadow: `0 0 10px ${color}` }}>{symbol}</span>
            <span style={{ color: "#ccc", fontSize: "0.9rem" }}>{name} <span style={{ color: "#666", fontSize: "0.8rem" }}>({label})</span></span>
          </div>
        ))}
      </div>

      {!winner && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "18px" }}>
          <button onClick={() => { setGridOption(null); setBoard(null); setWinner(null); setWinningCells([]); }} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "4px", padding: "7px 18px", cursor: "pointer", fontSize: "0.82rem", letterSpacing: "1px" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#666"; e.currentTarget.style.color = "#aaa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; }}>
            Changer grille
          </button>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "7px 18px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      )}

      <ParticleLayer />
    </div>
  );
}
