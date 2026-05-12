import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getMissions, claimMission } from "../api/missionsAPI";

export default function Missions() {

  const { playerId } = useContext(PlayerContext);

  const [missions, setMissions] = useState([]);

  useEffect(() => {

    if (!playerId) return;

    loadMissions();

  }, [playerId]);

  async function loadMissions() {

    const data = await getMissions(playerId);

    setMissions(data);

  }

  async function claim(id) {

    await claimMission(id, playerId);

    loadMissions();

  }

  return (

    <div style={{ marginTop: "40px", textAlign: "center" }}>

      <h2>Daily Missions</h2>

      <table border="1" style={{ margin: "auto" }}>

        <thead>
          <tr>
            <th>Mission</th>
            <th>Progress</th>
            <th>Reward</th>
            <th>Claim</th>
          </tr>
        </thead>

        <tbody>

          {missions.map((m, i) => (

            <tr key={i}>

              <td>{m.name}</td>

              <td>{m.progress}/{m.goal}</td>

              <td>{m.reward} tokens</td>

              <td>

                {m.completed && !m.claimed && (
                  <button onClick={() => claim(m.id)}>
                    Claim
                  </button>
                )}

                {m.claimed && "Claimed"}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}