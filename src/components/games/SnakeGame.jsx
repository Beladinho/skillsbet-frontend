import { useCallback, useEffect, useRef, useState } from "react";
import { completeDuelWithBotScore } from "../../utils/duelHelpers";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };

function randomFoodPosition(snake) {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    const onSnake = snake.some(
      (segment) => segment.x === food.x && segment.y === food.y
    );

    if (!onSnake) return food;
  }
}

export default function SnakeGame({ duel, playerId, onGameFinished }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(randomFoodPosition(INITIAL_SNAKE));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const directionRef = useRef(direction);
  const submittedRef = useRef(false);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const endGame = useCallback(() => {
    setIsRunning(false);
    setGameOver(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key;
      const current = directionRef.current;

      if (key === "ArrowUp" && current.y !== 1) {
        setDirection({ x: 0, y: -1 });
      } else if (key === "ArrowDown" && current.y !== -1) {
        setDirection({ x: 0, y: 1 });
      } else if (key === "ArrowLeft" && current.x !== 1) {
        setDirection({ x: -1, y: 0 });
      } else if (key === "ArrowRight" && current.x !== -1) {
        setDirection({ x: 1, y: 0 });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const currentDirection = directionRef.current;
        const head = prevSnake[0];

        const newHead = {
          x: head.x + currentDirection.x,
          y: head.y + currentDirection.y,
        };

        const hitWall =
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE;

        const hitSelf = prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        );

        if (hitWall || hitSelf) {
          endGame();
          return prevSnake;
        }

        const ateFood = newHead.x === food.x && newHead.y === food.y;

        if (ateFood) {
          const grownSnake = [newHead, ...prevSnake];
          setScore((prev) => prev + 10);
          setFood(randomFoodPosition(grownSnake));
          return grownSnake;
        }

        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, 160);

    return () => clearInterval(interval);
  }, [food, isRunning, endGame]);

  async function sendScoreAndFinish() {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      setSubmitting(true);

      const result = await completeDuelWithBotScore({
        duel,
        playerId,
        playerScore: score,
        botScoreGenerator: () => Math.floor(Math.random() * 100),
      });

      onGameFinished(result);
    } catch (error) {
  console.error("Erreur fin SnakeGame :", error);
  localStorage.removeItem("duel_id");
  onGameFinished?.({
    status: "error",
    game: duel?.game || "snake",
    winner: null,
    stake: duel?.stake || 0,
    scores: {
      [playerId]: score,
    },
    elo_change: {},
    game_elo: {},
    game_elo_change: {},
    balance: {},
    balance_change: {},
  });
} finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (gameOver) {
      sendScoreAndFinish();
    }
  }, [gameOver]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Snake</h2>

      <p>Utilise les flèches du clavier : ↑ ↓ ← →</p>

      <p>
        <strong>Score :</strong> {score}
      </p>

      <div
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          margin: "20px auto",
          position: "relative",
          border: "2px solid black",
          backgroundColor: "#f5f5f5",
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            style={{
              position: "absolute",
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              backgroundColor: index === 0 ? "green" : "#32cd32",
              border: "1px solid white",
              boxSizing: "border-box",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            backgroundColor: "red",
            border: "1px solid white",
            boxSizing: "border-box",
          }}
        />
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