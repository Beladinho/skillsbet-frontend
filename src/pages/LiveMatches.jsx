import { useEffect, useState } from "react";
import { getLiveMatches } from "../api/liveAPI";

export default function LiveMatches({ watchMatch }) {

  const [matches, setMatches] = useState([]);

  useEffect(() => {

    loadMatches();

    const interval = setInterval(loadMatches, 3000);

    return () => clearInterval(interval);

  }, []);

  async function loadMatches() {

    const data = await getLiveMatches();

    setMatches(data);

  }

  return (

    <div style={{ marginTop: "40px", textAlign: "center" }}>

      <h2>Live Matches</h2>

      <table border="1" style={{ margin: "auto" }}>

        <thead>
          <tr>
            <th>Game</th>
            <th>Players</th>
            <th>Score</th>
            <th>Spectate</th>
          </tr>
        </thead>

        <tbody>

          {matches.map((m, i) => (

            <tr key={i}>

              <td>{m.game}</td>

              <td>{m.player1} vs {m.player2}</td>

              <td>{m.score1} - {m.score2}</td>

              <td>
                <button onClick={() => watchMatch(m)}>
                  Watch
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}