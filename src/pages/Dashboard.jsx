import { useEffect, useState } from "react"

export default function Dashboard() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [skill, setSkill] = useState("")
  const [skills, setSkills] = useState([])
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(0)
  const [bonusXp, setBonusXp] = useState(0)
  const [quests, setQuests] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [lootMessage, setLootMessage] = useState("")
  const [duelMessage, setDuelMessage] = useState("")

  const xpNeeded = [0, 100, 250, 500, 1000, 2000]

  useEffect(() => {
    const savedXp = parseInt(localStorage.getItem("xp")) || 0
    const savedSkills = JSON.parse(localStorage.getItem("skills")) || []
    setSkills(savedSkills)
    handleDailyStreak(savedXp)
    generateDailyQuests()
    generateLeaderboard(savedXp)
  }, [])

  // 🎲 Rareté
  const rarityRoll = () => {
    const r = Math.random()
    if (r < 0.5) return { label: "Commune", xp: 40, color: "#aaa" }
    if (r < 0.8) return { label: "Rare", xp: 80, color: "#3b82f6" }
    if (r < 0.95) return { label: "Épique", xp: 150, color: "#a855f7" }
    return { label: "Légendaire", xp: 300, color: "#facc15" }
  }

  const addSkill = () => {
    if (!skill) return
    const rarity = rarityRoll()
    const newSkill = { name: skill, ...rarity }

    const updatedSkills = [...skills, newSkill]
    setSkills(updatedSkills)
    localStorage.setItem("skills", JSON.stringify(updatedSkills))

    updateAll(xp + rarity.xp)
    setSkill("")
  }

  // 🎁 Coffre
  const openChest = () => {
    const roll = Math.random()
    let reward = 0
    let message = ""

    if (roll < 0.1) { reward = 150; message = "💎 JACKPOT ! +150 XP" }
    else if (roll < 0.35) { reward = 80; message = "⚡ Boost ! +80 XP" }
    else if (roll < 0.75) { reward = 40; message = "📦 Récompense commune +40 XP" }
    else { message = "😢 Coffre vide…" }

    if (reward > 0) updateAll(xp + reward)
    setLootMessage(message)
    setTimeout(() => setLootMessage(""), 4000)
  }

  // ⚔️ DUEL SYSTEM
  const startDuel = () => {
    const playerPower = level * 20 + Math.random() * 50
    const enemyPower = Math.random() * 120

    if (playerPower > enemyPower) {
      const reward = 100
      updateAll(xp + reward)
      setDuelMessage(`🏆 Victoire ! Tu gagnes ${reward} XP`)
    } else {
      setDuelMessage("💀 Défaite… Entraîne-toi et reviens plus fort !")
    }

    setTimeout(() => setDuelMessage(""), 5000)
  }

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
      { id: 1, text: "Ajouter 1 compétence", done: false, reward: 30 },
      { id: 2, text: "Ouvrir 1 coffre", done: false, reward: 50 }
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

      <h3>⚔️ Arène de duel</h3>
      <button onClick={startDuel}>Combattre un adversaire</button>
      {duelMessage && <p><strong>{duelMessage}</strong></p>}

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

      <h3>🎁 Coffre mystère</h3>
      <button onClick={openChest}>Ouvrir un coffre</button>
      {lootMessage && <p><strong>{lootMessage}</strong></p>}

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

      <h3>🧬 Mes compétences</h3>
      {skills.map((s, i) => (
        <div key={i} style={{ color: s.color }}>
          {s.name} — {s.label} (+{s.xp} XP)
        </div>
      ))}

      <h3>Ajouter une compétence</h3>
      <input value={skill} onChange={(e) => setSkill(e.target.value)} />
      <button onClick={addSkill}>Ajouter</button>
    </div>
  )
}

