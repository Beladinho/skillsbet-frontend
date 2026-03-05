import { useEffect, useState } from "react";
import { fetchSkills, addSkill } from "../utils/api";

export default function Dashboard({ token }) {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await fetchSkills(token);
        setSkills(data);
      } catch (error) {
        console.error("Error loading skills:", error);
      }
    }

    if (token) {
      loadSkills();
    }
  }, [token]);

  const handleAddSkill = async () => {
    if (!name) return;

    try {
      const newSkill = await addSkill({ name }, token);
      setSkills([...skills, newSkill]);
      setName("");
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  return (
    <div>
      <h2>Your Skills</h2>

      <ul>
        {skills.map((skill) => (
          <li key={skill.id}>{skill.name}</li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="New skill"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleAddSkill}>Add Skill</button>
    </div>
  );
}
    
