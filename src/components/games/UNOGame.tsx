import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";

type Card = { color: string; value: string };

type Props = { bet: number; onExit: () => void };

export default function UnoGame({ bet, onExit }: Props) {
  const { socket } = useSocket();
  const room = "room1";

  const [playerHand, setPlayerHand] = useState<Card[]>([
    { color: "red", value: "5" },
    { color: "blue", value: "2" },
  ]);
  const [pile, setPile] = useState<Card | null>(null);
  const [turn, setTurn] = useState<"player" | "opponent">("player");

  useEffect(() => {
    socket?.emit("joinRoom", room);
  }, [socket]);

  useEffect(() => {
    socket?.on("opponentMove", (move: Card) => {
      setPile(move);
      setTurn("player");
    });
  }, [socket]);

  function playCard(card: Card) {
    if (turn !== "player") return;
    setPile(card);
    setPlayerHand((h) => h.filter((c) => c !== card));
    setTurn("opponent");

    socket?.emit("move", {
      room,
      game: "uno",
      move: card,
    });
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🎴 UNO Multi</h2>
      <p>Mise : {bet} €</p>
      <div>
        <h3>Ta main</h3>
        {playerHand.map((card, i) => (
          <button key={i} onClick={() => playCard(card)}>
            {card.color} {card.value}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Pile centrale</h3>
        {pile ? (
          <div>{pile.color} {pile.value}</div>
        ) : <div>Vide</div>}
      </div>
      <button onClick={onExit} style={{ marginTop: 20 }}>Retour</button>
    </div>
  );
}
