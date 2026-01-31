import { useEffect, useState } from "react"
import api from "../api"

export default function Missions() {
  const [missions, setMissions] = useState([])

  useEffect(() => {
    api.get("/missions").then(res => setMissions(res.data))
  }, [])

  const completeMission = async (id) => {
    await api.post(`/missions/${id}/complete`)
    window.location.reload()
  }

  return (
    <div>
      <h2>🎯 Missions</h2>
      {missions.map(m => (
        <div key={m.id} style={{marginBottom:10}}>
          {m.title} — {m.xp_reward} XP
          {!m.completed && (
            <button onClick={() => completeMission(m.id)}>Valider</button>
          )}
          {m.completed && " ✅"}
        </div>
      ))}
    </div>
  )
}
