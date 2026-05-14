import { useState } from "react";
import { completeDuelWithWinner } from "../../utils/duelHelpers";
import { useParticles } from "./ParticleEffect";

const COLS = 7;
const ROWS = 6;
const WIN_COUNT = 4;

const EMPTY = null;
const P1 = "p1";
const P2 = "p2";

const P1_COLOR = "#ff6600";
const P2_COLOR = "#00b4d8";

function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
}

function dropPiece(board, col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = player;
      return { newBoard, row };
    }
  }
  return null;
}

function checkWin(board, row, col, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
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
  return board[0].every((cell) => cell !== EMPTY);
}

export default function LineUp4Game({ duel, playerId, onGameFinished }) {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(P1);
  const [winner, setWinner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [dynamicMode, setDynamicMode] = useState(false);
  const [winningCells, setWinningCells] = useState([]);

  const { triggerAt, ParticleLayer } = useParticles();

  const p1Name = duel?.player1 || "Joueur 1";
  const p2Name = duel?.player2 || "Joueur 2";

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

  async function handleFinish(result) {
    if (submitting) return;
    setSubmitting(true);
    try {
      let finalResult;
      if (result === P1) {
        finalResult = await completeDuelWithWinner({ duel, winnerId: duel?.player1, loserId: duel?.player2, draw: false });
      } else if (result === P2) {
        finalResult = await completeDuelWithWinner({ duel, winnerId: duel?.player2, loserId: duel?.player1, draw: false });
      } else {
        finalResult = await completeDuelWithWinner({ duel, draw: true });
      }
      onGameFinished(finalResult);
    } catch (err) {
      console.error("LineUp4: erreur fin de partie", err);
      onGameFinished?.({ status: "error", game: "lineup4", winner: null, stake: duel?.stake || 0, scores: {}, elo_change: {}, game_elo: {}, game_elo_change: {}, balance: {}, balance_change: {} });
    }
  }

  function handleColumnClick(col) {
    if (winner || submitting) return;
    const result = dropPiece(board, col, currentPlayer);
    if (!result) return;
    const { newBoard, row } = result;
    setBoard(newBoard);

    if (checkWin(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      if (dynamicMode) fireWinEffects(newBoard, row, col, currentPlayer);
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

  const CELL = 68;
  const currentColor = currentPlayer === P1 ? P1_COLOR : P2_COLOR;

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "8px" }}>
        <h2 style={{ color: "#ff6600", fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          LineUp4
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

      {!winner && (
        <p style={{ color: currentColor, fontWeight: "bold", fontSize: "1.1rem", marginBottom: "16px", letterSpacing: "1px" }}>
          Tour de{" "}
          <span style={{ textShadow: `0 0 8px ${currentColor}` }}>
            {currentPlayer === P1 ? p1Name : p2Name}
          </span>
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

      <div style={{ display: "inline-block", background: "#0a1628", border: "2px solid #ff6600", borderRadius: "10px", padding: "14px", boxShadow: "0 0 24px rgba(255,102,0,0.25), inset 0 0 40px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", marginBottom: "6px" }}>
          {Array(COLS).fill(null).map((_, col) => (
            <div key={col} style={{ width: CELL, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {hoveredCol === col && !winner && (
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: currentColor, opacity: 0.85, boxShadow: `0 0 8px ${currentColor}` }} />
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
                  onMouseEnter={() => setHoveredCol(colIdx)}
                  onMouseLeave={() => setHoveredCol(null)}
                  style={{ width: CELL, height: CELL, display: "flex", alignItems: "center", justifyContent: "center", cursor: winner ? "default" : "pointer", background: hoveredCol === colIdx && !winner ? "rgba(255,102,0,0.06)" : "transparent", transition: "background 0.1s" }}
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

      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "22px" }}>
        {[{ id: P1, color: P1_COLOR, name: p1Name }, { id: P2, color: P2_COLOR, name: p2Name }].map(({ id, color, name }) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
            <span style={{ color: "#ccc", fontSize: "0.9rem" }}>{name}</span>
          </div>
        ))}
      </div>

      <ParticleLayer />
    </div>
  );
}
