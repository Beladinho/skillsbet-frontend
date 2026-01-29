import { useEffect, useState } from "react"
import "./App.css"

const API_URL = "https://skillsbet-production-37ae.up.railway.app"

function App() {
  const [skills, setSkills] = useState<any[]>([])
  const [name, setName] = useState("")
  const [level, setLevel] = useState("Débutant")
  const [category, setCategory] = useState("Frontend")

  const [stats, setStats] = useState({
    total_xp: 0,
    level: 1,
    xp_to_next_level: 100,
    badges: [] as string[],
  })

  const fetchSkills = async () => {
    const res = await fetch(`${API_URL}/skills`)
    const data = await res.json()
    setSkills(data)
  }

  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/stats`)
    const data = await res.json()
    setStats(data)
  }

  const addSkill = async () => {
    if (!name) return
    await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level, category }),
    })
    setName("")
    fetchSkills()
    fetchStats()
  }

  const deleteSkill = async (id: number) => {
    await fetch(`${API_URL}/skills/${id}`, { method: "DELETE" })
    fetchSkills()
    fetchStats()
  }

  useEffect(() => {
    fetchSkills()
    fetchStats()
  }, [])

  const progressPercent =
    100 - (stats.xp_to_next_level / (stats.level * 100)) * 100

  return (
    <div className="container">
      <h1>🚀 SkillsBet</h1>

      <div className="card">
        <h2>Ajouter une compétence</h2>
        <input
          placeholder="Nom de la compétence"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>Débutant</option>
          <option>Intermédiaire</option>
          <option>Avancé</option>
          <option>Expert</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Frontend</option>
          <option>Backend</option>
          <option>DevOps</option>
          <option>Autre</option>
        </select>

        <button onClick={addSkill}>Ajouter</button>
      </div>

      <div className="card">
        <h2>📊 Niveau {stats.level}</h2>
        <p>XP Total : {stats.total_xp}</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p>XP avant niveau suivant : {stats.xp_to_next_level}</p>
      </div>

      <div className="card">
        <h2>🏆 Badges débloqués</h2>
        {stats.badges.length === 0 ? (
          <p>Aucun badge pour l’instant</p>
        ) : (
          stats.badges.map((b, i) => <div key={i}>{b}</div>)
        )}
      </div>

      <div className="card">
        <h2>Compétences</h2>
        {skills.map((skill) => (
          <div key={skill.id} className="skill">
            {skill.name} — {skill.level} ({skill.category})
            <button onClick={() => deleteSkill(skill.id)}>❌</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
