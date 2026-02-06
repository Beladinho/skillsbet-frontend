import { useEffect, useState } from "react";
import { getMe } from "../api";
import Notifications from "../components/Notifications";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <h1>🚀 SkillsBet connecté</h1>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        Se déconnecter
      </button>

      <p>XP : {user.xp}</p>
      <p>Niveau : {user.level}</p>

      <Notifications />
    </div>
  );
}

