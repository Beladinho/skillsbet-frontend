import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [token, setToken] = useState("");

  // ⚠️ temp — token manuel pour test
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const load = async () => {
    try {
      const data = await api.getSkills();
      setSkills(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddSkill = async () => {
    if (!skillName || !skillLevel || !skillCategory) {
      alert("Remplis tous les champs");
      return;
    }

    try {
      await api.addSkill(token, skillName, skillLevel, skillCategory);
      setSkillName("");
      setSkillLevel("");
      setSkillCategory("");
      load();
    } catch (err) {
      console.error(err);
      alert("Erreur ajout skill");
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Ajouter une skill</h3>

      <input
        placeholder="Nom"
        value={skillName}
        onChange={(e) => setSkillName(e.target.value)}
      />

      <input
        placeholder="Level"
        value={skillLevel}
        onChange={(e) => setSkillLevel(e.target.value)}
      />

      <input
        placeholder="Catégorie"
        value={skillCategory}
        onChange={(e) => setSkillCategory(e.target.value)}
      />

      <button onClick={handleAddSkill}>
        Ajouter
      </button>

      <h3>Liste des skills</h3>

      <ul>
        {skills?.map((s, i) => (
          <li key={i}>
            {s.name} — lvl {s.level} — {s.category}
          </li>
        ))}
      </ul>
    </div>
  );
}



