import { useEffect, useMemo, useRef, useState } from "react";
import { useParticles } from "./ParticleEffect";

const EMOJIS = ["🍎","🍌","🍒","🍇","🍉","🍓","🥝","🍍","🫐","🍑","🍋","🍊"];
const GRID_CONFIG = { easy: 4, medium: 4, hard: 5, expert: 6 };
const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };

function buildDeck(cols) {
  const pairs = (cols * cols) / 2;
  const pool = EMOJIS.slice(0, pairs);
  const arr = [...pool, ...pool].map((v, i) => ({ id: i, value: v, flipped: false, matched: false }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const P1 = "#ff6600";

export default function FlipMatchSoloGame({ difficulty, playerId, onExit }) {
  const cols = GRID_CONFIG[difficulty] ?? 4;
  const totalPairs = (cols * cols) / 2;

  const [cards, setCards] = useState(() => buildDeck(cols));
  const [selected, setSelected] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(null);
  const [dynamicMode, setDynamicMode] = useState(false);

  const dmRef = useRef(false);
  dmRef.current = dynamicMode;

  const { triggerAt, ParticleLayer } = useParticles();

  const score = useMemo(() => Math.max(0, totalPairs * 50 - moves * 5), [matched, moves, totalPairs]);

  function handleClick(card) {
    if (locked || gameOver || card.flipped || card.matched) return;
    if (selected.length === 2) return;
    const updated = cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
    const newSel = [...selected, card.id];
    setCards(updated);
    setSelected(newSel);
    if (newSel.length === 2) { setLocked(true); setMoves(m => m + 1); }
  }

  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected.map(id => cards.find(c => c.id === id));
    if (!a || !b) { setSelected([]); setLocked(false); return; }

    if (a.value === b.value) {
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, matched: true } : c));
        setMatched(m => m + 1);
        setSelected([]);
        setLocked(false);
        if (dmRef.current) {
          triggerAt(`flip-${a.id}`, "normal");
          setTimeout(() => triggerAt(`flip-${b.id}`, "epic"), 80);
        }
      }, 480);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c));
        setSelected([]);
        setLocked(false);
      }, 850);
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (matched === totalPairs) setGameOver(true); }, [matched]);

  useEffect(() => {
    if (gameOver) setBest(b => b === null || score > b ? score : b);
    if (gameOver && dynamicMode) {
      // staggered epic bursts across random matched cards
      const allIds = cards.filter(c => c.matched).map(c => c.id);
      const sample = allIds.sort(() => Math.random() - 0.5).slice(0, 6);
      sample.forEach((id, i) => {
        setTimeout(() => triggerAt(`flip-${id}`, i < 2 ? "epic" : "normal"), i * 130);
      });
    }
  }, [gameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  function replay() {
    setCards(buildDeck(cols));
    setSelected([]);
    setLocked(false);
    setMoves(0);
    setMatched(0);
    setGameOver(false);
  }

  const cellPx = cols === 6 ? 66 : cols === 5 ? 80 : 100;

  return (
    <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Rajdhani','Arial Narrow',sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: P1, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          FlipMatch
        </h2>
        <span style={{ background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.4)", color: "#ff8833", padding: "3px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Solo · {DIFFICULTY_LABELS[difficulty]}
        </span>
        <button
          onClick={() => setDynamicMode(d => !d)}
          style={{
            background: dynamicMode ? "rgba(255,102,0,0.18)" : "transparent",
            border: `1px solid ${dynamicMode ? "#ff6600" : "#333"}`,
            color: dynamicMode ? "#ff6600" : "#555",
            borderRadius: "4px", padding: "3px 12px",
            cursor: "pointer", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.08em", transition: "all 0.2s", fontFamily: "inherit",
          }}
        >
          ⚡ DYN {dynamicMode ? "ON" : "OFF"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "14px" }}>
        {[["Coups", moves], ["Paires", `${matched}/${totalPairs}`], ["Score", score], ...(best !== null ? [["Record", best]] : [])].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: "0.68rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: l === "Record" ? "#f9ca24" : P1, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
        gap: "8px",
        background: "#0a1628",
        border: `2px solid ${gameOver ? "#00b4d8" : P1}`,
        borderRadius: "10px",
        padding: "14px",
        boxShadow: `0 0 24px rgba(${gameOver ? "0,180,216" : "255,102,0"},0.22)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>
        {cards.map(card => {
          const visible = card.flipped || card.matched;
          return (
            <button
              key={card.id}
              data-cell={`flip-${card.id}`}
              onClick={() => handleClick(card)}
              disabled={locked || card.matched}
              style={{
                width: cellPx, height: cellPx,
                fontSize: cols === 6 ? "22px" : cols === 5 ? "26px" : "32px",
                cursor: card.matched ? "default" : "pointer",
                border: card.matched ? `2px solid rgba(0,180,216,0.5)` : `2px solid rgba(255,255,255,0.08)`,
                borderRadius: "8px",
                background: card.matched
                  ? "rgba(0,180,216,0.12)"
                  : visible
                  ? "rgba(255,102,0,0.12)"
                  : "#0d1f3c",
                color: visible ? "#fff" : "#1a3a5c",
                boxShadow: card.matched ? "0 0 10px rgba(0,180,216,0.3)" : "none",
                transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {visible ? card.value : "?"}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ color: "#00b4d8", fontSize: "1.5rem", fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase", textShadow: "0 0 20px rgba(0,180,216,0.7)" }}>
            Terminé !
          </p>
          <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
            {moves} coups · Score final : <strong style={{ color: P1 }}>{score}</strong>
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "14px" }}>
            <button onClick={replay} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Rejouer</button>
            <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Quitter</button>
          </div>
        </div>
      )}

      {!gameOver && (
        <div style={{ marginTop: "16px" }}>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      )}

      <ParticleLayer />
    </div>
  );
}
