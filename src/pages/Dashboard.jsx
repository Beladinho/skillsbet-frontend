import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import AddSkill from "../components/AddSkill"
import { api } from "../api"

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext)
  const [stats, setStats] = useState({ xp: 0, level: 1 })

  const loadStats = async () => {
    try {
      const data = await api("/stats", "GET", null, token)
      setStats(data)
    } catch (err) {
      console.error("Erreur stats:", err)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div>
      <h2>🚀 SkillsBet connecté</h2>
      <button onClick={logout}>Se déconnecter</button>

      <p>XP : {stats.xp}</p>
      <p>Niveau : {stats.level}</p>

      <AddSkill token={token} onSkillAdded={loadStats} />
    </div>
  )
}

