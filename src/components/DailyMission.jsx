import { useEffect, useState } from "react"
import { apiFetch } from "../api"

export default function DailyMission() {
  const [mission, setMission] = useState(null)

  const loadMission = async () => {
    const data = await apiFetch("/mission")
    setMission(data)
  }

  const completeMission = async () => {
    await apiFetch("/mission/complete", { method: "POST" })
    loadMission()
    window.location.reload()
  }

  useEffect(() => {
    loadMission()
  }, [])

  if (!mission) return null

  return (
    <div style={{
      border: "2px solid gold",
      padding: 15,
      marginBottom: 20,
      borderRadius: 10
    }}>
      <h3>🎯 Mission du jour</h3>
      <p>{mission.description}</p>
      <p>🎁 Récompense : {mission.reward} XP</p>

      {mission.completed ? (
        <p style={{ color: "green" }}>✅ Mission accomplie</p>
      ) : (
        <button onClick={completeMission}>Valider la mission</button>
      )}
    </div>
  )
}
