import { useEffect, useState } from "react";

function App() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch("https://skillsbet-production-37ae.up.railway.app/skills")
      .then(res => res.json())
      .then(data => setSkills(data.skills))
      .catch(err => console.error("API ERROR:", err));
  }, []);

  return (
    <div>
      <h1>SkillsBet</h1>
      <ul>
        {skills.map(skill => (
          <li key={skill.id}>
            {skill.name} — {skill.level}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

