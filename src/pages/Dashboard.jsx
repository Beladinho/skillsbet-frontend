import { useEffect, useState } from "react"

export default function Dashboard() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [skill, setSkill] = useState("")

  useEffect(() => {
    const savedXp = parseInt(localStorage.getItem("xp")) || 0
    updateLevel(savedXp)
  }, [])

  const xpNeeded = [0, 100, 250, 500, 1000, 2000]

  const updateLevel = (newXp) => {
    setXp(newXp)
    localStorage.setItem("xp", newXp)

    if (newXp >= 2000) setLevel(6)
    else if (newXp >= 1000) setLevel(5)
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

  const nextLevelXp = xpNeeded[level]
  const prevLevelXp = xpNeeded[level - 1]
  const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>🚀 SkillsBet connecté</h2>
      <button onClick={() => {
        localStorage.removeItem("token")
        window.location.reload()
      }}>
        Se déconnecter
      </button>

      <h3>XP : {xp}</h3>
      <h3>Niveau : {level}</h3>

      {/* BARRE XP */}
      <div style={{
        background: "#ddd",
        borderRadius: 10,
        height: 20,
        width: "100%",
        marginBottom: 10
      }}>
        <div style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #00c6ff, #0072ff)",
          height: "100%",
          borderRadius: 10,
          transition: "width 0.5s"
        }} />
      </div>
      <small>{xp} / {nextLevelXp} XP pour le niveau {level + 1}</small>

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

