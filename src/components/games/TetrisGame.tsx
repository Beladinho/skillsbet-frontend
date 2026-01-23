import { useEffect, useState } from "react";

type Props = {
  bet: number;
  onExit: () => void;
};

const ROWS = 20;
const COLS = 10;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // L
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // J
];

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    x: 3,
    y: 0,
  };
}

export default function TetrisGame({ bet, onExit }: Props) {
  const [board, setBoard] = useState<number[][]>(emptyBoard());
  const [piece, setPiece] = useState(randomPiece());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Collision
  function collide(px: number, py: number, shape = piece.shape) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (
          shape[y][x] &&
          (board[py + y]?.[px + x] !== 0)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Fusion pièce dans la grille
  function merge() {
    const newBoard = board.map((row) => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          newBoard[piece.y + y][piece.x + x] = 1;
        }
      });
    });
    setBoard(clearLines(newBoard));
    setPiece(randomPiece());
  }

  // Suppression lignes complètes
  function clearLines(b: number[][]) {
    const filtered = b.filter((row) => row.some((cell) => cell === 0));
    const cleared = ROWS - filtered.length;
    if (cleared > 0) {
      setScore((s) => s + cleared * 100);
    }
    return [...Array(cleared).fill(Array(COLS).fill(0)), ...filtered];
  }

  // Descente automatique
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (!collide(piece.x, piece.y + 1)) {
        setPiece((p) => ({ ...p, y: p.y + 1 }));
      } else {
        if (piece.y === 0) {
          setGameOver(true);
        } else {
          merge();
        }
      }
    }, 600);

    return () => clearInterval(interval);
  }, [piece, board, gameOver]);

  // Contrôles clavier
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (gameOver) return;

      if (e.key === "ArrowLeft" && !collide(piece.x - 1, piece.y)) {
        setPiece((p) => ({ ...p, x: p.x - 1 }));
      }

      if (e.key === "ArrowRight" && !collide(piece.x + 1, piece.y)) {
        setPiece((p) => ({ ...p, x: p.x + 1 }));
      }

      if (e.key === "ArrowDown" && !collide(piece.x, piece.y + 1)) {
        setPiece((p) => ({ ...p, y: p.y + 1 }));
      }

      if (e.key === "ArrowUp") {
        const rotated = piece.shape[0].map((_, i) =>
          piece.shape.map((row) => row[i]).reverse()
        );
        if (!collide(piece.x, piece.y, rotated)) {
          setPiece((p) => ({ ...p, shape: rotated }));
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [piece, gameOver]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🧱 Tetris</h2>
      <p>Mise : <strong>{bet} €</strong></p>
      <p>Score : {score}</p>

      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${ROWS}, 24px)`,
          gridTemplateColumns: `repeat(${COLS}, 24px)`,
          gap: 2,
          justifyContent: "center",
          margin: "20px auto",
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => {
            let filled = cell;
            piece.shape.forEach((r, py) =>
              r.forEach((c, px) => {
                if (
                  c &&
                  piece.x + px === x &&
                  piece.y + py === y
                ) {
                  filled = 1;
                }
              })
            );

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: 24,
                  height: 24,
                  background: filled ? "#22c55e" : "#1e293b",
                  borderRadius: 4,
                }}
              />
            );
          })
        )}
      </div>

      {gameOver && (
        <>
          <h3 style={{ color: score >= 500 ? "green" : "red" }}>
            {score >= 500 ? "🎉 Victoire !" : "❌ Défaite"}
          </h3>
          {score >= 500 && <p>Gain : {bet * 2} €</p>}
          <button onClick={onExit}>Retour</button>
        </>
      )}
    </div>
  );
}

