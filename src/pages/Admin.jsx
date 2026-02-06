import { api } from "../api";

export default function Admin() {
  const addItem = async () => {
    await api.post("/admin/shop", null, {
      params: { name: "Épée", price: 100, rarity: "rare" }
    });
    alert("Item ajouté");
  };

  return <button onClick={addItem}>Ajouter item</button>;
}
