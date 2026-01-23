import { useState } from "react";
import SnakeGame from "../components/games/SnakeGame";
import MemoryGame from "../components/games/MemoryGame";
import ReflexGame from "../components/games/ReflexGame";
import TetrisGame from "../components/games/TetrisGame";
import UnoGame from "../components/games/UnoGame";
import DamesGame from "../components/games/DamesGame";
import ChessGame from "../components/games/ChessGame";
import { useSocket } from "../context/SocketContext";

type GameKey = "snake" | "memory" | "reflex" | "tetris" | "uno" | "dames" | "chess";

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<GameKey | null>(null);
  const [bet, setBet] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const { socket } = useSocket();

  function startGame() {
    if (bet <= 0) return alert("Entre une mise valide");
    setGameStarted(true);
  }

  function resetGame() {
    setSelectedGame(null);
    setBet(0);
    setGameStarted(false);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h2>🎮 Jeux disponibles</h2>

      {!selectedGame && (
        <div style={{ marginBottom: 20 }}>
          {["snake","memory","reflex","tetris","uno","dames","chess"].map(game => (
            <button key={game} onClick={() => setSelectedGame(game as GameKey)} style={{ margin: 5 }}>
              {game.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {selectedGame && !gameStarted && (
        <div style={{ marginBottom: 20 }}>
          <p>Jeu sélectionné : <strong>{selectedGame}</strong></p>
          <input type="number" placeholder="Mise" value={bet} onChange={e => setBet(Number(e.target.value))}/>
          <br /><br />
          <button onClick={startGame}>Lancer la partie</button>{" "}
          <button onClick={resetGame}>Changer de jeu</button>
        </div>
      )}

      {gameStarted && selectedGame === "snake" && <SnakeGame bet={bet} onExit={resetGame} socket={socket} />}
      {gameStarted && selectedGame === "memory" && <MemoryGame bet={bet} onExit={resetGame} socket={socket} />}
      {gameStarted && selectedGame === "reflex" && <ReflexGame bet={bet} onExit={resetGame} socket={socket} />}
      {gameStarted && selectedGame === "tetris" && <TetrisGame bet={bet} onExit={resetGame} socket={socket} />}
      {gameStarted && selectedGame === "uno" && <UnoGame bet={bet} onExit={resetGame} socket={socket} />}
      {gameStarted && selectedGame === "dames" && <DamesGame bet={bet} onExit={resetGame} socket={socket} />}
      {gameStarted && selectedGame === "chess" && <ChessGame bet={bet} onExit={resetGame} socket={socket} />}
    </div>
  );
}
