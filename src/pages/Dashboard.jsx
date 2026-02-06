import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then(res => setData(res.data));
  }, []);

  if (!data) return <div>Chargement...</div>;

  return (
    <div>
      <h1>🚀 SkillsBet connecté</h1>
      <p>XP : {data.xp}</p>
      <p>Niveau : {data.level}</p>
      <p>Premium : {data.premium ? "⭐" : "❌"}</p>
    </div>
  );
}

