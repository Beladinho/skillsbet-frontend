import { useEffect, useMemo, useState } from "react";
import { completeDuelWithBotScore } from "../../utils/duelHelpers";

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function createDeck() {
  const values = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🥝", "🍍"];
  const duplicated = [...values, ...values];

  return shuffleArray(
    duplicated.map((value, index) => ({
      id: index + 1,
      value,
      isFlipped: false,
      isMatched: false,
    }))
  );
}

export default function MemoryGame({ duel, playerId, onGameFinished }) {
  const [cards, setCards] = useState(createDeck);
  const [selectedCards, setSelectedCards] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => {
    const baseScore = matchedPairs * 20;
    const penalty = moves;
    return Math.max(0, baseScore - penalty);
  }, [matchedPairs, moves]);

  function handleCardClick(card) {
    if (locked || gameOver) return;
    if (card.isFlipped || card.isMatched) return;
    if (selectedCards.length === 2) return;

    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );

    const newSelected = [...selectedCards, card.id];

    setCards(updatedCards);
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      setMoves((prev) => prev + 1);
    }
  }

  useEffect(() => {
    if (selectedCards.length !== 2) return;

    const [firstId, secondId] = selectedCards;
    const firstCard = cards.find((c) => c.id === firstId);
    const secondCard = cards.find((c) => c.id === secondId);

    if (!firstCard || !secondCard) {
      setSelectedCards([]);
      setLocked(false);
      return;
    }

    if (firstCard.value === secondCard.value) {
      const timer = setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );

        setMatchedPairs((prev) => prev + 1);
        setSelectedCards([]);
        setLocked(false);
      }, 500);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCards((prev) =>
        prev.map((card) =>
          card.id === firstId || card.id === secondId
            ? { ...card, isFlipped: false }
            : card
        )
      );

      setSelectedCards([]);
      setLocked(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [selectedCards, cards]);

  useEffect(() => {
    if (matchedPairs === 8) {
      setGameOver(true);
    }
  }, [matchedPairs]);

  async function sendScoreAndFinish(finalScore) {
    try {
      setSubmitting(true);

      const result = await completeDuelWithBotScore({
        duel,
        playerId,
        playerScore: finalScore,
        botScoreGenerator: () => Math.floor(Math.random() * 140),
      });

      onGameFinished(result);
    } catch (error) {
      console.error("Erreur fin MemoryGame :", error);
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
      <h2>FlipMatch</h2>

      <p>Trouve toutes les paires avec le moins de coups possible.</p>

      <p>
        <strong>Paires trouvées :</strong> {matchedPairs} / 8
      </p>

      <p>
        <strong>Coups :</strong> {moves}
      </p>

      <p>
        <strong>Score :</strong> {score}
      </p>

      <div
        style={{
          width: "440px",
          margin: "20px auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 100px)",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {cards.map((card) => {
          const visible = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={locked || card.isMatched}
              style={{
                width: "100px",
                height: "100px",
                fontSize: "32px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: card.isMatched ? "#d4edda" : "#f8f9fa",
              }}
            >
              {visible ? card.value : "?"}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <div style={{ marginTop: "20px" }}>
          <h3>Partie terminée</h3>
          <p>Score final : {score}</p>
          {submitting && <p>Envoi du résultat...</p>}
        </div>
      )}
    </div>
  );
}
