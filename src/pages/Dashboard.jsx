import { useEffect, useState } from "react";
import Challenges from "./Challenges";

export default function Dashboard() {
  const [skills, setSkills] = useState([
    { name: "Football", level: 5, category: "Sport" },
    { name: "React", level: 4, category: "Tech" }
  ]);

  const [xp, setXp] = useState(90);
  const [level, setLevel] = useState(1);

  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] = useState(1);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLevel(Math.floor(xp / 100) + 1);
  }, [xp]);

  function handleAddSkill() {
    const newSkill = { name, level: skillLevel, category };
    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);

    let totalXp = 0;
    updatedSkills.forEach(skill => {
      totalXp += skill.level * 10;
    });

    setXp(totalXp);

    setName("");
    setSkillLevel(1);
    setCategory("");
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
        placeholder="Catégorie"
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

      <Challenges skills={skills} xp={xp} setXp={setXp} />
    </div>
  );
}

