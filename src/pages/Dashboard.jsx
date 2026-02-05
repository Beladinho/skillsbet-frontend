import { useEffect, useState } from "react";

export default function Dashboard() {
  const [xp, setXp] = useState(Number(localStorage.getItem("xp")) || 100);

  useEffect(() => {
    function updateXp() {
      setXp(Number(localStorage.getItem("xp")) || 0);
    }

    window.addEventListener("xpUpdate", updateXp);
    return () => window.removeEventListener("xpUpdate", updateXp);
  }, []);

  const level = Math.floor(xp / 100) + 1;
  const xpForNextLevel = level * 100;
  const progress = Math.min((xp / xpForNextLevel) * 100, 100);

  return (
    <div style={{ padding: "30px" }}>
      <h1>🚀 SkillsBet connecté</h1>

      <h2>XP : {xp}</h2>
      <h2>Niveau : {level}</h2>

      <div style={{
        width: "300px",
        height: "20px",
        background: "#ddd",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "10px"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg, #4facfe, #00f2fe)"
        }} />
      </div>
    </div>
  );
}

