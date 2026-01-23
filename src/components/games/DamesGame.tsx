import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type Props = {
  bet: number;
  onExit: () => void;
  socket?: Socket | null;
};

export default function DamesGame({ bet, onExit, socket }: Props) {
  const [board, setBoard] = useState<number[][]>([
    // 0 = vide, 1 = joueur1, 2 = joueur2
    [2,0,2,0,2,0,2,0],
    [0,2,0,2,0,2,0,2],
    [2,0,2,0,2,0,2,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0]
  ]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", "room1", "player1");
    socket.on("opponentMove", (move: any) => {
      console.log("Mouvement reçu :", move);
    });
  }, [socket]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🎲 Dames Multi</h2>
      <p>Mise : {bet} €</p>
      <div>
        Plateau de jeu simplifié (console.log pour mouvements)
      </div>
      <button onClick={onExit} style={{ marginTop: 20 }}>Retour</button>
    </div>
  );
}
