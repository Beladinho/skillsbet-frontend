import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");

  // 🔄 Charger les compétences
  const fetchSkills = async () => {
    const res = await fetch(`${API_URL}/skills`);
    const data = await res.json();
    setSkills(data);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // ➕ Ajouter une compétence
  const addSkill = async () => {
    if (!name) return;

    await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level }),
    });

    setName("");
    fetchSkills();
  };

  // ❌ Supprimer une compétence
  const deleteSkill = async (id) => {
    await fetch(`${API_URL}/skills/${id}`, {
      method: "DELETE",
    });

    fetchSkills();
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <h2>Nouvelle compétence</h2>
      <input
        placeholder="Nom de la compétence"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
      </select>

      <button onClick={addSkill}>Ajouter</button>

      <h2>Liste des compétences</h2>
      <ul>
        {skills.map((skill) => (
          <li key={skill.id}>
            {skill.name} — {skill.level}
            <button
              onClick={() => deleteSkill(skill.id)}
              style={{ marginLeft: "10px" }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

