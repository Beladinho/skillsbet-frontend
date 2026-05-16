import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { getMatchHistory } from "../api/skillsbetApi";
import AddFriendButton from "../components/AddFriendButton";
import ReportButton from "../components/ReportButton";

const REPLAY_GAMES = ["lineup4", "xobattle"];

export default function MatchHistory() {
  const { playerId } = useContext(PlayerContext);
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playerId) return;
    loadHistory();
  }, [playerId]);

  async function loadHistory() {
    try {
      const data = await getMatchHistory(playerId);
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMatches([]);
    }
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Historique des matchs</h2>

      {matches.length === 0 && <p style={{ color: "var(--clr-text-dim)" }}>Aucun match pour l'instant.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        {matches.map((m, i) => {
          const opponent = m.player1 === playerId ? m.player2 : m.player1;
          const won = m.winner === playerId;
          return (
            <div
              key={i}
              className="simple-list-item"
              style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
            >
              <span className={`badge-${won ? "success" : "error"}`} style={{ fontSize: "0.72rem" }}>
                {won ? "VICTOIRE" : "DÉFAITE"}
              </span>
              <span style={{ fontWeight: 600, flex: 1 }}>{m.game}</span>
              <span style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem" }}>
                vs <strong style={{ color: "var(--clr-text)" }}>{opponent}</strong>
              </span>
              {REPLAY_GAMES.includes(m.game) && m.duel_id && (
                <button
                  onClick={() => navigate(`/replay/${m.duel_id}`)}
                  style={{
                    background: "transparent",
                    border: "1px solid #ff6600",
                    color: "#ff6600",
                    borderRadius: "4px",
                    padding: "3px 10px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,102,0,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  ▶ Replay
                </button>
              )}
              {opponent && !opponent.startsWith("bot_") && opponent !== playerId && (
                <>
                  <AddFriendButton
                    targetId={opponent}
                    className="btn-ghost btn-sm leaderboard-add-friend"
                  />
                  <ReportButton targetId={opponent} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
