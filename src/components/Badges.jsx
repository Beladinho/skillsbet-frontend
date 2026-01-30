import { useEffect, useState } from "react"
import { apiFetch } from "../api"

export default function Badges() {
  const [badges, setBadges] = useState([])

  useEffect(() => {
    apiFetch("/badges").then(setBadges)
  }, [])

  return (
    <div style={{ marginTop: 20 }}>
      <h2>🏆 Badges débloqués</h2>
      {badges.length === 0 && <p>Aucun badge pour l’instant</p>}
      <div style={{ display: "flex", gap: 10 }}>
        {badges.map((b, i) => (
          <div key={i} style={{
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 8,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 30 }}>{b.icon}</div>
            <div>{b.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
