import { useEffect, useState } from "react";

const API = "https://skillsbet-production-37ae.up.railway.app";

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [category, setCategory] = useState("Frontend");
  const [stats, setStats] = useState({ total_xp: 0, level: 0, progress_percent: 0, badges: [] });

  const fetchSkills = async () => {
    const res = await fetch(`${API}/skills`);
    const data = await res.json();
    setSkills(data);
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchSkills();
    fetchStats();
  }, []);

  const addSkill = async () => {
    await fetch(`${API}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level, category }),
    });
    setName("");
    fetchSkills();
    fetchStats();
  };

  const deleteSkill = async (id: number) => {
    await fetch(`${API}/skills/${id}`, { method: "DELETE" });
    fetchSkills();
    fetchStats();
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🚀 SkillsBet</h1>

      <h2>Ajouter une compétence</h2>
      <input placeholder="Nom de la compétence" value={name} onChange={(e) => setName(e.target.value)} />
      <br /><br />

      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
        <option>Expert</option>
      </select>

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Frontend</option>
        <option>Backend</option>
        <option>DevOps</option>
        <option>Autre</option>
      </select>

      <br /><br />
      <button onClick={addSkill}>Ajouter</button>

      <h2>📊 Progression globale : Niveau {stats.level}</h2>
      <div style={{ background: "#ddd", width: 300, height: 20 }}>
        <div style={{ background: "green", width: `${stats.progress_percent}%`, height: "100%" }}></div>
      </div>
      <p>{stats.progress_percent}% vers le niveau suivant</p>

      <h2>🏆 Badges débloqués</h2>
      {stats.badges.length === 0 && <p>Aucun badge pour l’instant</p>}
      <ul>
        {stats.badges.map((b: string, i: number) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <h2>Compétences</h2>
      <ul>
        {skills.map((skill: any) => (
          <li key={skill.id}>
            {skill.name} — {skill.level} ({skill.category}){" "}
            <button onClick={() => deleteSkill(skill.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
