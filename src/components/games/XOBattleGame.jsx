import { useState, useRef } from "react";
import { completeDuelWithWinner } from "../../utils/duelHelpers";
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

function createBoard(size) {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

function checkWin(board, row, col, player, winCount) {
  const size = board.length;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
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
  return board.every((row) => row.every((cell) => cell !== null));
}

export default function XOBattleGame({ duel, playerId, onGameFinished }) {
  const [gridOption, setGridOption] = useState(null);
  const [board, setBoard] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(P1);
  const [winner, setWinner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dynamicMode, setDynamicMode] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const eventsRef = useRef([]);
  const startTimeRef = useRef(null);

  const { triggerAt, ParticleLayer } = useParticles();

  const p1Name = duel?.player1 || "Joueur 1";
  const p2Name = duel?.player2 || "Joueur 2";

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

  async function handleFinish(result) {
    if (submitting) return;
    setSubmitting(true);
    const durationSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;
    try {
      let finalResult;
      const events = eventsRef.current;
      if (result === P1) {
        finalResult = await completeDuelWithWinner({ duel, winnerId: duel?.player1, loserId: duel?.player2, draw: false, events, durationSeconds });
      } else if (result === P2) {
        finalResult = await completeDuelWithWinner({ duel, winnerId: duel?.player2, loserId: duel?.player1, draw: false, events, durationSeconds });
      } else {
        finalResult = await completeDuelWithWinner({ duel, draw: true, events, durationSeconds });
      }
      onGameFinished(finalResult);
    } catch (err) {
      console.error("XOBattle: erreur fin de partie", err);
      onGameFinished?.({ status: "error", game: "xobattle", winner: null, stake: duel?.stake || 0, scores: {}, elo_change: {}, game_elo: {}, game_elo_change: {}, balance: {}, balance_change: {} });
    }
  }

  function selectGrid(option) {
    eventsRef.current = [{ timestamp: 0, type: "grid_selected", data: { size: option.size, winCount: option.winCount } }];
    startTimeRef.current = Date.now();
    setGridOption(option);
    setBoard(createBoard(option.size));
    setCurrentPlayer(P1);
    setWinner(null);
    setWinningCells([]);
  }

  function handleCellClick(row, col) {
    if (winner || submitting || board[row][col]) return;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    if (dynamicMode) triggerAt(row, col, "normal");

    eventsRef.current.push({
      timestamp: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
      type: "move",
      data: { row, col, player: currentPlayer },
    });

    if (checkWin(newBoard, row, col, currentPlayer, gridOption.winCount)) {
      setWinner(currentPlayer);
      if (dynamicMode) fireWinEffects(newBoard, row, col, currentPlayer, gridOption.winCount);
      handleFinish(currentPlayer);
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner("draw");
      handleFinish("draw");
      return;
    }

    setCurrentPlayer(currentPlayer === P1 ? P2 : P1);
  }

  if (!gridOption) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif" }}>
        <h2 style={{ color: "#ff6600", fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          XO Battle
        </h2>
        <p style={{ color: "#aaa", marginBottom: "36px", fontSize: "1rem" }}>Choisissez la taille de la grille</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {GRID_OPTIONS.map((opt) => (
            <button key={opt.size} onClick={() => selectGrid(opt)} style={{ background: "transparent", border: "2px solid #ff6600", color: "#ff6600", borderRadius: "8px", padding: "24px 36px", fontSize: "1.3rem", fontWeight: "bold", cursor: "pointer", letterSpacing: "2px", transition: "all 0.2s", minWidth: "120px" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff6600"; e.currentTarget.style.color = "#000"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,102,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff6600"; e.currentTarget.style.boxShadow = "none"; }}>
              <div>{opt.label}</div>
              <div style={{ fontSize: "0.72rem", marginTop: "8px", opacity: 0.75, letterSpacing: "1px" }}>Aligner {opt.winCount}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const cellSize = Math.min(82, Math.floor(530 / gridOption.size));
  const fontSize = Math.floor(cellSize * 0.52);
  const currentColor = currentPlayer === P1 ? P1_COLOR : P2_COLOR;

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "4px" }}>
        <h2 style={{ color: "#ff6600", fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          XO Battle
        </h2>
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
      <p style={{ color: "#666", fontSize: "0.82rem", marginBottom: "8px", letterSpacing: "1px" }}>
        Grille {gridOption.label} — Aligner {gridOption.winCount}
      </p>

      {!winner && (
        <p style={{ color: currentColor, fontWeight: "bold", fontSize: "1.1rem", marginBottom: "16px", letterSpacing: "1px" }}>
          <span style={{ textShadow: `0 0 8px ${currentColor}` }}>
            {currentPlayer === P1 ? `${p1Name} (X)` : `${p2Name} (O)`}
          </span>{" "}joue
        </p>
      )}

      {winner && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ color: winner === "draw" ? "#aaa" : winner === P1 ? P1_COLOR : P2_COLOR, fontWeight: "bold", fontSize: "1.5rem", letterSpacing: "3px", textTransform: "uppercase", textShadow: winner !== "draw" ? `0 0 20px ${winner === P1 ? P1_COLOR : P2_COLOR}` : "none" }}>
            {winner === "draw" ? "ÉGALITÉ !" : `${winner === P1 ? p1Name : p2Name} GAGNE !`}
          </p>
          {submitting && <p style={{ color: "#888", fontSize: "0.9rem" }}>Envoi du résultat…</p>}
        </div>
      )}

      <div style={{ display: "inline-block", background: "#0a1628", border: "2px solid #ff6600", borderRadius: "10px", padding: "12px", boxShadow: "0 0 24px rgba(255,102,0,0.25), inset 0 0 40px rgba(0,0,0,0.4)" }}>
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
                    cursor: winner || !isEmpty ? "default" : "pointer",
                    fontSize, fontWeight: "bold",
                    color: cellColor || "transparent",
                    userSelect: "none",
                    textShadow: cellColor ? `0 0 14px ${cellColor}` : "none",
                    transition: winning ? "none" : "background 0.1s",
                    animation: winning ? "dm-pulse 550ms ease-in-out infinite" : undefined,
                  }}
                  onMouseEnter={e => { if (isEmpty && !winner) e.currentTarget.style.background = "rgba(255,102,0,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {cell === P1 ? "X" : cell === P2 ? "O" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "22px" }}>
        {[{ id: P1, color: P1_COLOR, name: p1Name, symbol: "X" }, { id: P2, color: P2_COLOR, name: p2Name, symbol: "O" }].map(({ id, color, name, symbol }) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color, fontWeight: "bold", fontSize: "1.2rem", textShadow: `0 0 10px ${color}` }}>{symbol}</span>
            <span style={{ color: "#ccc", fontSize: "0.9rem" }}>{name}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { if (submitting) return; setGridOption(null); setBoard(null); setWinner(null); setWinningCells([]); }} disabled={submitting} style={{ marginTop: "18px", background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "4px", padding: "7px 18px", cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.82rem", letterSpacing: "1px", transition: "border-color 0.2s, color 0.2s" }}
        onMouseEnter={e => { if (!submitting) { e.currentTarget.style.borderColor = "#666"; e.currentTarget.style.color = "#aaa"; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; }}>
        Changer la grille
      </button>

      <ParticleLayer />
    </div>
  );
}
