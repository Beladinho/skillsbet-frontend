import { useEffect, useState } from "react";

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type PieceColor = "white" | "black";

type Piece = {
  type: PieceType;
  color: PieceColor;
};

type Props = {
  bet: number;
  onExit: () => void;
};

const initialBoard: (Piece | null)[][] = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  Array(8).fill({ type: "pawn", color: "black" }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: "pawn", color: "white" }),
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
];

function isMoveValid(piece: Piece, fromY: number, fromX: number, toY: number, toX: number, board: (Piece | null)[][]) {
  // Simplification : IA très basique et mouvements légaux pour pawns + pièces simples
  if (piece.type === "pawn") {
    const direction = piece.color === "white" ? -1 : 1;
    if (fromX === toX && !board[toY][toX] && toY - fromY === direction) return true;
    if (Math.abs(fromX - toX) === 1 && toY - fromY === direction && board[toY][toX]?.color !== piece.color) return true;
  }
  // Autres pièces : IA fera mouvements aléatoires
  return true;
}

export default function ChessGame({ bet, onExit }: Props) {
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<"player" | "ai">("player");
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");

  function handleClick(y: number, x: number) {
    if (turn !== "player" || status !== "playing") return;

    const piece = board[y][x];
    if (selected) {
      const [sy, sx] = selected;
      const movingPiece = board[sy][sx];
      if (movingPiece && isMoveValid(movingPiece, sy, sx, y, x, board)) {
        const newBoard = board.map((row) => [...row]);
        newBoard[y][x] = newBoard[sy][sx];
        newBoard[sy][sx] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn("ai");
      } else {
        setSelected(null);
      }
    } else if (piece?.color === "white") {
      setSelected([y, x]);
    }
  }

  // Tour IA simple aléatoire
  useEffect(() => {
    if (turn !== "ai" || status !== "playing") return;

    const timeout = setTimeout(() => {
      const aiMoves: [number, number, number, number][] = [];
      board.forEach((row, y) =>
        row.forEach((p, x) => {
          if (p?.color === "black") {
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
                  aiMoves.push([y, x, ny, nx]);
                }
              }
          }
        })
      );
      if (aiMoves.length === 0) return;
      const [sy, sx, ny, nx] = aiMoves[Math.floor(Math.random() * aiMoves.length)];
      const newBoard = board.map((row) => [...row]);
      newBoard[ny][nx] = newBoard[sy][sx];
      newBoard[sy][sx] = null;
      setBoard(newBoard);
      setTurn("player");
    }, 800);

    return () => clearTimeout(timeout);
  }, [board, turn, status]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>♔ ÉCHECS</h2>
      <p>Mise : <strong>{bet} €</strong></p>

      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(8, 50px)",
          gridTemplateColumns: "repeat(8, 50px)",
          gap: 1,
          justifyContent: "center",
          margin: "20px auto",
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              onClick={() => handleClick(y, x)}
              style={{
                width: 50,
                height: 50,
                background: (y + x) % 2 === 0 ? "#f3f4f6" : "#334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: selected && selected[0] === y && selected[1] === x ? "2px solid yellow" : undefined,
                color: cell?.color === "white" ? "#fff" : "#000",
                fontSize: 20,
              }}
            >
              {cell ? cell.type[0].toUpperCase() : ""}
            </div>
          ))
        )}
      </div>

      {status === "win" && (
        <>
          <h3 style={{ color: "green" }}>🎉 Victoire</h3>
          <p>Gain : {bet * 2} €</p>
          <button onClick={onExit}>Retour</button>
        </>
      )}

      {status === "lose" && (
        <>
          <h3 style={{ color: "red" }}>❌ Défaite</h3>
          <button onClick={onExit}>Retour</button>
        </>
      )}
    </div>
  );
}
