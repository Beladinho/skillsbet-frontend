import { useEffect, useState } from "react"

export default function Dashboard() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [skill, setSkill] = useState("")
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(0)
  const [bonusXp, setBonusXp] = useState(0)

  const xpNeeded = [0, 100, 250, 500, 1000, 2000]

  useEffect(() => {
    const savedXp = parseInt(localStorage.getItem("xp")) || 0
    handleDailyStreak(savedXp)
  }, [])

  const handleDailyStreak = (currentXp) => {
    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem("lastLogin")
    let currentStreak = parseInt(localStorage.getItem("streak")) || 0
    let newXp = currentXp

    if (lastLogin !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastLogin === yesterday.toDateString()) {
        currentStreak += 1
      } else {
        currentStreak = 1
      }

      const bonus = Math.min(currentStreak * 10, 50)
      newXp += bonus

      localStorage.setItem("streak", currentStreak)
      localStorage.setItem("lastLogin", today)
      setBonusXp(bonus)
    }

    setStreak(currentStreak)
    updateAll(newXp)
  }

  const updateAll = (newXp) => {
    setXp(newXp)
    localStorage.setItem("xp", newXp)

    if (newXp >= 2000) setLevel(6)
    else if (newXp >= 1000) setLevel(5)
    else if (newXp >= 500) setLevel(4)
    else if (newXp >= 250) setLevel(3)
    else if (newXp >= 100) setLevel(2)
    else setLevel(1)

    const unlocked = []
    if (newXp >= 100) unlocked.push("🥉 Débutant")
    if (newXp >= 500) unlocked.push("🥈 Intermédiaire")
    if (newXp >= 1000) unlocked.push("🥇 Expert")
    if (newXp >= 2000) unlocked.push("👑 Légende")

    setBadges(unlocked)
  }

  const addSkill = () => {
    if (!skill) return
    const gainedXp = xp + 50
    updateAll(gainedXp)
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

      <h3>🔥 Streak : {streak} jour(s)</h3>
      {bonusXp > 0 && <p>🎁 Bonus quotidien : +{bonusXp} XP</p>}

      <h3>XP : {xp}</h3>
      <h3>Niveau : {level}</h3>

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

      <h3>🏅 Badges débloqués</h3>
      {badges.length === 0 && <p>Aucun badge pour le moment</p>}
      <div style={{ fontSize: 22 }}>
        {badges.map((b, i) => (
          <div key={i}>{b}</div>
        ))}
      </div>

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

