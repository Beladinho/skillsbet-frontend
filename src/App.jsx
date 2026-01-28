import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");

  const fetchSkills = () => {
    fetch(`${API_URL}/skills`)
      .then(res => res.json())
      .then(data => setSkills(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level }),
    })
      .then(() => {
        setName("");
        setLevel("Débutant");
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

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <form onSubmit={addSkill}>
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
        <button type="submit">Ajouter</button>
      </form>

      <h2>Liste des compétences</h2>
      <ul>
        {skills.map(skill => (
          <li key={skill.id}>
            <b>{skill.name}</b> —{" "}
            <span
              onClick={() => updateLevel(skill)}
              style={{ cursor: "pointer", color: "blue" }}
            >
              {skill.level}
            </span>{" "}
            <button onClick={() => deleteSkill(skill.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

