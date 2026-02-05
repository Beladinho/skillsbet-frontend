import { useState } from "react"

export default function Duel() {
  const [result, setResult] = useState(null)

  const startDuel = () => {
    const specialization = localStorage.getItem("specialization")
    let winChance = 0.5

    if (specialization === "⚔️ Guerrier") {
      winChance += 0.1
    }

    const win = Math.random() < winChance
    setResult(win ? "Victoire !" : "Défaite…")
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>⚔️ Duel</h2>
      <button onClick={startDuel}>Lancer un duel</button>
      {result && <p>Résultat : {result}</p>}
    </div>
  )
}
