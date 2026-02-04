import { useEffect, useState } from "react";
import { getSkills, addSkill } from "../api";

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] = useState(1);
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      const data = await getSkills();
      setSkills(data);

      let totalXp = 0;
      data.forEach(skill => {
        totalXp += skill.level * 10;
      });

      setXp(totalXp);
      setLevel(Math.floor(totalXp / 100) + 1);

    } catch (err) {
      console.error("Erreur chargement skills", err);
    }
  }

  async function handleAddSkill() {
    try {
      await addSkill(name, skillLevel, category);

      // Ajout local temporaire (pour voir l'effet même si API bug)
      const newSkill = { name, level: skillLevel, category };
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);

      let totalXp = 0;
      updatedSkills.forEach(skill => {
        totalXp += skill.level * 10;
      });

      setXp(totalXp);
      setLevel(Math.floor(totalXp / 100) + 1);

      setName("");
      setSkillLevel(1);
      setCategory("");

    } catch (err) {
      console.error("Erreur ajout skill", err);
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>🚀 SkillsBet connecté</h1>

      <h2>XP : {xp}</h2>
      <h2>Niveau : {level}</h2>

      <h3>➕ Ajouter une compétence</h3>

      <input
        placeholder="Nom de la compétence"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        type="number"
        min="1"
        max="10"
        value={skillLevel}
        onChange={e => setSkillLevel(Number(e.target.value))}
      />

      <input
        placeholder="Catégorie (ex: Sport, Tech...)"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />

      <button onClick={handleAddSkill}>Ajouter</button>

      <h3>📚 Mes compétences</h3>
      <ul>
        {skills.map((skill, index) => (
          <li key={index}>
            {skill.name} — Niveau {skill.level} ({skill.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

