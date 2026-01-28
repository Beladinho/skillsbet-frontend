import { useEffect, useState } from "react";

const API = "https://skillsbet-production-37ae.up.railway.app";

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [category, setCategory] = useState("Frontend");
  const [stats, setStats] = useState({ progress: 0 });

  const loadSkills = async () => {
    const res = await fetch(`${API}/skills`);
    const data = await res.json();
    setSkills(data);
  };

  const loadStats = async () => {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    loadSkills();
    loadStats();
  }, []);

  const addSkill = async () => {
    if (!name) return;

    await fetch(`${API}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level, category }),
    });

    setName("");
    loadSkills();
    loadStats();
  };

  const deleteSkill = async (id) => {
    await fetch(`${API}/skills/${id}`, { method: "DELETE" });
    loadSkills();
    loadStats();
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <h3>Nom de la compétence</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <h3>Niveau</h3>
      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
      </select>

      <h3>Catégorie</h3>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Frontend</option>
        <option>Backend</option>
        <option>DevOps</option>
        <option>Autre</option>
      </select>

      <br /><br />
      <button onClick={addSkill}>Ajouter</button>

      <h2>📊 Progression globale : {stats.progress}%</h2>

      <h2>Compétences</h2>
      {skills.map((skill) => (
        <div key={skill.id}>
          {skill.name} — {skill.level} ({skill.category})
          <button onClick={() => deleteSkill(skill.id)}> ❌</button>
        </div>
      ))}
    </div>
  );
}

export default App;
