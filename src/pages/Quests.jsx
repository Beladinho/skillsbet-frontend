import { useState } from "react"

export default function Quests() {
  const [xp, setXp] = useState(Number(localStorage.getItem("xp") || 0))

  const completeQuest = () => {
    const specialization = localStorage.getItem("specialization")
    let xpGain = 50

    if (specialization === "🧠 Stratège") {
      xpGain = Math.round(xpGain * 1.2)
    }

    const newXp = xp + xpGain
    setXp(newXp)
    localStorage.setItem("xp", newXp)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🗺️ Quêtes</h2>
      <p>XP actuel : {xp}</p>
      <button onClick={completeQuest}>Terminer une quête (+XP)</button>
    </div>
  )
}
