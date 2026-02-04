import { useState } from "react";
import { api } from "../api";

export default function AddSkill({ onSkillAdded }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addSkill(name, level, category);
      setName("");
      setLevel(1);
      setCategory("");
      onSkillAdded();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Ajouter une skill</h3>

      <input
        placeholder="Nom de la skill"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="number"
        min="1"
        max="100"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        required
      />

      <input
        placeholder="Catégorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <button type="submit">Ajouter</button>
    </form>
  );
}


