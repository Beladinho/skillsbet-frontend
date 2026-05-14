import { useEffect, useState } from "react";
import { completeDuelWithWinner } from "../../utils/duelHelpers";
import {
  createInitialBoard,
  getValidMoves,
  applyMove,
  countPieces,
  getAllMovesForPlayer,
} from "../../utils/checkersHelpers";
import { useParticles } from "./ParticleEffect";

const P1 = "#ff6600";
const P2 = "#00b4d8";

function CheckerGhost({ player, king }) {
  const color = player === "human" ? P1 : P2;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: color,
      border: king ? "3px solid #f9ca24" : `2px solid ${player === "human" ? "rgba(255,102,0,0.4)" : "rgba(0,180,216,0.4)"}`,
      boxShadow: player === "human" ? "0 0 10px rgba(255,102,0,0.6)" : "0 0 10px rgba(0,180,216,0.6)",
    }} />
  );
}

export default function CheckersGame({ duel, playerId, onGameFinished }) {
  const [board, setBoard] = useState(createInitialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("human");
  const [winner, setWinner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("À toi de jouer");
  const [dynamicMode, setDynamicMode] = useState(false);

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

  function handleCellClick(row, col) {
    if (winner || turn !== "human") return;
    const piece = board[row][col];

    if (piece && piece.player === "human") {
      const moves = getValidMoves(board, row, col);
      setSelectedPiece({ row, col });
      setValidMoves(moves);
      return;
    }

    if (selectedPiece) {
      const chosenMove = validMoves.find(move => move.toRow === row && move.toCol === col);
      if (!chosenMove) return;

      if (dynamicMode && chosenMove.type === "capture") fireCheckersCapture(board, chosenMove);

      const nextBoard = applyMove(board, chosenMove);
      setBoard(nextBoard);
      setSelectedPiece(null);
      setValidMoves([]);

      const counts = countPieces(nextBoard);
      if (counts.bot === 0) { setWinner("human"); return; }

      const botMoves = getAllMovesForPlayer(nextBoard, "bot");
      if (botMoves.length === 0) { setWinner("human"); return; }

      setTurn("bot");
      setStatus("Bot Alpha réfléchit...");
    }
  }

  useEffect(() => {
    if (winner) return;
    if (turn !== "bot") return;

    const timer = setTimeout(() => {
      const botMoves = getAllMovesForPlayer(board, "bot");
      if (botMoves.length === 0) { setWinner("human"); return; }

      const randomMove = botMoves[Math.floor(Math.random() * botMoves.length)];
      if (dynamicMode && randomMove.type === "capture") fireCheckersCapture(board, randomMove);

      const nextBoard = applyMove(board, randomMove);
      setBoard(nextBoard);

      const counts = countPieces(nextBoard);
      if (counts.human === 0) { setWinner("bot"); return; }

      const humanMoves = getAllMovesForPlayer(nextBoard, "human");
      if (humanMoves.length === 0) { setWinner("bot"); return; }

      setTurn("human");
      setStatus("À toi de jouer");
    }, 700);

    return () => clearTimeout(timer);
  }, [turn, board, winner]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendResultAndFinish() {
    try {
      setSubmitting(true);
      const opponent = duel.player1 === playerId ? duel.player2 : duel.player1;
      const result = await completeDuelWithWinner({
        duel, playerId,
        winnerId: winner === "human" ? playerId : opponent,
        loserId: winner === "human" ? opponent : playerId,
        draw: false,
      });
      onGameFinished(result);
    } catch (error) {
      console.error("Erreur fin CheckersGame :", error);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (winner) sendResultAndFinish();
  }, [winner]); // eslint-disable-line react-hooks/exhaustive-deps

  function isMoveTarget(row, col) {
    return validMoves.some(move => move.toRow === row && move.toCol === col);
  }

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani','Arial Narrow',sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "8px" }}>
        <h2 style={{ color: P1, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          DraughtWar
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

      <p style={{ color: "#aaa", marginBottom: "12px" }}>{status}</p>

      <div style={{
        display: "inline-block",
        background: "#0a1628",
        border: "2px solid #ff6600",
        borderRadius: "10px",
        padding: "6px",
        boxShadow: "0 0 24px rgba(255,102,0,0.25)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 60px)" }}>
          {board.flatMap((rowData, row) =>
            rowData.map((cell, col) => {
              const dark = (row + col) % 2 === 1;
              const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
              const isTarget = isMoveTarget(row, col);
              return (
                <div
                  key={`${row}-${col}`}
                  data-cell={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  style={{
                    width: 60, height: 60,
                    backgroundColor: isSelected ? "rgba(255,200,0,0.28)" : isTarget ? "rgba(0,200,100,0.22)" : dark ? "#1a3a2a" : "#0d1f3c",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    border: isTarget ? "2px solid rgba(0,255,100,0.5)" : "1px solid rgba(255,255,255,0.04)",
                    boxSizing: "border-box",
                  }}
                >
                  {cell && (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      backgroundColor: cell.player === "human" ? P1 : P2,
                      border: cell.king ? "4px solid gold" : "2px solid white",
                      boxShadow: cell.player === "human" ? "0 0 10px rgba(255,102,0,0.6)" : "0 0 10px rgba(0,180,216,0.6)",
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {winner && (
        <div style={{ marginTop: "16px" }}>
          <h3 style={{ color: winner === "human" ? P1 : P2, fontSize: "1.5rem", letterSpacing: "3px", textTransform: "uppercase" }}>
            {winner === "human" ? "Victoire !" : "Défaite"}
          </h3>
          {submitting && <p style={{ color: "#888" }}>Envoi du résultat...</p>}
        </div>
      )}

      <ParticleLayer />
    </div>
  );
}
