import { useState } from "react"

export default function Skills() {
  const [level, setLevel] = useState(Number(localStorage.getItem("skillLevel") || 1))

  const train = () => {
    const specialization = localStorage.getItem("specialization")
    let gain = 1

    if (specialization === "🎯 Expert") {
      gain = 2
    }

    const newLevel = level + gain
    setLevel(newLevel)
    localStorage.setItem("skillLevel", newLevel)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🎯 Entraînement</h2>
      <p>Niveau compétence : {level}</p>
      <button onClick={train}>S'entraîner</button>
    </div>
  )
}
