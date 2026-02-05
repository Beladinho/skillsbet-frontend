import { useEffect, useState } from "react"

export default function Dashboard() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [skill, setSkill] = useState("")

  useEffect(() => {
    const savedXp = parseInt(localStorage.getItem("xp")) || 0
    updateLevel(savedXp)
  }, [])

  const updateLevel = (newXp) => {
    setXp(newXp)
    localStorage.setItem("xp", newXp)

    if (newXp >= 1000) setLevel(5)
    else if (newXp >= 500) setLevel(4)
    else if (newXp >= 250) setLevel(3)
    else if (newXp >= 100) setLevel(2)
    else setLevel(1)
  }

  const addSkill = () => {
    if (!skill) return

    const gainedXp = xp + 50
    updateLevel(gainedXp)
    setSkill("")
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🚀 SkillsBet connecté</h2>
      <button onClick={() => {
        localStorage.removeItem("token")
        window.location.reload()
      }}>
        Se déconnecter
      </button>

      <h3>XP : {xp}</h3>
      <h3>Niveau : {level}</h3>

      <hr />

      <h3>Ajouter une compétence</h3>
      <input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Ex: React, Marketing..."
      />
      <button onClick={addSkill}>Ajouter</button>
    </div>
  )
}

