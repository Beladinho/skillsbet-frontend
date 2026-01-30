import { useEffect, useState } from "react"
import { apiFetch } from "./api"
import { useAuth } from "./context/AuthContext"
import UserGate from "./components/UserGate"
import DailyMission from "./components/DailyMission"

function Dashboard() {
  const { logout } = useAuth()
  const [stats, setStats] = useState(null)

  const loadStats = async () => {
    const data = await apiFetch("/stats")
    setStats(data)
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (!stats) return <p>Chargement...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 SkillsBet connecté</h1>
      <button onClick={logout}>Se déconnecter</button>

      <DailyMission />

      <h2>📊 Stats</h2>
      <p>XP : {stats.xp}</p>
      <p>Niveau : {stats.level}</p>
      <p>Progression : {stats.progress}%</p>
    </div>
  )
}

export default function App() {
  return (
    <UserGate>
      <Dashboard />
    </UserGate>
  )
}

