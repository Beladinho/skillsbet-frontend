import { useEffect, useState } from "react"
import { apiFetch } from "./api"
import UserGate from "./components/UserGate"
import { useAuth } from "./context/AuthContext"
import Profile from "./pages/Profile"

export default function App() {
  const { logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    loadStats()
    loadLeaderboard()
  }, [])

  const loadStats = async () => setStats(await apiFetch("/stats"))
  const loadLeaderboard = async () => setLeaderboard(await apiFetch("/leaderboard"))

  if (showProfile) return <Profile />

  return (
    <UserGate>
      <div style={{ padding: 20 }}>
        <h1>🚀 SkillsBet connecté</h1>
        <button onClick={() => setShowProfile(true)}>Voir mon profil</button>
        <button onClick={logout}>Se déconnecter</button>

        {stats && (
          <>
            <h2>Niveau {stats.level}</h2>
            <p>XP: {stats.xp}</p>
          </>
        )}

        <hr />

        <h2>Classement</h2>
        <ol>
          {leaderboard.map((p, i) => (
            <li key={i}>{p.username} — Niveau {p.level} — {p.xp} XP</li>
          ))}
        </ol>
      </div>
    </UserGate>
  )
}

