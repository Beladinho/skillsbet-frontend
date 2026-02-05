import { useEffect, useState } from "react"

export default function Dashboard() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [skill, setSkill] = useState("")
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(0)
  const [bonusXp, setBonusXp] = useState(0)
  const [quests, setQuests] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  const xpNeeded = [0, 100, 250, 500, 1000, 2000]

  useEffect(() => {
    const savedXp = parseInt(localStorage.getItem("xp")) || 0
    handleDailyStreak(savedXp)
    generateDailyQuests()
    generateLeaderboard(savedXp)
  }, [])

  const generateLeaderboard = (playerXp) => {
    const fakePlayers = [
      { name: "Alex", xp: 1800 },
      { name: "Sam", xp: 950 },
      { name: "Jordan", xp: 600 },
      { name: "Taylor", xp: 400 }
    ]

    const allPlayers = [...fakePlayers, { name: "Toi", xp: playerXp }]
      .sort((a, b) => b.xp - a.xp)

    setLeaderboard(allPlayers)
  }

  const generateDailyQuests = () => {
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem("questDate")

    if (savedDate === today) {
      setQuests(JSON.parse(localStorage.getItem("quests")) || [])
      return
    }

    const newQuests = [
      { id: 1, text: "Ajouter 1 compétence", done: false, reward: 30, type: "add1" },
      { id: 2, text: "Ajouter 3 compétences", done: false, reward: 80, type: "add3" },
      { id: 3, text: "Gagner 100 XP aujourd'hui", done: false, reward: 50, type: "xp100" }
    ]

    localStorage.setItem("quests", JSON.stringify(newQuests))
    localStorage.setItem("questDate", today)
    setQuests(newQuests)
  }

  const completeQuest = (id) => {
    const updated = quests.map(q => {
      if (q.id === id && !q.done) {
        updateAll(xp + q.reward)
        return { ...q, done: true }
      }
      return q
    })
    setQuests(updated)
    localStorage.setItem("quests", JSON.stringify(updated))
  }

  const handleDailyStreak = (currentXp) => {
    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem("lastLogin")
    let currentStreak = parseInt(localStorage.getItem("streak")) || 0
    let newXp = currentXp

    if (lastLogin !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastLogin === yesterday.toDateString()) currentStreak += 1
      else currentStreak = 1

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
    generateLeaderboard(newXp)

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
    const newXp = xp + 50
    updateAll(newXp)
    checkQuestProgress("add1")
    checkQuestProgress("add3")
    setSkill("")
  }

  const checkQuestProgress = (type) => {
    const updated = quests.map(q => {
      if (q.type === type && !q.done) {
        if (type === "add1") return { ...q, done: true }
        if (type === "add3") {
          const count = parseInt(localStorage.getItem("skillsAdded") || 0) + 1
          localStorage.setItem("skillsAdded", count)
          if (count >= 3) return { ...q, done: true }
        }
      }
      return q
    })
    setQuests(updated)
    localStorage.setItem("quests", JSON.stringify(updated))
  }

  const nextLevelXp = xpNeeded[level]
  const prevLevelXp = xpNeeded[level - 1]
  const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>🚀 SkillsBet connecté</h2>

      <h3>🔥 Streak : {streak} jour(s)</h3>
      {bonusXp > 0 && <p>🎁 Bonus quotidien : +{bonusXp} XP</p>}

      <h3>XP : {xp}</h3>
      <h3>Niveau : {level}</h3>

      <div style={{ background: "#ddd", borderRadius: 10, height: 20 }}>
        <div style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #00c6ff, #0072ff)",
          height: "100%",
          borderRadius: 10
        }} />
      </div>

      <hr />

      <h3>🏆 Classement</h3>
      {leaderboard.map((p, i) => (
        <div key={i}>
          {i === 0 && "🥇 "}
          {i === 1 && "🥈 "}
          {i === 2 && "🥉 "}
          #{i + 1} — {p.name} : {p.xp} XP
        </div>
      ))}

      <hr />

      <h3>🎯 Quêtes du jour</h3>
      {quests.map(q => (
        <div key={q.id}>
          <button disabled={q.done} onClick={() => completeQuest(q.id)}>
            {q.done ? "✅" : "🎯"} {q.text} (+{q.reward} XP)
          </button>
        </div>
      ))}

      <hr />

      <h3>🏅 Badges</h3>
      {badges.map((b, i) => <div key={i}>{b}</div>)}

      <hr />

      <h3>Ajouter une compétence</h3>
      <input value={skill} onChange={(e) => setSkill(e.target.value)} />
      <button onClick={addSkill}>Ajouter</button>
    </div>
  )
}

