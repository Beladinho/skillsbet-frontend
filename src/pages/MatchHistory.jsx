import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getMatchHistory } from "../api/skillsbetApi";
import AddFriendButton from "../components/AddFriendButton";

export default function MatchHistory() {
  const { playerId } = useContext(PlayerContext);
  const [matches, setMatches] = useState([]);

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
              {opponent && !opponent.startsWith("bot_") && opponent !== playerId && (
                <AddFriendButton
                  targetId={opponent}
                  className="btn-ghost btn-sm leaderboard-add-friend"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
