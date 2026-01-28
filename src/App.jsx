import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [category, setCategory] = useState("Frontend");
  const [filter, setFilter] = useState("Toutes");

  const fetchSkills = () => {
    fetch(`${API_URL}/skills`)
      .then(res => res.json())
      .then(data => setSkills(data));
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level, category }),
    }).then(() => {
      setName("");
      fetchSkills();
    });
  };

  const deleteSkill = (id) => {
    fetch(`${API_URL}/skills/${id}`, { method: "DELETE" })
      .then(() => fetchSkills());
  };

  const updateLevel = (skill) => {
    const next =
      skill.level === "Débutant"
        ? "Intermédiaire"
        : skill.level === "Intermédiaire"
        ? "Avancé"
        : "Débutant";

    fetch(`${API_URL}/skills/${skill.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: next }),
    }).then(() => fetchSkills());
  };

  const categories = ["Toutes", ...new Set(skills.map(s => s.category))];

  const filteredSkills =
    filter === "Toutes" ? skills : skills.filter(s => s.category === filter);

  return (
    <div style={{ padding: 30, fontFamily: "Arial", maxWidth: 700, margin: "auto" }}>
      <h1>🚀 SkillsBet</h1>

      <form onSubmit={addSkill} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nom de la compétence"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>Débutant</option>
          <option>Intermédiaire</option>
          <option>Avancé</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Frontend</option>
          <option>Backend</option>
          <option>DevOps</option>
          <option>Autre</option>
        </select>
        <button type="submit">Ajouter</button>
      </form>

      <h3>Filtrer par catégorie</h3>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        {categories.map(cat => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      <h2>Compétences</h2>
      <ul>
        {filteredSkills.map(skill => (
          <li key={skill.id}>
            <b>{skill.name}</b> — {skill.level} ({skill.category})
            <button onClick={() => updateLevel(skill)}>⬆️</button>
            <button onClick={() => deleteSkill(skill.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
