import { useEffect, useState } from "react"
import "./App.css"

const API_URL = "https://skillsbet-production-37ae.up.railway.app"

function App() {
  const [skills, setSkills] = useState<any[]>([])
  const [name, setName] = useState("")
  const [level, setLevel] = useState("Débutant")
  const [category, setCategory] = useState("Frontend")

  const [stats, setStats] = useState<any>(null)

  const fetchAll = async () => {
    const skillsRes = await fetch(`${API_URL}/skills`)
    setSkills(await skillsRes.json())

    const statsRes = await fetch(`${API_URL}/stats`)
    setStats(await statsRes.json())
  }

  const addSkill = async () => {
    await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level, category }),
    })
    setName("")
    fetchAll()
  }

  const deleteSkill = async (id: number) => {
    await fetch(`${API_URL}/skills/${id}`, { method: "DELETE" })
    fetchAll()
  }

  useEffect(() => {
    fetchAll()
  }, [])

  if (!stats) return <div>Chargement...</div>

  const progress = 100 - (stats.xp_to_next_level / (stats.level * 100)) * 100

  return (
    <div className="container">
      <h1>🚀 SkillsBet</h1>

      <div className="card">
        <h2>📊 Niveau {stats.level}</h2>
        <p>XP Total : {stats.total_xp}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>XP avant niveau suivant : {stats.xp_to_next_level}</p>
      </div>

      <div className="card">
        <h2>🏆 Badges</h2>
        {stats.badges.map((b: string, i: number) => <div key={i}>{b}</div>)}
      </
