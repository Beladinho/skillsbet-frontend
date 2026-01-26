import { useEffect, useState } from "react";

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");

  const API_URL = "https://skillsbet-production-37ae.up.railway.app";

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
      .then(res => res.json())
      .then(() => {
        setName("");
        setLevel("Débutant");
        fetchSkills(); // refresh list
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <form onSubmit={addSkill} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nouvelle compétence"
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

      <ul>
        {skills.map((skill, index) => (
          <li key={index}>
            {skill.name} — {skill.level}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

