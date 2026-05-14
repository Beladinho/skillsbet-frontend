import { useEffect, useState } from "react";
import { completeDuelWithWinner } from "../../utils/duelHelpers";
import {
  createInitialChessBoard,
  getValidChessMoves,
  applyChessMove,
  getAllChessMovesForPlayer,
  findKings,
} from "../../utils/chessHelpers";

function pieceSymbol(piece) {
  if (!piece) return "";

  const symbols = {
    human: {
      king: "♔",
      queen: "♕",
      rook: "♖",
      bishop: "♗",
      knight: "♘",
      pawn: "♙",
    },
    bot: {
      king: "♚",
      queen: "♛",
      rook: "♜",
      bishop: "♝",
      knight: "♞",
      pawn: "♟",
    },
  };

  return symbols[piece.player][piece.type];
}

export default function ChessGame({ duel, playerId, onGameFinished }) {
  const [board, setBoard] = useState(createInitialChessBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("human");
  const [winner, setWinner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("À toi de jouer");

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
      const chosenMove = validMoves.find(
        (move) => move.toRow === row && move.toCol === col
      );

      if (!chosenMove) return;

      const nextBoard = applyChessMove(board, chosenMove);
      setBoard(nextBoard);
      setSelectedPiece(null);
      setValidMoves([]);

      const kings = findKings(nextBoard);
      if (!kings.botKing) {
        setWinner("human");
        return;
      }

      const botMoves = getAllChessMovesForPlayer(nextBoard, "bot");
      if (botMoves.length === 0) {
        setWinner("human");
        return;
      }

      setTurn("bot");
      setStatus("Bot Alpha réfléchit...");
    }
  }

  useEffect(() => {
    if (winner) return;
    if (turn !== "bot") return;

    const timer = setTimeout(() => {
      const botMoves = getAllChessMovesForPlayer(board, "bot");

      if (botMoves.length === 0) {
        setWinner("human");
        return;
      }

      const randomMove =
        botMoves[Math.floor(Math.random() * botMoves.length)];

      const nextBoard = applyChessMove(board, randomMove);
      setBoard(nextBoard);

      const kings = findKings(nextBoard);
      if (!kings.humanKing) {
        setWinner("bot");
        return;
      }

      const humanMoves = getAllChessMovesForPlayer(nextBoard, "human");
      if (humanMoves.length === 0) {
        setWinner("bot");
        return;
      }

      setTurn("human");
      setStatus("À toi de jouer");
    }, 700);

    return () => clearTimeout(timer);
  }, [turn, board, winner]);

  async function sendResultAndFinish() {
    try {
      setSubmitting(true);

      const opponent = duel.player1 === playerId ? duel.player2 : duel.player1;

      const result = await completeDuelWithWinner({
        duel,
        playerId,
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
    if (winner) {
      sendResultAndFinish();
    }
  }, [winner]);

  function isMoveTarget(row, col) {
    return validMoves.some(
      (move) => move.toRow === row && move.toCol === col
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>KingSlayer</h2>

      <p>{status}</p>

      <div
        style={{
          width: "480px",
          margin: "20px auto",
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)",
          border: "2px solid #222",
        }}
      >
        {board.flatMap((rowData, row) =>
          rowData.map((cell, col) => {
            const dark = (row + col) % 2 === 1;
            const isSelected =
              selectedPiece &&
              selectedPiece.row === row &&
              selectedPiece.col === col;
            const isTarget = isMoveTarget(row, col);

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => handleCellClick(row, col)}
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: isSelected
                    ? "#ffe082"
                    : isTarget
                    ? "#a5d6a7"
                    : dark
                    ? "#8d6e63"
                    : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  border: "1px solid #444",
                  fontSize: "36px",
                  userSelect: "none",
                }}
              >
                {pieceSymbol(cell)}
              </div>
            );
          })
        )}
      </div>

      {winner && (
        <div>
          <h3>{winner === "human" ? "Victoire !" : "Défaite"}</h3>
          {submitting && <p>Envoi du résultat...</p>}
        </div>
      )}
    </div>
  );
}
