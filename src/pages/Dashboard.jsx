// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    try {
      const data = await api.getSkills();
      setSkills(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch skills failed:", e);
      setSkills([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name || !level || !category) return;

    try {
      await api.addSkill({ name, level: Number(level), category });
      setName("");
      setLevel("");
      setCategory("");
      load();
    } catch (e) {
      console.error("Add skill failed:", e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🚀 Tableau de bord SkillsBet</h2>

      <h3>Ajouter une compétence</h3>
      <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Niveau" value={level} onChange={e => setLevel(e.target.value)} />
      <input placeholder="Catégorie" value={category} onChange={e => setCategory(e.target.value)} />
      <button onClick={add}>Ajouter</button>

      <h3>Liste des compétences</h3>
      {skills.length === 0 ? (
        <p>Aucune compétence</p>
      ) : (
        <ul>
          {skills.map(s => (
            <li key={s.id}>{s.name} — lvl {s.level} — {s.category}</li>
          ))}
        </ul>
      )}
    </div>
  );
}



