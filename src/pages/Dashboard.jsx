import { useEffect, useState } from "react";
import AddSkill from "../components/AddSkill";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard({ token, setToken }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setStats(data);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    }
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

          {/* 👇 FORMULAIRE D’AJOUT DE SKILL */}
          <AddSkill token={token} onSkillAdded={fetchStats} />
        </>
      )}
    </div>
  );
}

