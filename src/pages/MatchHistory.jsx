import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getMatchHistory } from "../api/skillsbetApi";

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
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h2>Match History</h2>

      {matches.length === 0 && <p>No matches yet</p>}

      {matches.map((m, i) => (
        <div
          key={i}
          style={{
            background: "#1e1e2f",
            padding: "10px",
            margin: "10px",
            borderRadius: "8px",
          }}
        >
          <p>{m.game}</p>
          <p>
            {m.player1} vs {m.player2}
          </p>
          <p>Winner : {m.winner}</p>
        </div>
      ))}
    </div>
  );
}
