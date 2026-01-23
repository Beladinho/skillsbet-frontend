import { useEffect, useState } from "react";

type Skill = {
  id: number;
  name: string;
  level: string;
};

function App() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  fetch(`${import.meta.env.VITE_API_URL}/api/skills`)
    .then(res => res.json())
    .then(data => setSkills(data.skills))
    .catch(err => console.error(err));
}, []);

  return (
    <div>
      <h1>SkillsBet</h1>
      <ul>
        {skills.map((skill) => (
          <li key={skill.id}>
            {skill.name} — {skill.level}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;







