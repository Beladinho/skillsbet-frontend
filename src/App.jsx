import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/skills`);
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch skills:", err);
      setSkills([]);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, level }),
      });
      setName("");
      setLevel("Débutant");
      fetchSkills();
    } catch (err) {
      console.error("Erreur ajout skill:", err);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <form onSubmit={addSkill} style={{ marginBottom: 20 }}>
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
        {skills.length === 0 ? (
          <p>Aucune compétence pour le moment</p>
        ) : (
          skills.map((skill, i) => (
            <li key={i}>
              {skill.name} — {skill.level}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;

