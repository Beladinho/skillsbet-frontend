import { useEffect, useState } from "react"
import { apiFetch } from "../api"

export default function Leaderboard() {

  const [players, setPlayers] = useState([])

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    const data = await apiFetch("/leaderboard")
    setPlayers(data)
  }

  return (
    <div style={{ padding: 20 }}>

      <h1>🏆 Leaderboard SkillsBet</h1>

      {players.map((player, index) => (

        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #ddd",
            padding: 10
          }}
        >

          <span>
            #{index + 1} {player.avatar} {player.username}
          </span>

          <span>
            Level {player.level} — {player.xp} XP
          </span>

        </div>

      ))}

    </div>
  )
}