import { useEffect, useState } from "react";
import { api } from "../api";

export default function Shop() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/shop").then(res => setItems(res.data));
  }, []);

  return (
    <div>
      <h2>Boutique</h2>
      {items.map(i => (
        <div key={i.id}>
          {i.name} ({i.rarity}) - {i.price}
        </div>
      ))}
    </div>
  );
}
