import { useEffect, useState } from "react"
import {
  getUserSkills,
  addSkill,
  deleteSkill,
  levelUpSkill,
  getStats,
} from "./api"

function App() {
  const user = { id: 1 } // utilisateur temporaire

  const [skills, setSkills] = useState([])
  const [stats, setStats] = useState({ xp: 0, level: 1, xp_to_next_level: 100 })

  const [name, setName] = useState("")
  const [level, setLevel] = useState("Débutant")
  const [category, setCategory] = useState("Frontend")

  const loadData = async () => {
    const skillsData = await getUserSkills(user.id)
    const statsData = await getStats(user.id)
    setSkills(skillsData)
    setStats(statsData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async () => {
    if (!name) return
    await addSkill({ name, level, category, user_id: user.id })
    setName("")
    loadData()
  }

  const handleDelete = async (id) => {
    await deleteSkill(id)
    loadData()
  }

  const handleLevelUp = async (id) => {
    await levelUpSkill(id)
    loadData()
  }

  const progressPercent =
    100 - Math.round((stats.xp_to_next_level / (stats.level * 100)) * 100)

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <h2>➕ Ajouter une compétence</h2>
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

      <button onClick={handleAdd}>Ajouter</button>

      <hr />

      <h2>📊 Stats</h2>
      <p>XP : {stats.xp}</p>
      <p>Niveau : {stats.level}</p>
      <p>XP avant prochain niveau : {stats.xp_to_next_level}</p>

      <div
        style={{
          background: "#eee",
          height: 20,
          width: "100%",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: "green",
            borderRadius: 10,
          }}
        />
      </div>

      <hr />

      <h2>📚 Compétences</h2>
      {skills.length === 0 && <p>Aucune compétence</p>}

      {skills.map((skill) => (
        <div key={skill.id} style={{ marginBottom: 10 }}>
          <b>{skill.name}</b> — {skill.level} ({skill.category}){" "}
          <button onClick={() => handleDelete(skill.id)}>❌</button>{" "}
          <button onClick={() => handleLevelUp(skill.id)}>⬆️ Level Up</button>
        </div>
      ))}
    </div>
  )
}

export default App

