import { useState } from "react";
import { api } from "../api";

export default function AddSkill() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.addSkill(name, level, category);
      alert("Compétence ajoutée !");
      setName("");
      setLevel("");
      setCategory("");
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    }
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
        type="number"
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


