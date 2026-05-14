import { useEffect, useState } from "react";
import { completeDuelWithWinner } from "../../utils/duelHelpers";
import {
  createInitialChessBoard,
  getValidChessMoves,
  applyChessMove,
  getAllChessMovesForPlayer,
  findKings,
} from "../../utils/chessHelpers";
import { useParticles } from "./ParticleEffect";

const P1 = "#ff6600";
const P2 = "#00b4d8";

const PIECE_SYMBOLS = {
  human: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  bot:   { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export default function ChessGame({ duel, playerId, onGameFinished }) {
  const [board, setBoard] = useState(createInitialChessBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("human");
  const [winner, setWinner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("À toi de jouer");
  const [dynamicMode, setDynamicMode] = useState(false);

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

  function handleCellClick(row, col) {
    if (winner || turn !== "human") return;
    const piece = board[row][col];

    if (piece && piece.player === "human") {
      const moves = getValidChessMoves(board, row, col);
      setSelectedPiece({ row, col });
      setValidMoves(moves);
      return;
    }

    if (selectedPiece) {
      const chosenMove = validMoves.find(move => move.toRow === row && move.toCol === col);
      if (!chosenMove) return;

      if (dynamicMode && chosenMove.type === "capture") fireChessCapture(board, chosenMove);

      const nextBoard = applyChessMove(board, chosenMove);
      setBoard(nextBoard);
      setSelectedPiece(null);
      setValidMoves([]);

      const kings = findKings(nextBoard);
      if (!kings.botKing) { setWinner("human"); return; }

      const botMoves = getAllChessMovesForPlayer(nextBoard, "bot");
      if (botMoves.length === 0) { setWinner("human"); return; }

      setTurn("bot");
      setStatus("Bot Alpha réfléchit...");
    }
  }

  useEffect(() => {
    if (winner) return;
    if (turn !== "bot") return;

    const timer = setTimeout(() => {
      const botMoves = getAllChessMovesForPlayer(board, "bot");
      if (botMoves.length === 0) { setWinner("human"); return; }

      const randomMove = botMoves[Math.floor(Math.random() * botMoves.length)];
      if (dynamicMode && randomMove.type === "capture") fireChessCapture(board, randomMove);

      const nextBoard = applyChessMove(board, randomMove);
      setBoard(nextBoard);

      const kings = findKings(nextBoard);
      if (!kings.humanKing) { setWinner("bot"); return; }

      const humanMoves = getAllChessMovesForPlayer(nextBoard, "human");
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
      console.error("Erreur fin ChessGame :", error);
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
          KingSlayer
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
              const isCapture = isTarget && !!board[row][col];
              return (
                <div
                  key={`${row}-${col}`}
                  data-cell={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  style={{
                    width: 60, height: 60,
                    backgroundColor: isSelected ? "rgba(255,200,0,0.28)" : isTarget ? "rgba(0,200,100,0.22)" : dark ? "#1a2e1a" : "#0d1f3c",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    border: isCapture ? "2px solid rgba(255,80,80,0.7)" : isTarget ? "2px solid rgba(0,255,100,0.4)" : "1px solid rgba(255,255,255,0.04)",
                    boxSizing: "border-box",
                    fontSize: "36px", userSelect: "none",
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
                  ) : isTarget ? (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(0,255,100,0.5)", border: "2px solid rgba(0,255,100,0.8)" }} />
                  ) : null}
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
