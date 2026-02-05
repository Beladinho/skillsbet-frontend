import { useEffect, useState } from "react"

export default function SkillTree() {
  const [specialization, setSpecialization] = useState(
    localStorage.getItem("specialization") || null
  )

  const chooseSpec = (spec) => {
    if (specialization) return alert("Spécialisation déjà choisie !")
    localStorage.setItem("specialization", spec)
    setSpecialization(spec)
  }

  const resetSpec = () => {
    localStorage.removeItem("specialization")
    setSpecialization(null)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🌳 Arbre de Compétences</h2>

      {specialization ? (
        <>
          <h3>Spécialisation actuelle :</h3>
          <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            {specialization}
          </div>
          <button onClick={resetSpec}>Réinitialiser</button>
        </>
      ) : (
        <>
          <p>Choisis une voie :</p>

          <div style={card}>
            <h3>🧠 Stratège</h3>
            <p>+20% XP sur les quêtes</p>
            <button onClick={() => chooseSpec("🧠 Stratège")}>Choisir</button>
          </div>

          <div style={card}>
            <h3>⚔️ Guerrier</h3>
            <p>+10% chance de gagner un duel</p>
            <button onClick={() => chooseSpec("⚔️ Guerrier")}>Choisir</button>
          </div>

          <div style={card}>
            <h3>🎯 Expert</h3>
            <p>Compétences montent 2× plus vite</p>
            <button onClick={() => chooseSpec("🎯 Expert")}>Choisir</button>
          </div>
        </>
      )}
    </div>
  )
}

const card = {
  border: "1px solid #ccc",
  padding: 15,
  marginBottom: 15,
  borderRadius: 8
}
