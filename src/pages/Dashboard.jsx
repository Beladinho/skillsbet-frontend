import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ token }) {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    try {
      const data = await api.getSkills();
      if (Array.isArray(data)) setSkills(data);
      else setSkills([]);
    } catch (e) {
      console.error(e);
      setSkills([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name) return;

    await api.addSkill(token, {
      name,
      level: Number(level),
      category,
    });

    setName("");
    setLevel("");
    setCategory("");
    load();
  };

  return (
    <div>
      <h2>🚀 Tableau de bord SkillsBet</h2>

      <h3>Ajouter une compétence</h3>

      <input
        placeholder="Nom"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Niveau"
        value={level}
        onChange={e => setLevel(e.target.value)}
      />

      <input
        placeholder="Catégorie"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />

      <button onClick={add}>Ajouter</button>

      <h3>Liste des compétences</h3>

      {skills.length === 0 && <p>Aucune compétence</p>}

      <ul>
        {skills.map(s => (
          <li key={s.id}>
            {s.name} — lvl {s.level} — {s.category}
          </li>
        ))}
      </ul>
    </div>
  );
}



