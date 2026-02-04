import { useEffect, useState } from "react";
import Login from "./components/Login";
import AddSkill from "./components/AddSkill";
import { api } from "./api";

export default function App() {
  const [user, setUser] = useState(null);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (!user) return <Login onLogin={loadProfile} />;

  return (
    <div>
      <h1>🚀 SkillsBet connecté</h1>
      <button onClick={logout}>Se déconnecter</button>
      <p>XP: {user.xp}</p>
      <p>Niveau: {user.level}</p>

      <AddSkill onSkillAdded={loadProfile} />
    </div>
  );
}


