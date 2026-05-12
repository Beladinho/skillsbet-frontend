import { useEffect, useState } from "react";
import { connectSocket } from "../api/socket";

export default function Spectator({ match, onExit }) {

  const [data, setData] = useState(null);

  useEffect(() => {

    connectSocket(match.duelId, "spectator", (msg) => {

      setData(msg);

    });

  }, []);

  return (

    <div style={{ textAlign: "center", marginTop: "40px" }}>

      <h1>Spectating Match</h1>

      <h3>{match.player1} vs {match.player2}</h3>

      {data && (
        <p>
          Score : {data.score1} - {data.score2}
        </p>
      )}

      <br />

      <button onClick={onExit}>
        Back
      </button>

    </div>

  );

}