import { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { api } from "../api"

export default function AddSkill({ onSkillAdded }) {
  const { token } = useContext(AuthContext)

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
      const payload = { name, level, category }

      console.log("ENVOI SKILL =>", payload)

      const data = await api("/skills", "POST", payload, token)

      console.log("REPONSE API =>", data)

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

      <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
      <br />

      <input placeholder="Niveau" value={level} onChange={e => setLevel(e.target.value)} />
      <br />

      <input placeholder="Catégorie" value={category} onChange={e => setCategory(e.target.value)} />
      <br />

      <button onClick={addSkill} disabled={loading}>
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </div>
  )
}

