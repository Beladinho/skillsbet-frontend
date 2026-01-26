import { useEffect, useState } from "react";

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://skillsbet-production-37ae.up.railway.app/skills")
      .then(res => {
        if (!res.ok) {
          throw new Error("API not responding");
        }
        return res.json();
      })
      .then(data => {
        console.log("API RESPONSE:", data);
        setSkills(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("API ERROR:", err);
        setError("Impossible de charger les compétences");
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Chargement...</h2>;
  if (error) return <h2>{error}</h2>;

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

