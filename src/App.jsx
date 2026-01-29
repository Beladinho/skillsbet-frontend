import { useEffect, useState } from "react";
import Login from "./Login";
import { apiRequest, getToken, logout } from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [category, setCategory] = useState("Frontend");

  const loadSkills = async () => {
    const data = await apiRequest("/skills");
    setSkills(data);
  };

  useEffect(() => {
    if (loggedIn) loadSkills();
  }, [loggedIn]);

  const addSkill = async () => {
    await apiRequest("/skills", "POST", { name, level, category });
    setName("");
    loadSkills();
  };

  const deleteSkill = async (id) => {
    await apiRequest(`/skills/${id}`, "DELETE");
    loadSkills();
  };

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{ maxWidth: 500, margin: "auto", textAlign: "center" }}>
      <h1>🚀 SkillsBet</h1>

      <button onClick={() => { logout(); setLoggedIn(false); }}>
        Se déconnecter
      </button>

      <h3>Nouvelle compétence</h3>
      <input
        placeholder="Nom de la compétence"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br /><br />

      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
        <option>Expert</option>
      </select><br /><br />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Frontend</option>
        <option>Backend</option>
        <option>DevOps</option>
        <option>Design</option>
        <option>Autre</option>
      </select><br /><br />

      <button onClick={addSkill}>Ajouter</button>

      <h3>Compétences</h3>
      {skills.map((s) => (
        <div key={s.id}>
          {s.name} — {s.level} ({s.category})
          <button onClick={() => deleteSkill(s.id)}>❌</button>
        </div>
      ))}
    </div>
  );
}

