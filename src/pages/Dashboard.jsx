import { useEffect, useState } from "react";
import { getStats, addSkill } from "../api";

export default function Dashboard({ token, setToken }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats(token);
      setStats(data);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  const handleAddSkill = async () => {
    await addSkill(token, {
      name: "React",
      level: "Débutant",
      category: "Frontend",
    });
    fetchStats();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div>
      <h2>🚀 SkillsBet connecté</h2>
      <button onClick={logout}>Se déconnecter</button>

      {stats && (
        <>
          <h3>XP: {stats.xp}</h3>
          <h3>Niveau: {stats.level}</h3>
          <button onClick={handleAddSkill}>Ajouter une skill</button>
        </>
      )}
    </div>
  );
}
