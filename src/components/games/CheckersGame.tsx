import { useEffect, useState } from "react";

type Piece = "black" | "red" | null;

type Props = {
  bet: number;
  onExit: () => void;
};

export default function CheckersGame({ bet, onExit }: Props) {
  const [board, setBoard] = useState<Piece[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<"player" | "ai">("player");
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");

  // Initialisation plateau
  useEffect(() => {
    const b: Piece[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 8; x++)
        if ((x + y) % 2 === 1) b[y][x] = "red";

    for (let y = 5; y < 8; y++)
      for (let x = 0; x < 8; x++)
        if ((x + y) % 2 === 1) b[y][x] = "black";

    setBoard(b);
  }, []);

  // Tour joueur
  function handleClick(y: number, x: number) {
    if (turn !== "player" || status !== "playing") return;

    const piece = board[y][x];
    if (selected) {
      const [sy, sx] = selected;
      const dy = y - sy;
      const dx = x - sx;

      if (Math.abs(dy) === 1 && Math.abs(dx) === 1 && !piece) {
        const newBoard = board.map((row) => [...row]);
        newBoard[y][x] = newBoard[sy][sx];
        newBoard[sy][sx] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn("ai");
      }
      return;
    }

    if (piece === "black") setSelected([y, x]);
  }

  // Tour IA basique
  useEffect(() => {
    if (turn !== "ai" || status !== "playing") return;

    const timeout = setTimeout(() => {
      const moves: [number, number, number, number][] = [];

      board.forEach((row, y) =>
        row.forEach((p, x) => {
          if (p === "red") {
            [[1, -1], [1, 1]].forEach(([dy, dx]) => {
              const ny = y + dy;
              const nx = x + dx;
              if (
                ny >= 0 &&
                ny < 8 &&
                nx >= 0 &&
                nx < 8 &&
                board[ny][nx] === null
              )
                moves.push([y, x, ny, nx]);
            });
          }
        })
      );

      if (moves.length === 0) return;

      const [sy, sx, ny, nx] = moves[Math.floor(Math.random() * moves.length)];
      const newBoard = board.map((row) => [...row]);
      newBoard[ny][nx] = newBoard[sy][sx];
      newBoard[sy][sx] = null;
      setBoard(newBoard);
      setTurn("player");
    }, 800);

    return () => clearTimeout(timeout);
  }, [board, turn, status]);

  // Vérification victoire/défaite
  useEffect(() => {
    const blackLeft = board.flat().filter((c) => c === "black").length;
    const redLeft = board.flat().filter((c) => c === "red").length;

    if (blackLeft === 0) setStatus("lose");
    if (redLeft === 0) setStatus("win");
  }, [board]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>♟️ Dames</h2>
      <p>Mise : <strong>{bet} €</strong></p>

      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(8, 50px)",
          gridTemplateColumns: "repeat(8, 50px)",
          gap: 2,
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
              }}
            >
              {cell && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: cell === "black" ? "#000" : "red",
                  }}
                />
              )}
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

