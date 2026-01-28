import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Débutant");

  const fetchSkills = () => {
    fetch(`${API_URL}/skills`)
      .then(res => res.json())
      .then(data => setSkills(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level }),
    }).then(() => {
      setName("");
      setLevel("Débutant");
      fetchSkills();
    });
  };

  const deleteSkill = (id) => {
    fetch(`${API_URL}/skills/${id}`, { method: "DELETE" })
      .then(() => fetchSkills());
  };

  const updateLevel = (skill) => {
    const next =
      skill.level === "Débutant"
        ? "Intermédiaire"
        : skill.level === "Intermédiaire"
        ? "Avancé"
        : "Débutant";

    fetch(`${API_URL}/skills/${skill.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: next }),
    }).then(() => fetchSkills());
  };

  // 🎯 Couleurs par niveau
  const levelColor = (lvl) => {
    if (lvl === "Avancé") return "#16a34a";
    if (lvl === "Intermédiaire") return "#f59e0b";
    return "#ef4444";
  };

  // 🔢 Score global
  const totalPoints = skills.reduce((acc, skill) => {
    if (skill.level === "Avancé") return acc + 3;
    if (skill.level === "Intermédiaire") return acc + 2;
    return acc + 1;
  }, 0);

  const maxPoints = skills.length * 3;
  const progress = maxPoints ? Math.round((totalPoints / maxPoints) * 100) : 0;

  // 📊 Tri : Avancé → Intermédiaire → Débutant
  const sortedSkills = [...skills].sort((a, b) => {
    const order = { "Avancé": 3, "Intermédiaire": 2, "Débutant": 1 };
    return order[b.level] - order[a.level];
  });

  return (
    <div style={{ padding: 30, fontFamily: "Arial", maxWidth: 600, margin: "auto" }}>
      <h1>🚀 SkillsBet</h1>

      <form onSubmit={addSkill} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nom de la compétence"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 8, marginRight: 8 }}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: 8 }}>
          <option>Débutant</option>
          <option>Intermédiaire</option>
          <option>Avancé</option>
        </select>
        <button type="submit" style={{ marginLeft: 10, padding: 8 }}>Ajouter</button>
      </form>

      {/* 📈 Progression */}
      <div style={{ marginBottom: 25 }}>
        <strong>Progression globale : {progress}%</strong>
        <div style={{
          height: 12,
          background: "#e5e7eb",
          borderRadius: 6,
          marginTop: 5
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: "#3b82f6",
            borderRadius: 6,
            transition: "0.3s"
          }} />
        </div>
      </div>

      <h2>Liste des compétences</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sortedSkills.map(skill => (
          <li key={skill.id} style={{
            marginBottom: 10,
            padding: 10,
            borderRadius: 8,
            background: "#f9fafb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>
              <b>{skill.name}</b> —{" "}
              <span
                onClick={() => updateLevel(skill)}
                style={{
                  cursor: "pointer",
                  color: levelColor(skill.level),
                  fontWeight: "bold"
                }}
              >
                {skill.level}
              </span>
            </span>
            <button onClick={() => deleteSkill(skill.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

