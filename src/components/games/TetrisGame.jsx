import { useEffect, useMemo, useState } from "react";
import { completeDuelWithBotScore } from "../../utils/duelHelpers";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const SHAPES = [
  {
    name: "I",
    color: "#00cfff",
    cells: [[1, 1, 1, 1]],
  },
  {
    name: "O",
    color: "#ffd500",
    cells: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    name: "T",
    color: "#a855f7",
    cells: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    name: "L",
    color: "#fb923c",
    cells: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  {
    name: "J",
    color: "#3b82f6",
    cells: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    name: "S",
    color: "#22c55e",
    cells: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    name: "Z",
    color: "#ef4444",
    cells: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
];

function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, colIndex) =>
    matrix.map((row) => row[colIndex]).reverse()
  );
}

function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    name: shape.name,
    color: shape.color,
    cells: shape.cells,
    x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(shape.cells[0].length / 2),
    y: 0,
  };
}

function hasCollision(board, piece, moveX = 0, moveY = 0, nextCells = null) {
  const cells = nextCells || piece.cells;

  for (let y = 0; y < cells.length; y += 1) {
    for (let x = 0; x < cells[y].length; x += 1) {
      if (!cells[y][x]) continue;

      const boardX = piece.x + x + moveX;
      const boardY = piece.y + y + moveY;

      if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
        return true;
      }

      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function mergePiece(board, piece) {
  const nextBoard = board.map((row) => [...row]);

  for (let y = 0; y < piece.cells.length; y += 1) {
    for (let x = 0; x < piece.cells[y].length; x += 1) {
      if (!piece.cells[y][x]) continue;

      const boardX = piece.x + x;
      const boardY = piece.y + y;

      if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
        nextBoard[boardY][boardX] = piece.color;
      }
    }
  }

  return nextBoard;
}

function clearLines(board) {
  const remainingRows = board.filter((row) => row.some((cell) => cell === null));
  const clearedCount = BOARD_HEIGHT - remainingRows.length;

  const newRows = Array.from({ length: clearedCount }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );

  return {
    board: [...newRows, ...remainingRows],
    clearedCount,
  };
}

function computeLinePoints(lines) {
  if (lines === 1) return 100;
  if (lines === 2) return 300;
  if (lines === 3) return 500;
  if (lines >= 4) return 800;
  return 0;
}

export default function TetrisGame({ duel, playerId, onGameFinished }) {
  const [board, setBoard] = useState(createEmptyBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visibleBoard = useMemo(() => {
    const tempBoard = board.map((row) => [...row]);

    for (let y = 0; y < piece.cells.length; y += 1) {
      for (let x = 0; x < piece.cells[y].length; x += 1) {
        if (!piece.cells[y][x]) continue;

        const boardX = piece.x + x;
        const boardY = piece.y + y;

        if (
          boardY >= 0 &&
          boardY < BOARD_HEIGHT &&
          boardX >= 0 &&
          boardX < BOARD_WIDTH
        ) {
          tempBoard[boardY][boardX] = piece.color;
        }
      }
    }

    return tempBoard;
  }, [board, piece]);

  function spawnNextPiece(nextBoard) {
    const nextPiece = randomPiece();

    if (hasCollision(nextBoard, nextPiece, 0, 0, nextPiece.cells)) {
      setIsRunning(false);
      setGameOver(true);
      return;
    }

    setPiece(nextPiece);
  }

  function movePiece(dx, dy) {
    if (!isRunning) return;

    if (!hasCollision(board, piece, dx, dy)) {
      setPiece((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      return;
    }

    if (dy === 1) {
      const mergedBoard = mergePiece(board, piece);
      const { board: clearedBoard, clearedCount } = clearLines(mergedBoard);

      if (clearedCount > 0) {
        setLines((prev) => prev + clearedCount);
        setScore((prev) => prev + computeLinePoints(clearedCount));
      } else {
        setScore((prev) => prev + 10);
      }

      setBoard(clearedBoard);
      spawnNextPiece(clearedBoard);
    }
  }

  function rotatePiece() {
    if (!isRunning) return;

    const rotated = rotateMatrix(piece.cells);

    if (!hasCollision(board, piece, 0, 0, rotated)) {
      setPiece((prev) => ({
        ...prev,
        cells: rotated,
      }));
    }
  }

  function hardDrop() {
    if (!isRunning) return;

    let dropDistance = 0;

    while (!hasCollision(board, piece, 0, dropDistance + 1)) {
      dropDistance += 1;
    }

    if (dropDistance > 0) {
      setPiece((prev) => ({
        ...prev,
        y: prev.y + dropDistance,
      }));
    }

    setTimeout(() => {
      movePiece(0, 1);
    }, 0);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (!isRunning) return;

      if (event.key === "ArrowLeft") {
        movePiece(-1, 0);
      } else if (event.key === "ArrowRight") {
        movePiece(1, 0);
      } else if (event.key === "ArrowDown") {
        movePiece(0, 1);
      } else if (event.key === "ArrowUp") {
        rotatePiece();
      } else if (event.key === " ") {
        event.preventDefault();
        hardDrop();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, piece, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      movePiece(0, 1);
    }, 500);

    return () => clearInterval(interval);
  }, [board, piece, isRunning]);

  async function sendScoreAndFinish(finalScore) {
    try {
      setSubmitting(true);

      const result = await completeDuelWithBotScore({
        duel,
        playerId,
        playerScore: finalScore,
        botScoreGenerator: () => Math.floor(Math.random() * 500),
      });

      onGameFinished(result);
    } catch (error) {
      console.error("Erreur fin TetrisGame :", error);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (gameOver) {
      sendScoreAndFinish(score);
    }
  }, [gameOver]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Tetris</h2>

      <p>
        Contrôles : ← → pour bouger, ↑ pour tourner, ↓ pour accélérer, espace pour tomber.
      </p>

      <p>
        <strong>Score :</strong> {score}
      </p>

      <p>
        <strong>Lignes :</strong> {lines}
      </p>

      <div
        style={{
          width: "320px",
          margin: "20px auto",
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 30px)`,
          gap: "1px",
          backgroundColor: "#222",
          padding: "4px",
        }}
      >
        {visibleBoard.flat().map((cell, index) => (
          <div
            key={index}
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: cell || "#111",
              border: "1px solid #333",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>

      {gameOver && (
        <div style={{ marginTop: "20px" }}>
          <h3>Game Over</h3>
          <p>Score final : {score}</p>
          {submitting && <p>Envoi du résultat...</p>}
        </div>
      )}
    </div>
  );
}

