import { useEffect, useState } from "react";

function App() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch("https://skillsbet-production-37ae.up.railway.app/skills")
      .then(res => res.json())
      .then(data => {
        console.log("API RESPONSE:", data);
        setSkills(data); // ⚠️ on met data DIRECT, pas data.skills
      })
      .catch(err => console.error("API ERROR:", err));
  }, []);

  return (
    <div>
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

export default App;

