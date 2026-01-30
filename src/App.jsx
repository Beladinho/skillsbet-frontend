import { useEffect, useState } from "react"
import { apiFetch } from "./api"
import UserGate from "./components/UserGate"
import { useAuth } from "./context/AuthContext"

export default function App() {
  const { logout } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const data = await apiFetch("/stats")
    setStats(data)
  }

  return (
    <UserGate>
      <div style={{ padding: 20 }}>
        <h1>🚀 SkillsBet connecté</h1>
        <button onClick={logout}>Se déconnecter</button>

        {stats && (
          <>
            <h2>📊 Niveau {stats.level}</h2>
            <p>XP: {stats.xp}</p>

            <h3>🏆 Badges débloqués</h3>
            {stats.badges.length === 0 && <p>Aucun badge pour l’instant</p>}
            <ul>
              {stats.badges.map((badge, index) => (
                <li key={index}>{badge}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </UserGate>
  )
}

