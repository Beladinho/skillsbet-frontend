import { useState } from "react"
import { api } from "../api"

export default function AddSkill({ token, onSkillAdded }) {
  const [name, setName] = useState("")
  const [level, setLevel] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const addSkill = async () => {
    if (!name || !level || !category) {
      alert("Remplis tous les champs")
      return
    }

    setLoading(true)

    try {
      await api(
        "/skills",
        "POST",
        {
          name: name.trim(),
          level: level.trim(),
          category: category.trim(),
        },
        token
      )

      alert("Compétence ajoutée 🚀")
      setName("")
      setLevel("")
      setCategory("")
      onSkillAdded()

    } catch (err) {
      console.error("ERREUR AJOUT SKILL :", err)
      alert("Erreur ajout compétence")
    }

    setLoading(false)
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Ajouter une compétence</h3>

      <input
        placeholder="Nom (ex: Python)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <input
        placeholder="Niveau (ex: Avancé)"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      />
      <br />

      <input
        placeholder="Catégorie (ex: Dev)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <br />

      <button onClick={addSkill} disabled={loading}>
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </div>
  )
}


