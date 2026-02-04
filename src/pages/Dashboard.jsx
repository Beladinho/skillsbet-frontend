import { useEffect, useState } from "react";
import { getSkills } from "../api";

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await getSkills();
        console.log("SKILLS:", data);

        setSkills(data);

        // ===== CALCUL XP =====
        let totalXp = 0;
        data.forEach(skill => {
          totalXp += skill.level * 10; // 10 XP par niveau
        });

        setXp(totalXp);

        // ===== CALCUL NIVEAU =====
        const lvl = Math.floor(totalXp / 100) + 1;
        setLevel(lvl);

      } catch (err) {
        console.error("Erreur chargement skills", err);
      }
    }

    loadSkills();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>🚀 SkillsBet connecté</h1>

      <h2>XP : {xp}</h2>
      <h2>Niveau : {level}</h2>

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

