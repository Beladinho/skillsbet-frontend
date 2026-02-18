import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  // =========================
  // LOAD SKILLS
  // =========================
  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await api.getSkills();

      // sécurité anti-crash
      if (Array.isArray(data)) {
        setSkills(data);
      } else {
        console.error("Skills non valides:", data);
        setSkills([]);
      }
    } catch (err) {
      console.error("Erreur load skills:", err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // =========================
  // ADD SKILL
  // =========================
  const handleAddSkill = async () => {
    if (!name) {
      alert("Nom requis");
      return;
    }

    try {
      await api.addSkill(
        "dev-token", // token temporaire
        name,
        parseInt(level) || 1,
        category || "general"
      );

      setName("");
      setLevel("");
      setCategory("");

      await loadSkills();
    } catch (err) {
      console.error(err);
      alert("Erreur ajout skill");
    }
  };

  // =========================
  // UI
  // =========================
  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>🚀 SkillsBet Dashboard</h1>

      {/* ================= ADD ================= */}
      <h2>Ajouter une skill</h2>

      <input
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Level"
        type="number"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      />

      <input
        placeholder="Catégorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button onClick={handleAddSkill}>
        Ajouter
      </button>

      {/* ================= LIST ================= */}
      <h2>Liste des skills</h2>

      {skills.length === 0 ? (
        <p>Aucune skill</p>
      ) : (
        <ul>
          {skills.map((s) => (
            <li key={s.id}>
              {s.name} — lvl {s.level} — {s.category}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



