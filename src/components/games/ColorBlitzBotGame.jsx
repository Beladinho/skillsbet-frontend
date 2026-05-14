import { useCallback, useEffect, useRef, useState } from "react";
import { useParticles } from "./ParticleEffect";

// ColorBlitz solo — player vs bot, UNO-inspired color/number card game

const COLORS = ["red", "blue", "green", "yellow"];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SPECIALS = ["skip", "reverse", "+2"];

const COLOR_HEX = { red: "#e74c3c", blue: "#3498db", green: "#27ae60", yellow: "#f1c40f" };
const COLOR_LABEL = { red: "Rouge", blue: "Bleu", green: "Vert", yellow: "Jaune" };
const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile", expert: "Expert" };

const P1 = "#ff6600";
const P2 = "#00b4d8";

const BOT_THINK_MS = { easy: 1200, medium: 900, hard: 600, expert: 400 };
const WIN_SCORE = { easy: 5, medium: 7, hard: 10, expert: 15 };

function randCard() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const isSpecial = Math.random() < 0.2;
  const value = isSpecial
    ? SPECIALS[Math.floor(Math.random() * SPECIALS.length)]
    : NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  return { color, value };
}

function canPlay(card, top) {
  return card.color === top.color || card.value === top.value;
}

function drawHand(n) { return Array.from({ length: n }, randCard); }

function botChooseCard(hand, top, difficulty) {
  const playable = hand.filter(c => canPlay(c, top));
  if (!playable.length) return null;
  if (difficulty === "easy") return playable[Math.floor(Math.random() * playable.length)];
  const specials = playable.filter(c => typeof c.value === "string");
  if ((difficulty === "hard" || difficulty === "expert") && specials.length) return specials[0];
  const sameColor = playable.filter(c => c.color === top.color);
  if (sameColor.length) return sameColor[0];
  return playable[0];
}

function CardView({ card, small = false, faceDown = false, onClick, glow, disabled }) {
  const sz = small ? { w: 52, h: 76, fs: "1.1rem", vfs: "0.7rem" } : { w: 72, h: 104, fs: "1.5rem", vfs: "0.85rem" };
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: sz.w, height: sz.h,
        borderRadius: "10px",
        background: faceDown ? "#0d1f3c" : COLOR_HEX[card?.color] ?? "#333",
        border: glow ? `2px solid #fff` : "2px solid rgba(255,255,255,0.15)",
        boxShadow: glow ? `0 0 18px ${COLOR_HEX[card?.color]}aa, 0 0 6px rgba(255,255,255,0.4)` : "0 2px 8px rgba(0,0,0,0.4)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: onClick && !disabled ? "pointer" : "default",
        userSelect: "none",
        transition: "transform 0.12s, box-shadow 0.12s",
        transform: glow && !disabled ? "translateY(-4px)" : "none",
        opacity: disabled ? 0.45 : 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {faceDown ? (
        <span style={{ fontSize: sz.fs, color: "#1a3a5c" }}>?</span>
      ) : (
        <>
          <div style={{ position: "absolute", top: 4, left: 6, fontSize: sz.vfs, fontWeight: 900, color: "rgba(255,255,255,0.9)" }}>{card.value}</div>
          <div style={{ fontSize: sz.fs, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{card.value}</div>
          <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: sz.vfs, fontWeight: 900, color: "rgba(255,255,255,0.9)", transform: "rotate(180deg)" }}>{card.value}</div>
        </>
      )}
    </div>
  );
}

export default function ColorBlitzBotGame({ difficulty, playerId, onExit }) {
  const target = WIN_SCORE[difficulty] ?? 7;

  const [topCard, setTopCard] = useState(randCard);
  const [playerHand, setPlayerHand] = useState(() => drawHand(5));
  const [botHand, setBotHand] = useState(() => drawHand(5));
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [turn, setTurn] = useState("player");
  const [phase, setPhase] = useState("playing");
  const [roundMsg, setRoundMsg] = useState(null);
  const [skipNext, setSkipNext] = useState(null);
  const [botThinking, setBotThinking] = useState(false);
  const [winner, setWinner] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [drawPending, setDrawPending] = useState(false);
  const [dynamicMode, setDynamicMode] = useState(false);

  const pendingRef = useRef(false);
  const dmRef = useRef(false);
  dmRef.current = dynamicMode;

  const { triggerAt, ParticleLayer } = useParticles();

  function isSpecial(card) {
    return typeof card.value === "string";
  }

  function applySpecial(value, nextTurn) {
    let skip = null;
    if (value === "skip" || value === "reverse") skip = nextTurn;
    return skip;
  }

  function playerPlay(idx) {
    if (turn !== "player" || phase !== "playing" || botThinking) return;
    const card = playerHand[idx];
    if (!canPlay(card, topCard)) { setSelectedCard(idx); return; }

    const newHand = playerHand.filter((_, i) => i !== idx);
    setPlayerHand(newHand);
    setTopCard(card);
    setSelectedCard(null);

    if (dynamicMode) triggerAt("cb-topcard", isSpecial(card) ? "epic" : "normal");

    if (card.value === "+2") {
      setBotHand(h => [...h, randCard(), randCard()]);
      setSkipNext("bot");
    }

    if (newHand.length === 0) {
      endRound("player");
      return;
    }

    const skip = applySpecial(card.value, "bot");
    if (skip === "bot") {
      setSkipNext("bot");
      setTurn("bot");
    } else {
      setTurn("bot");
    }
  }

  function playerDraw() {
    if (turn !== "player" || phase !== "playing" || botThinking || drawPending) return;
    const drawn = randCard();
    setPlayerHand(h => [...h, drawn]);
    setSelectedCard(null);
    setDrawPending(true);
    setTimeout(() => {
      setDrawPending(false);
      setTurn("bot");
    }, 500);
  }

  useEffect(() => {
    if (turn !== "bot" || phase !== "playing" || pendingRef.current) return;
    pendingRef.current = true;
    setBotThinking(true);

    const delay = BOT_THINK_MS[difficulty] ?? 800;
    const timer = setTimeout(() => {
      if (skipNext === "bot") {
        setSkipNext(null);
        setBotThinking(false);
        setTurn("player");
        pendingRef.current = false;
        return;
      }

      const card = botChooseCard(botHand, topCard, difficulty);
      if (!card) {
        setBotHand(h => [...h, randCard()]);
        setBotThinking(false);
        setTurn("player");
        pendingRef.current = false;
        return;
      }

      const newHand = botHand.filter(c => c !== card);
      setBotHand(newHand);
      setTopCard(card);

      if (dmRef.current) triggerAt("cb-topcard", isSpecial(card) ? "epic" : "normal");

      if (card.value === "+2") {
        setPlayerHand(h => [...h, randCard(), randCard()]);
        setSkipNext("player");
      }

      if (newHand.length === 0) {
        setBotThinking(false);
        pendingRef.current = false;
        endRound("bot");
        return;
      }

      const skip = applySpecial(card.value, "player");
      setBotThinking(false);
      pendingRef.current = false;
      if (skip === "player") {
        setSkipNext("player");
        setTurn("player");
      } else {
        setTurn("player");
      }
    }, delay);

    return () => { clearTimeout(timer); pendingRef.current = false; };
  }, [turn, phase]);

  useEffect(() => {
    if (turn === "player" && skipNext === "player" && phase === "playing") {
      setSkipNext(null);
      setTurn("bot");
    }
  }, [turn, skipNext, phase]);

  function endRound(roundWinner) {
    const newScore = { ...score, [roundWinner]: score[roundWinner] + 1 };
    setScore(newScore);
    const msg = roundWinner === "player" ? `${playerId} remporte la manche !` : "Le BOT remporte la manche !";
    setRoundMsg(msg);

    if (dynamicMode) {
      // staggered bursts for round end
      triggerAt("cb-topcard", "epic");
      setTimeout(() => triggerAt("cb-topcard", "normal"), 200);
    }

    if (newScore.player >= target) {
      setWinner("player");
      setPhase("gameOver");
    } else if (newScore.bot >= target) {
      setWinner("bot");
      setPhase("gameOver");
    } else {
      setPhase("roundOver");
    }
  }

  function nextRound() {
    const newTop = randCard();
    setTopCard(newTop);
    setPlayerHand(drawHand(5));
    setBotHand(drawHand(5));
    setTurn("player");
    setSkipNext(null);
    setPhase("playing");
    setRoundMsg(null);
    setSelectedCard(null);
    setDrawPending(false);
    pendingRef.current = false;
  }

  function restart() {
    nextRound();
    setScore({ player: 0, bot: 0 });
    setWinner(null);
    setPhase("playing");
  }

  const hasPlayable = playerHand.some(c => canPlay(c, topCard));
  const isPlayerTurn = turn === "player" && phase === "playing" && !botThinking;

  return (
    <div style={{ textAlign: "center", marginTop: "16px", fontFamily: "'Rajdhani','Arial Narrow',sans-serif", userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
        <h2 style={{ color: P1, fontSize: "2rem", letterSpacing: "4px", textTransform: "uppercase", margin: 0, textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
          ColorBlitz
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

      <div style={{ display: "flex", justifyContent: "center", gap: "28px", marginBottom: "12px" }}>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P1 }}>{playerId} <span style={{ color: "#fff" }}>{score.player}</span></span>
        <span style={{ color: "#555", fontSize: "0.85rem", alignSelf: "center" }}>/ {target} pts</span>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: P2 }}>BOT <span style={{ color: "#fff" }}>{score.bot}</span></span>
      </div>

      <div style={{
        display: "inline-block",
        background: "#0a1628",
        border: `2px solid ${phase === "gameOver" ? (winner === "player" ? P1 : P2) : isPlayerTurn ? P1 : P2}`,
        borderRadius: "14px",
        padding: "20px 28px",
        boxShadow: `0 0 28px rgba(${isPlayerTurn ? "255,102,0" : "0,180,216"},0.2)`,
        minWidth: "340px",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>
        {/* Bot hand */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "0.65rem", color: P2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", fontWeight: 800 }}>
            BOT {botThinking ? "⟳" : ""} · {botHand.length} carte{botHand.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
            {botHand.map((_, i) => <CardView key={i} faceDown small />)}
          </div>
        </div>

        {/* Top card + deck */}
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Pioche</div>
            <div
              onClick={isPlayerTurn && !hasPlayable ? playerDraw : undefined}
              style={{
                width: 72, height: 104, borderRadius: "10px",
                background: "#0d1f3c", border: "2px solid rgba(0,180,216,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: isPlayerTurn && !hasPlayable ? "pointer" : "default",
                boxShadow: isPlayerTurn && !hasPlayable ? "0 0 14px rgba(0,180,216,0.4)" : "none",
                fontSize: "1.8rem", color: "rgba(0,180,216,0.5)",
                transition: "box-shadow 0.2s",
              }}
            >
              +
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Carte du dessus</div>
            <div data-cell="cb-topcard" style={{ display: "inline-block" }}>
              <CardView card={topCard} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ fontSize: "0.82rem", color: isPlayerTurn ? P1 : P2, fontWeight: 700, minHeight: "1.4em", marginBottom: "12px", letterSpacing: "0.05em" }}>
          {phase === "playing" && (botThinking ? "BOT réfléchit…" : hasPlayable ? "Jouez une carte" : "Aucune carte jouable — pioche")}
        </div>

        {/* Player hand */}
        <div>
          <div style={{ fontSize: "0.65rem", color: P1, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", fontWeight: 800 }}>
            Votre main · {playerHand.length} carte{playerHand.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
            {playerHand.map((card, i) => {
              const playable = canPlay(card, topCard);
              return (
                <div key={i} onClick={() => playerPlay(i)} style={{ position: "relative" }}>
                  <CardView
                    card={card}
                    small
                    glow={isPlayerTurn && playable && selectedCard !== i}
                    disabled={!isPlayerTurn || !playable}
                  />
                  {!playable && isPlayerTurn && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: "10px", background: "rgba(0,0,0,0.35)", pointerEvents: "none" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Round/game over */}
        {(phase === "roundOver" || phase === "gameOver") && (
          <div style={{ marginTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
            {roundMsg && (
              <p style={{
                color: roundMsg.includes(playerId) ? P1 : P2,
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "2px",
                textTransform: "uppercase", textShadow: `0 0 16px ${roundMsg.includes(playerId) ? P1 : P2}`,
                margin: "0 0 12px",
              }}>
                {roundMsg}
              </p>
            )}
            {phase === "gameOver" && (
              <p style={{
                color: winner === "player" ? P1 : P2,
                fontWeight: 900, fontSize: "1.5rem", letterSpacing: "3px",
                textTransform: "uppercase", textShadow: `0 0 24px ${winner === "player" ? P1 : P2}`,
                margin: "0 0 14px",
              }}>
                {winner === "player" ? `${playerId} GAGNE !` : "BOT GAGNE !"}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              {phase === "roundOver" && (
                <button onClick={nextRound} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Manche suivante</button>
              )}
              {phase === "gameOver" && (
                <button onClick={restart} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>Rejouer</button>
              )}
              <button onClick={onExit} className="btn-ghost" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Quitter</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
        {COLORS.map(c => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 14, height: 14, borderRadius: "3px", background: COLOR_HEX[c] }} />
            <span style={{ fontSize: "0.72rem", color: "#555" }}>{COLOR_LABEL[c]}</span>
          </div>
        ))}
      </div>

      {phase === "playing" && (
        <div style={{ marginTop: "14px" }}>
          <button onClick={onExit} className="btn-ghost" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>← Quitter</button>
        </div>
      )}

      <ParticleLayer />
    </div>
  );
}
