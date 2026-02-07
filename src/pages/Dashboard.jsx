import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const userId = "demo";

  const [player, setPlayer] = useState(null);
  const [shop, setShop] = useState([]);
  const [fightResult, setFightResult] = useState(null);
  const [chestReward, setChestReward] = useState(null);

  const load = async () => {
    await api.init(userId);
    const data = await api.getPlayer(userId);
    const shopData = await api.getShop();

    setPlayer(data);
    setShop(shopData);
  };

  useEffect(() => {
    load();
  }, []);

  const fight = async () => {
    const res = await api.fight(userId);
    setFightResult(res);
    load();
  };

  const buy = async (itemId) => {
    await api.buy(userId, itemId);
    load();
  };

  const openChest = async () => {
    const res = await api.openChest(userId);
    setChestReward(res.reward);
    load();
  };

  if (!player) return <div>Chargement...</div>;

  return (
    <div>
      <h1>🚀 SkillsBet</h1>

      <h2>Joueur</h2>
      <p>XP: {player.xp}</p>
      <p>Niveau: {player.level}</p>
      <p>HP: {player.hp}</p>
      <p>Coins: {player.coins}</p>
      <p>Gems: {player.gems}</p>

      <h2>⚔️ Combat PvE</h2>
      <button onClick={fight}>Combattre un monstre</button>
      {fightResult && (
        <div>
          Résultat: {fightResult.result} contre {fightResult.monster}
        </div>
      )}

      <h2>🛒 Boutique</h2>
      {shop.map((item) => (
        <div key={item.id}>
          {item.name} - {item.price} coins
          <button onClick={() => buy(item.id)}>Acheter</button>
        </div>
      ))}

      <h2>🎁 Coffre (5 gems)</h2>
      <button onClick={openChest}>Ouvrir un coffre</button>
      {chestReward && (
        <div>
          Récompense: {JSON.stringify(chestReward)}
        </div>
      )}

      <h2>🎒 Inventaire</h2>
      <ul>
        {player.inventory.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}


