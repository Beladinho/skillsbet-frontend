import { useEffect, useState } from "react"
import UserGate from "./UserGate"
import { getUserSkills, addSkill, deleteSkill, getStats } from "./api"

export default function App() {
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [stats, setStats] = useState({ xp: 0, level: 1, xp_to_next_level: 100, badges: [] })

  const [name, setName] = useState("")
  const [level, setLevel] = useState("Débutant")
  const [category, setCategory] = useState("Frontend")

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    if (userId) {
      setUser({ id: userId })
      loadData(userId)
    }
  }, [])

  const loadData = async (userId) => {
    const s = await getUserSkills(userId)
    const st = await getStats(userId)
    setSkills(s)
    setStats(st)
  }

  const handleAdd = async () => {
    if (!name) return
    await addSkill({ name, level, category, user_id: user.id })
    setName("")
    loadData(user.id)
  }

  const handleDelete = async (id) => {
    await deleteSkill(id)
    loadData(user.id)
  }

  if (!user) return <UserGate onLogin={(u) => { setUser(u); loadData(u.id) }} />

  return (
    <div style={{ padding: 30 }}>
      <h1>🚀 SkillsBet</h1>

      <h2>➕ Nouvelle compétence</h2>
      <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />

      <select value={level} onChange={e => setLevel(e.target.value)}>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
        <option>Expert</option>
      </select>

      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option>Frontend</option>
        <option>Backend</option>
        <option>DevOps</option>
        <option>Autre</option>
      </select>

      <button onClick={handleAdd}>Ajouter</button>

      <h2>📊 Niveau {stats.level}</h2>
      <p>XP total : {stats.xp}</p>
      <p>XP avant niveau suivant : {stats.xp_to_next_level}</p>

      <h2>🏆 Badges débloqués</h2>
      {stats.badges.length === 0 ? (
        <p>Aucun badge pour l’instant</p>
      ) : (
        stats.badges.map((b, i) => <div key={i}>{b}</div>)
      )}

      <h2>📚 Compétences</h2>
      {skills.map(skill => (
        <div key={skill.id}>
          {skill.name} — {skill.level} ({skill.category})
          <button onClick={() => handleDelete(skill.id)}>❌</button>
        </div>
      ))}
    </div>
  )
}

