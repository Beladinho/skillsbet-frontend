import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInitialBoard,
  getValidMoves,
  applyMove,
  countPieces,
  getAllMovesForPlayer,
} from "../../utils/checkersHelpers";
import { useParticles } from "./ParticleEffect";

const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };
const BOT_DELAY = { easy: 500, medium: 600, hard: 800, expert: 900 };
const P1 = "#ff6600";
const P2 = "#00b4d8";

function scoreBoard(board) {
  let score = 0;
  for (const row of board)
    for (const cell of row) {
      if (!cell) continue;
      const val = cell.king ? 3 : 1;
      if (cell.player === "bot") score += val;
      else score -= val;
    }
  return score;
}

function minimaxCheckers(board, depth, alpha, beta, maximizing) {
  const moves = getAllMovesForPlayer(board, maximizing ? "bot" : "human");
  if (depth === 0 || moves.length === 0) return { score: scoreBoard(board) };
  let best = { score: maximizing ? -Infinity : Infinity };
  for (const move of moves) {
    const nb = applyMove(board, move);
    const child = minimaxCheckers(nb, depth - 1, alpha, beta, !maximizing);
    if (maximizing ? child.score > best.score : child.score < best.score) {
      best = { score: child.score, move };
    }
    if (maximizing) alpha = Math.max(alpha, best.score);
    else beta = Math.min(beta, best.score);
    if (alpha >= beta) break;
  }
  return best;
}

function getBotMove(board, difficulty) {
  const moves = getAllMovesForPlayer(board, "bot");
  if (!moves.length) return null;
  if (difficulty === "easy") return moves[Math.floor(Math.random() * moves.length)];
  const depth = difficulty === "medium" ? 2 : difficulty === "hard" ? 4 : 6;
  try {
    const { move } = minimaxCheckers(board, depth, -Infinity, Infinity, true);
    return move ?? moves[Math.floor(Math.random() * moves.length)];
  } catch {
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

function CheckerGhost({ player, king }) {
  const color = player === "human" ? P1 : P2;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: color,
      border: king ? "3px solid #f9ca24" : `2px solid ${player === "human" ? "rgba(255,102,0,0.4)" : "rgba(0,180,216,0.4)"}`,
      boxShadow: player === "human" ? "0 0 12px rgba(255,102,0,0.6)" : "0 0 12px rgba(0,180,216,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "14px", color: "#fff", fontWeight: 900,
    }}>
      {king ? "♛" : ""}
    </div>
  );
}

export default function DraughtWarBotGame({ difficulty, playerId, onExit }) {
  const [board, setBoard] = useState(createInitialBoard);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("human");
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [dynamicMode, setDynamicMode] = useState(false);
  const dmRef = useRef(false);
  dmRef.current = dynamicMode;

  const { triggerAt, addGhost, ParticleLayer } = useParticles();

  function fireCheckersCapture(b, move) {
    const captured = b[move.capturedRow][move.capturedCol];
    if (!captured) return;
    addGhost(
      move.capturedRow, move.capturedCol,
      <CheckerGhost player={captured.player} king={captured.king} />,
      "eject"
    );
    triggerAt(move.capturedRow, move.capturedCol, captured.king ? "epic" : "normal");
  }

  const botTurn = useCallback((b) => {
    setThinking(true);
    setTimeout(() => {
      const move = getBotMove(b, difficulty);
      if (!move) { setWinner("human"); setThinking(false); return; }
      if (dmRef.current && move.type === "capture") fireCheckersCapture(b, move);
      const nb = applyMove(b, move);
      setBoard(nb);
      const counts = countPieces(nb);
      if (counts.human === 0 || getAllMovesForPlayer(nb, "human").length === 0) {
        setWinner("bot");
        setScore(s => ({ ...s, bot: s.bot + 1 }));
      } else {
        setTurn("human");
      }
      setThinking(false);
    }, BOT_DELAY[difficulty] ?? 700);
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (turn === "bot" && !winner) botTurn(board);
  }, [turn, winner]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCell(row, col) {
    if (winner || turn !== "human" || thinking) return;
    const piece = board[row][col];

    if (piece && piece.player === "human") {
      setSelected({ row, col });
      setValidMoves(getValidMoves(board, row, col));
      return;
    }

    if (selected) {
      const move = validMoves.find(m => m.toRow === row && m.toCol === col);
      if (!move) { setSelected(null); setValidMoves([]); return; }
      if (dynamicMode && move.type === "capture") fireCheckersCapture(board, move);
      const nb = applyMove(board, move);
      setBoard(nb);
      setSelected(null);
      setValidMoves([]);
      const counts = countPieces(nb);
      if (counts.bot === 0 || getAllMovesForPlayer(nb, "bot").length === 0) {
        setWinner("human");
        setScore(s => ({ ...s, player: s.player + 1 }));
      } else {
        setTurn("bot");
      }
    }
  }

  function replay() {
    setBoard(createInitialBoard());
    setSelected(null);
    setValidMoves([]);
    setTurn("human");
    setWinner(null);
    setThinking(false);
  }

  const isTarget = (r, c) => validMoves.some(m => m.toRow === r && m.toCol === c);
  const isHumanTurn = turn === "human" && !winner && !thinking;

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani','Arial Narrow',sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: P1, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          DraughtWar
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
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P1 }}>{playerId} <span style={{ color: "#fff" }}>{score.player}</span></span>
        <span style={{ color: "#555", fontSize: "1.1rem", alignSelf: "center" }}>—</span>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P2 }}>BOT <span style={{ color: "#fff" }}>{score.bot}</span></span>
      </div>

      {!winner && (
        <p style={{ color: thinking ? P2 : P1, fontWeight: "bold", fontSize: "1.05rem", marginBottom: "14px", letterSpacing: "1px", minHeight: "1.5em" }}>
          {thinking ? "BOT réfléchit…" : "Votre tour"}
        </p>
      )}

      {winner && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ color: winner === "human" ? P1 : P2, fontWeight: "bold", fontSize: "1.5rem", letterSpacing: "3px", textTransform: "uppercase", textShadow: `0 0 20px ${winner === "human" ? P1 : P2}` }}>
            {winner === "human" ? `${playerId} GAGNE !` : "BOT GAGNE !"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "14px" }}>
            <button onClick={replay} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Rejouer</button>
            <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Quitter</button>
          </div>
        </div>
      )}

      <div style={{
        display: "inline-block",
        background: "#0a1628",
        border: `2px solid ${isHumanTurn ? P1 : thinking ? P2 : "#555"}`,
        borderRadius: "10px",
        padding: "6px",
        boxShadow: `0 0 24px rgba(${isHumanTurn ? "255,102,0" : thinking ? "0,180,216" : "0,0,0"},0.25)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 58px)" }}>
          {board.flatMap((rowData, row) =>
            rowData.map((cell, col) => {
              const dark = (row + col) % 2 === 1;
              const isSel = selected && selected.row === row && selected.col === col;
              const isT = isTarget(row, col);
              return (
                <div
                  key={`${row}-${col}`}
                  data-cell={`${row}-${col}`}
                  onClick={() => handleCell(row, col)}
                  style={{
                    width: 58, height: 58,
                    background: isSel ? "rgba(255,200,0,0.35)" : isT ? "rgba(0,200,100,0.3)" : dark ? "#1a3a2a" : "#0d1f3c",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isHumanTurn ? "pointer" : "default",
                    border: isT ? "2px solid rgba(0,255,100,0.5)" : "1px solid rgba(255,255,255,0.04)",
                    boxSizing: "border-box",
                    position: "relative",
                  }}
                >
                  {cell && (
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: cell.player === "human" ? P1 : P2,
                      border: cell.king ? "3px solid #f9ca24" : `2px solid ${cell.player === "human" ? "rgba(255,102,0,0.4)" : "rgba(0,180,216,0.4)"}`,
                      boxShadow: cell.player === "human" ? "0 0 12px rgba(255,102,0,0.6)" : "0 0 12px rgba(0,180,216,0.6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", color: "#fff", fontWeight: 900,
                    }}>
                      {cell.king ? "♛" : ""}
                    </div>
                  )}
                  {isT && !cell && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(0,255,100,0.4)", border: "2px solid rgba(0,255,100,0.7)" }} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "18px" }}>
        {[{ color: P1, name: playerId, label: "Vous" }, { color: P2, name: "BOT", label: DIFFICULTY_LABELS[difficulty] }].map(({ color, name, label }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
            <span style={{ color: "#ccc", fontSize: "0.88rem" }}>{name} <span style={{ color: "#555", fontSize: "0.78rem" }}>({label})</span></span>
          </div>
        ))}
      </div>

      {!winner && (
        <div style={{ marginTop: "18px" }}>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      )}

      <ParticleLayer />
    </div>
  );
}
