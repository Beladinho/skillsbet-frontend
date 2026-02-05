import { useState } from "react"
import { claimDaily } from "../api"

export default function DailyReward() {
  const [reward, setReward] = useState(null)
  const [error, setError] = useState(null)

  const claim = async () => {
    try {
      const data = await claimDaily()
      setReward(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Récompense Quotidienne</h2>

      <button onClick={claim}>Récupérer la récompense</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {reward && (
        <div
          className={`rarity-${reward.reward.rarity}`}
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            fontWeight: "bold",
            textAlign: "center"
          }}
        >
          🎉 {reward.reward.name}
          <div>🔥 Streak : {reward.streak} jours</div>
        </div>
      )}
    </div>
  )
}
