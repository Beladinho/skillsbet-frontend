import { useEffect, useState } from "react"

export default function Dashboard() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [titles, setTitles] = useState([])
  const [duelsWon, setDuelsWon] = useState(parseInt(localStorage.getItem("duelsWon")) || 0)
  const [chestsOpened, setChestsOpened] = useState(parseInt(localStorage.getItem("chestsOpened")) || 0)
  const [legendarySkills, setLegendarySkills] = useState(parseInt(localStorage.getItem("legendarySkills")) || 0)
  const [streak, setStreak] = useState(parseInt(localStorage.getItem("streak")) || 0)

  const unlockTitle = (title) => {
    if (!titles.includes(title)) {
      const updated = [...titles, title]
      setTitles(updated)
      localStorage.setItem("titles", JSON.stringify(updated))
    }
  }

  useEffect(() => {
    setTitles(JSON.parse(localStorage.getItem("titles")) || [])
  }, [])

  useEffect(() => {
    if (duelsWon >= 5) unlockTitle("🥊 Combattant")
    if (duelsWon >= 20) unlockTitle("⚔️ Maître des Duels")
    if (legendarySkills >= 1) unlockTitle("💎 Chasseur de Légendes")
    if (chestsOpened >= 10) unlockTitle("📦 Pilleur de Coffres")
    if (streak >= 7) unlockTitle("🔥 Survivant")
    if (xp >= 2000) unlockTitle("👑 Légende Vivante")
  }, [duelsWon, legendarySkills, chestsOpened, streak, xp])

  const winDuel = () => {
    const wins = duelsWon + 1
    setDuelsWon(wins)
    localStorage.setItem("duelsWon", wins)
  }

  const openChest = () => {
    const count = chestsOpened + 1
    setChestsOpened(count)
    localStorage.setItem("chestsOpened", count)
  }

  const gainLegendary = () => {
    const count = legendarySkills + 1
    setLegendarySkills(count)
    localStorage.setItem("legendarySkills", count)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🎖️ Titres débloqués</h2>
      {titles.length === 0 && <p>Aucun titre pour le moment</p>}
      {titles.map((t, i) => (
        <div key={i} style={{ fontWeight: "bold", margin: "4px 0" }}>{t}</div>
      ))}

      <hr />

      <h3>🔧 Simulateurs (déclenchement auto via jeu)</h3>
      <button onClick={winDuel}>Simuler victoire duel</button>
      <button onClick={openChest}>Simuler coffre</button>
      <button onClick={gainLegendary}>Simuler compétence légendaire</button>
      <button onClick={() => setXp(xp + 500)}>+500 XP</button>

      <hr />
      <p>Duel gagnés : {duelsWon}</p>
      <p>Coffres ouverts : {chestsOpened}</p>
      <p>Compétences légendaires : {legendarySkills}</p>
      <p>Streak : {streak} jours</p>
      <p>XP : {xp}</p>
    </div>
  )
}

