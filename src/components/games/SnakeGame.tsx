import { useEffect, useState } from "react";
import { sendGameResult } from "../../utils/sendGameResult";

type Position = {
  x: number;
  y: number;
};

type Props = {
  bet: number;
  onExit: () => void;
};

const GRID_SIZE = 10;
const BOARD_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

export default function SnakeGame({ bet, onExit }: Props) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [apple, setApple] = useState<Position>(randomApple());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // ⌨️ Contrôles clavier
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ⏱️ Boucle du jeu
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      moveSnake();
    }, 200);

    return () => clearInterval(interval);
  }, [snake, direction, gameOver]);

  function moveSnake() {
    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    // 💀 Collision mur ou corps
    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= BOARD_SIZE ||
      newHead.y >= BOARD_SIZE ||
      snake.some(
        (part) => part.x === newHead.x && part.y === newHead.y
      )
    ) {
      endGame(false);
      return;
    }

    const newSnake = [newHead, ...snake];

    // 🍎 Mange la pomme
    if (newHead.x === apple.x && newHead.y === apple.y) {
      setScore((s) => s + 1);
      setApple(randomApple());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  async function endGame(win: boolean) {
    setGameOver(true);

    await sendGameResult({
      game: "snake",
      bet,
      win,
      score,
    });
  }

  function restart() {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setApple(randomApple());
    setScore(0);
    setGameOver(false);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h3>🐍 Snake</h3>
      <p>Mise : {bet} | Score : {score}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${GRID_SIZE}px)`,
          gap: 1,
          justifyContent: "center",
          margin: "20px auto",
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
          const x = i % BOARD_SIZE;
          const y = Math.floor(i / BOARD_SIZE);

          const isSnake = snake.some(
            (part) => part.x === x && part.y === y
          );
          const isApple = apple.x === x && apple.y === y;

          return (
            <div
              key={i}
              style={{
                width: GRID_SIZE,
                height: GRID_SIZE,
                background: isSnake
                  ? "#22c55e"
                  : isApple
                  ? "#ef4444"
                  : "#1e293b",
              }}
            />
          );
        })}
      </div>

      {gameOver && (
        <>
          <p style={{ color: "red" }}>Game Over</p>
          <button onClick={restart}>Rejouer</button>{" "}
          <button onClick={onExit}>Quitter</button>
        </>
      )}
    </div>
  );
}

// 🍎 Génération aléatoire de pomme
function randomApple(): Position {
  return {
    x: Math.floor(Math.random() * BOARD_SIZE),
    y: Math.floor(Math.random() * BOARD_SIZE),
  };
}
