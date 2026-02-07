import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ token }) {
  const [player, setPlayer] = useState(null);
  const [skill, setSkill] = useState("");

  const load = async () => {
    const data = await api.getPlayer(token);
    setPlayer(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddSkill = async () => {
    if (!skill) return;

    try {
      await api.addSkill(token, skill);
      setSkill("");
      load();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de la skill");
    }
  };

  if (!player) return <div>Chargement...</div>;

  return (
    <div>
      <h1>🚀 SkillsBet connecté</h1>

      <h2>Joueur</h2>
      <p>XP: {player.xp}</p>
      <p>Niveau: {player.level}</p>

      <h2>Ajouter une skill</h2>
      <input
        type="text"
        placeholder="Nom de la skill"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />
      <button onClick={handleAddSkill}>
        Ajouter une skill
      </button>

      <h2>Liste des skills</h2>
      <ul>
        {player.skills.map((s, i) => (
          <li key={i}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}



