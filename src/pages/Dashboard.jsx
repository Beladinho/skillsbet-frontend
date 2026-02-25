import { useEffect, useState } from "react"
import { fetchSkills, addSkill } from "../api"

export default function Dashboard() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "",
    category: "",
  })

  // ===============================
  // Charger les skills
  // ===============================
  useEffect(() => {
    loadSkills()
  }, [])

  async function loadSkills() {
    try {
      setLoading(true)
      const data = await fetchSkills()
      setSkills(data)
    } catch (e) {
      console.error("Fetch skills failed:", e)
      setError("Impossible de charger les skills")
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // Ajouter une skill
  // ===============================
  async function handleAddSkill(e) {
    e.preventDefault()

    if (!newSkill.name || !newSkill.level || !newSkill.category) {
      alert("Tous les champs sont obligatoires")
      return
    }

    try {
      await addSkill(newSkill)

      // Reset formulaire
      setNewSkill({
        name: "",
        level: "",
        category: "",
      })

      // Reload skills
      await loadSkills()
    } catch (e) {
      console.error("Add skill failed:", e)
      alert("Erreur lors de l'ajout de la skill")
    }
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Dashboard</h1>

      {/* LOADING */}
      {loading && <p>Chargement...</p>}

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LISTE DES SKILLS */}
      <h2>Mes Skills</h2>

      {skills.length === 0 && !loading ? (
        <p>Aucune skill enregistrée.</p>
      ) : (
        <ul>
          {skills.map((skill, index) => (
            <li key={index}>
              <strong>{skill.name}</strong> — {skill.level} ({skill.category})
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* FORMULAIRE AJOUT */}
      <h2>Ajouter une Skill</h2>

      <form onSubmit={handleAddSkill}>
        <div>
          <input
            type="text"
            placeholder="Nom"
            value={newSkill.name}
            onChange={(e) =>
              setNewSkill({ ...newSkill, name: e.target.value })
            }
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Niveau"
            value={newSkill.level}
            onChange={(e) =>
              setNewSkill({ ...newSkill, level: e.target.value })
            }
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Catégorie"
            value={newSkill.category}
            onChange={(e) =>
              setNewSkill({ ...newSkill, category: e.target.value })
            }
          />
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          Ajouter
        </button>
      </form>
    </div>
  )
}
    
