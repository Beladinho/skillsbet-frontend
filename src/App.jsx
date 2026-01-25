import { useEffect, useState } from "react";

export default function App() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch("https://skillsbet-production-37ae.up.railway.app/skills")
      .then((res) => res.json())
      .then((data) => setSkills(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: "40px" }}>
      <h1>SkillsBet</h1>
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
