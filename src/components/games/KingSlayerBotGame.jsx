import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInitialChessBoard,
  getValidChessMoves,
  applyChessMove,
  getAllChessMovesForPlayer,
  findKings,
} from "../../utils/chessHelpers";
import { useParticles } from "./ParticleEffect";

const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };
const BOT_DELAY = { easy: 400, medium: 600, hard: 800, expert: 1000 };
const P1 = "#ff6600";
const P2 = "#00b4d8";

const PIECE_SYMBOLS = {
  human: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  bot:   { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const PIECE_VALUES = { pawn: 10, knight: 30, bishop: 33, rook: 50, queen: 90, king: 900 };

function evalBoard(board) {
  let score = 0;
  for (const row of board)
    for (const cell of row) {
      if (!cell) continue;
      const v = PIECE_VALUES[cell.type] ?? 0;
      score += cell.player === "bot" ? v : -v;
    }
  return score;
}

function minimaxChess(board, depth, alpha, beta, maximizing) {
  const player = maximizing ? "bot" : "human";
  const moves = getAllChessMovesForPlayer(board, player);
  const kings = findKings(board);
  if (!kings.botKing) return { score: -100000 };
  if (!kings.humanKing) return { score: 100000 };
  if (depth === 0 || moves.length === 0) return { score: evalBoard(board) };

  let best = { score: maximizing ? -Infinity : Infinity };
  for (const move of moves) {
    const nb = applyChessMove(board, move);
    const child = minimaxChess(nb, depth - 1, alpha, beta, !maximizing);
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
  const moves = getAllChessMovesForPlayer(board, "bot");
  if (!moves.length) return null;
  if (difficulty === "easy") return moves[Math.floor(Math.random() * moves.length)];
  const captures = moves.filter(m => m.type === "capture");
  if (difficulty === "medium" && captures.length > 0) {
    return captures.sort((a, b) => {
      const va = PIECE_VALUES[board[a.toRow][a.toCol]?.type] ?? 0;
      const vb = PIECE_VALUES[board[b.toRow][b.toCol]?.type] ?? 0;
      return vb - va;
    })[0];
  }
  if (difficulty === "medium") return moves[Math.floor(Math.random() * moves.length)];
  const depth = difficulty === "hard" ? 2 : 3;
  try {
    const { move } = minimaxChess(board, depth, -Infinity, Infinity, true);
    return move ?? moves[Math.floor(Math.random() * moves.length)];
  } catch {
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

export default function KingSlayerBotGame({ difficulty, playerId, onExit }) {
  const [board, setBoard] = useState(createInitialChessBoard);
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

  function fireChessCapture(b, move) {
    const captured = b[move.toRow][move.toCol];
    if (!captured) return;
    const isEpic = ["queen", "rook"].includes(captured.type);
    addGhost(
      move.toRow, move.toCol,
      <span style={{
        color: captured.player === "human" ? P1 : P2,
        filter: `drop-shadow(0 0 8px ${captured.player === "human" ? "rgba(255,102,0,0.9)" : "rgba(0,180,216,0.9)"})`,
        fontSize: captured.type === "pawn" ? "28px" : "32px",
      }}>
        {PIECE_SYMBOLS[captured.player][captured.type]}
      </span>,
      "shake"
    );
    triggerAt(move.toRow, move.toCol, isEpic ? "epic" : "normal");
  }

  const botTurn = useCallback((b) => {
    setThinking(true);
    setTimeout(() => {
      const move = getBotMove(b, difficulty);
      if (!move) { setWinner("human"); setThinking(false); return; }
      if (dmRef.current && move.type === "capture") fireChessCapture(b, move);
      const nb = applyChessMove(b, move);
      setBoard(nb);
      const kings = findKings(nb);
      if (!kings.humanKing || getAllChessMovesForPlayer(nb, "human").length === 0) {
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
      setValidMoves(getValidChessMoves(board, row, col));
      return;
    }

    if (selected) {
      const move = validMoves.find(m => m.toRow === row && m.toCol === col);
      if (!move) { setSelected(null); setValidMoves([]); return; }
      if (dynamicMode && move.type === "capture") fireChessCapture(board, move);
      const nb = applyChessMove(board, move);
      setBoard(nb);
      setSelected(null);
      setValidMoves([]);
      const kings = findKings(nb);
      if (!kings.botKing || getAllChessMovesForPlayer(nb, "bot").length === 0) {
        setWinner("human");
        setScore(s => ({ ...s, player: s.player + 1 }));
      } else {
        setTurn("bot");
      }
    }
  }

  function replay() {
    setBoard(createInitialChessBoard());
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
          KingSlayer
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
        <div style={{ display: "flex", paddingLeft: "20px", marginBottom: "2px" }}>
          {"abcdefgh".split("").map(c => (
            <div key={c} style={{ width: 58, textAlign: "center", fontSize: "0.65rem", color: "#333", fontWeight: 700 }}>{c}</div>
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {"87654321".split("").map(n => (
              <div key={n} style={{ height: 58, width: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#333", fontWeight: 700 }}>{n}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 58px)" }}>
            {board.flatMap((rowData, row) =>
              rowData.map((cell, col) => {
                const dark = (row + col) % 2 === 1;
                const isSel = selected && selected.row === row && selected.col === col;
                const isT = isTarget(row, col);
                const isCapture = isT && !!board[row][col];
                return (
                  <div
                    key={`${row}-${col}`}
                    data-cell={`${row}-${col}`}
                    onClick={() => handleCell(row, col)}
                    style={{
                      width: 58, height: 58,
                      background: isSel ? "rgba(255,200,0,0.28)" : isT ? "rgba(0,200,100,0.22)" : dark ? "#1a2e1a" : "#0d1f3c",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: isHumanTurn ? "pointer" : "default",
                      fontSize: "34px",
                      border: isCapture ? "2px solid rgba(255,80,80,0.7)" : isT ? "2px solid rgba(0,255,100,0.4)" : "1px solid rgba(255,255,255,0.04)",
                      boxSizing: "border-box",
                      userSelect: "none",
                      position: "relative",
                      transition: "background 0.1s",
                    }}
                  >
                    {cell ? (
                      <span style={{
                        color: cell.player === "human" ? P1 : P2,
                        filter: `drop-shadow(0 0 6px ${cell.player === "human" ? "rgba(255,102,0,0.7)" : "rgba(0,180,216,0.7)"})`,
                        fontSize: cell.type === "pawn" ? "28px" : "32px",
                      }}>
                        {PIECE_SYMBOLS[cell.player][cell.type]}
                      </span>
                    ) : isT ? (
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(0,255,100,0.5)", border: "2px solid rgba(0,255,100,0.8)" }} />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "18px" }}>
        {[{ color: P1, name: playerId, label: "Blancs · Vous" }, { color: P2, name: "BOT", label: `Noirs · ${DIFFICULTY_LABELS[difficulty]}` }].map(({ color, name, label }) => (
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
