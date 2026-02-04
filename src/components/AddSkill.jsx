import { useState } from "react";
import { api } from "../api";

export default function AddSkill({ token }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.addSkill(token, { name, level, category });

    setName("");
    setLevel("");
    setCategory("");
    alert("Skill ajoutée !");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Niveau"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      />
      <input
        placeholder="Catégorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button type="submit">Ajouter</button>
    </form>
  );
}


