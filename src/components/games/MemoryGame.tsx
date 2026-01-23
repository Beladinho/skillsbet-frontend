import { useEffect, useState } from "react";

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

type Props = {
  bet: number;
  onExit: () => void;
};

const symbols = ["🍎", "🍌", "🍇", "🍒", "🍉", "🥝", "🍍", "🍑"];

export default function MemoryGame({ bet, onExit }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");

  // Initialisation du jeu
  useEffect(() => {
    const doubled = [...symbols, ...symbols];
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        value: symbol,
        flipped: false,
        matched: false,
      }));

    setCards(shuffled);
  }, []);

  // Gestion du clic sur une carte
  function handleCardClick(card: Card) {
    if (locked || card.flipped || card.matched) return;

    const newCards = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    if (!firstCard) {
      setFirstCard({ ...card, flipped: true });
      return;
    }

    setSecondCard({ ...card, flipped: true });
    setLocked(true);
    setMoves((prev) => prev + 1);
  }

  // Comparaison des cartes
  useEffect(() => {
    if (!firstCard || !secondCard) return;

    setTimeout(() => {
      let newCards = [...cards];

      if (firstCard.value === secondCard.value) {
        newCards = newCards.map((c) =>
          c.value === firstCard.value ? { ...c, matched: true } : c
        );
      } else {
        newCards = newCards.map((c) =>
          c.id === firstCard.id || c.id === secondCard.id
            ? { ...c, flipped: false }
            : c
        );
      }

      setCards(newCards);
      setFirstCard(null);
      setSecondCard(null);
      setLocked(false);
    }, 800);
  }, [secondCard]);

  // Vérification victoire / défaite
  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every((c) => c.matched);
    if (allMatched) {
      setStatus("win");
    } else if (moves >= 20) {
      setStatus("lose");
    }
  }, [cards, moves]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🧠 Memory</h2>

      <p>Mise : <strong>{bet} €</strong></p>
      <p>Coups : {moves} / 20</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 80px)",
          gap: 10,
          justifyContent: "center",
          margin: "20px 0",
        }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            style={{
              width: 80,
              height: 80,
              fontSize: 30,
              cursor: "pointer",
              background: card.flipped || card.matched ? "#fff" : "#334155",
              color: "#000",
              borderRadius: 8,
            }}
          >
            {card.flipped || card.matched ? card.value : "❓"}
          </button>
        ))}
      </div>

      {status === "win" && (
        <>
          <h3 style={{ color: "green" }}>🎉 Victoire !</h3>
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
