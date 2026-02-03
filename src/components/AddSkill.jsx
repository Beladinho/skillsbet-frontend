import { useState } from "react"
import { api } from "../api"

export default function AddSkill({ token, onSkillAdded }) {
  const [name, setName] = useState("")
  const [level, setLevel] = useState("")
  const [category, setCategory] = useState("")

  const addSkill = async () => {
    if (!name || !level || !category) return alert("Remplis tous les champs")

    await api("/skills", "POST", { name, level, category }, token)

    setName("")
    setLevel("")
    setCategory("")
    onSkillAdded()
  }

  return (
    <div>
      <h3>Ajouter une compétence</h3>
      <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Niveau" value={level} onChange={e => setLevel(e.target.value)} />
      <input placeholder="Catégorie" value={category} onChange={e => setCategory(e.target.value)} />
      <button onClick={addSkill}>Ajouter</button>
    </div>
  )
}


