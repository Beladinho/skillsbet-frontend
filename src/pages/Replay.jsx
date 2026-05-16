import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReplay } from "../api/skillsbetApi";

const P1_COLOR = "#ff6600";
const P2_COLOR = "#00b4d8";

// ──────────────────────────────────────────────
// LineUp4 replay renderer
// ──────────────────────────────────────────────
function LineUp4Board({ moves, upToIndex }) {
  const COLS = 7;
  const ROWS = 6;
  const CELL = 60;

  const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  for (let i = 0; i <= upToIndex && i < moves.length; i++) {
    const { col, row, player } = moves[i].data;
    board[row][col] = player;
  }

  return (
    <div style={{
      display: "inline-block",
      background: "#0a1628",
      border: "2px solid #ff6600",
      borderRadius: "10px",
      padding: "12px",
      boxShadow: "0 0 24px rgba(255,102,0,0.25)",
    }}>
      {board.map((rowArr, rowIdx) => (
        <div key={rowIdx} style={{ display: "flex" }}>
          {rowArr.map((cell, colIdx) => (
            <div
              key={colIdx}
              style={{
                width: CELL,
                height: CELL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{
                width: CELL - 12,
                height: CELL - 12,
                borderRadius: "50%",
                background: cell === "p1" ? P1_COLOR : cell === "p2" ? P2_COLOR : "#0d1f3c",
                border: cell ? "none" : "2px solid #1a3a5c",
                boxShadow: cell === "p1"
                  ? "0 0 12px rgba(255,102,0,0.7)"
                  : cell === "p2"
                  ? "0 0 12px rgba(0,180,216,0.7)"
                  : "inset 0 2px 6px rgba(0,0,0,0.6)",
                transition: "all 0.2s",
              }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// XOBattle replay renderer
// ──────────────────────────────────────────────
function XOBoard({ gridSize, winCount, moves, upToIndex }) {
  const board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  for (let i = 0; i <= upToIndex && i < moves.length; i++) {
    const { row, col, player } = moves[i].data;
    if (row !== undefined && col !== undefined) {
      board[row][col] = player;
    }
  }

  const cellSize = Math.min(76, Math.floor(480 / gridSize));
  const fontSize = Math.floor(cellSize * 0.52);

  return (
    <div style={{
      display: "inline-block",
      background: "#0a1628",
      border: "2px solid #ff6600",
      borderRadius: "10px",
      padding: "12px",
      boxShadow: "0 0 24px rgba(255,102,0,0.25)",
    }}>
      {board.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: "flex" }}>
          {row.map((cell, colIdx) => {
            const color = cell === "p1" ? P1_COLOR : cell === "p2" ? P2_COLOR : null;
            return (
              <div
                key={colIdx}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #1a3a5c",
                  fontSize,
                  fontWeight: "bold",
                  color: color || "transparent",
                  textShadow: color ? `0 0 12px ${color}` : "none",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {cell === "p1" ? "X" : cell === "p2" ? "O" : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Replay page
// ──────────────────────────────────────────────
export default function Replay() {
  const { duel_id } = useParams();
  const navigate = useNavigate();

  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const intervalRef = useRef(null);
  const moves = replay ? replay.events.filter(e => e.type === "move") : [];
  const gridEvent = replay?.events.find(e => e.type === "grid_selected");

  useEffect(() => {
    getReplay(duel_id)
      .then(data => {
        setReplay(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Replay introuvable pour cette partie.");
        setLoading(false);
      });
  }, [duel_id]);

  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }
    if (currentIndex >= moves.length - 1) {
      setPlaying(false);
      return;
    }

    let delay = 800 / speed;
    if (moves.length > 1 && currentIndex >= 0) {
      const curr = moves[currentIndex];
      const next = moves[currentIndex + 1];
      if (next) {
        delay = Math.max(200, (next.timestamp - curr.timestamp) / speed);
      }
    }

    intervalRef.current = setTimeout(() => {
      setCurrentIndex(i => {
        const next = i + 1;
        if (next >= moves.length - 1) setPlaying(false);
        return next;
      });
    }, delay);

    return () => clearTimeout(intervalRef.current);
  }, [playing, currentIndex, moves, speed]);

  function handlePlayPause() {
    if (currentIndex >= moves.length - 1) {
      setCurrentIndex(-1);
      setTimeout(() => setPlaying(true), 50);
    } else {
      setPlaying(p => !p);
    }
  }

  function handleSeek(e) {
    const idx = parseInt(e.target.value, 10);
    setPlaying(false);
    setCurrentIndex(idx);
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  }

  const currentTimestamp = moves[currentIndex]?.timestamp ?? 0;
  const totalTimestamp = moves[moves.length - 1]?.timestamp ?? replay?.duration_seconds * 1000 ?? 0;

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#888" }}>Chargement du replay…</p>
      </div>
    );
  }

  if (error || !replay) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#f55" }}>{error || "Replay indisponible."}</p>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>← Retour</button>
      </div>
    );
  }

  const gameName = replay.game === "lineup4" ? "LineUp4" : "XO Battle";

  return (
    <div style={pageStyle}>
      <button onClick={() => navigate(-1)} style={backBtnStyle}>← Retour</button>

      <h1 style={{ color: "#ff6600", fontSize: "1.8rem", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 4px", textShadow: "0 0 16px rgba(255,102,0,0.5)" }}>
        ▶ REPLAY — {gameName}
      </h1>

      <div style={{ display: "flex", gap: "32px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
        <PlayerCard color={P1_COLOR} symbol="X" name={replay.player1} isWinner={replay.winner === replay.player1} />
        <span style={{ color: "#444", fontSize: "1.4rem", alignSelf: "center" }}>vs</span>
        <PlayerCard color={P2_COLOR} symbol="O" name={replay.player2} isWinner={replay.winner === replay.player2} />
      </div>

      {/* Board */}
      <div style={{ marginBottom: "24px" }}>
        {replay.game === "lineup4" && (
          <LineUp4Board moves={moves} upToIndex={currentIndex} />
        )}
        {replay.game === "xobattle" && gridEvent && (
          <XOBoard
            gridSize={gridEvent.data.size}
            winCount={gridEvent.data.winCount}
            moves={moves}
            upToIndex={currentIndex}
          />
        )}
      </div>

      {/* Move counter */}
      <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "12px" }}>
        Coup {Math.max(0, currentIndex + 1)} / {moves.length}
        {totalTimestamp > 0 && (
          <span style={{ marginLeft: "16px" }}>
            {formatTime(currentTimestamp)} / {formatTime(totalTimestamp)}
          </span>
        )}
      </p>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
        <button onClick={handlePlayPause} style={ctrlBtnStyle}>
          {playing ? "⏸ Pause" : currentIndex >= moves.length - 1 ? "↺ Rejouer" : "▶ Play"}
        </button>

        {[0.5, 1, 2].map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              ...speedBtnStyle,
              border: speed === s ? "1px solid #ff6600" : "1px solid #333",
              color: speed === s ? "#ff6600" : "#666",
            }}
          >
            {s}x
          </button>
        ))}

        <button onClick={() => { setPlaying(false); setCurrentIndex(-1); }} style={speedBtnStyle}>
          ↩ Reset
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto" }}>
        <input
          type="range"
          min={-1}
          max={moves.length - 1}
          value={currentIndex}
          onChange={handleSeek}
          style={{ width: "100%", accentColor: "#ff6600", cursor: "pointer" }}
        />
      </div>

      {moves.length === 0 && (
        <p style={{ color: "#555", marginTop: "24px", fontSize: "0.85rem" }}>
          Aucun coup enregistré pour cette partie.
        </p>
      )}
    </div>
  );
}

function PlayerCard({ color, symbol, name, isWinner }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color, fontWeight: "bold", fontSize: "1.1rem", textShadow: `0 0 10px ${color}` }}>{symbol}</span>
      <span style={{ color: "#ccc", fontSize: "0.95rem", fontFamily: "'Rajdhani', sans-serif" }}>{name || "?"}</span>
      {isWinner && <span style={{ color: "#ffd700", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>🏆</span>}
    </div>
  );
}

const pageStyle = {
  textAlign: "center",
  padding: "24px 16px",
  fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif",
  minHeight: "100vh",
  background: "#060d1a",
  color: "#ccc",
};

const backBtnStyle = {
  background: "transparent",
  border: "1px solid #333",
  color: "#888",
  borderRadius: "4px",
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: "0.82rem",
  marginBottom: "20px",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
};

const ctrlBtnStyle = {
  background: "rgba(255,102,0,0.12)",
  border: "1px solid #ff6600",
  color: "#ff6600",
  borderRadius: "6px",
  padding: "8px 20px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 700,
  letterSpacing: "1px",
  fontFamily: "inherit",
};

const speedBtnStyle = {
  background: "transparent",
  borderRadius: "4px",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "0.82rem",
  fontWeight: 700,
  fontFamily: "inherit",
  transition: "all 0.15s",
};
