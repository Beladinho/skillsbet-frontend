import { useState } from "react"

export default function Chest() {
  const [loot, setLoot] = useState(null)

  // 🎁 Récompenses avec rareté
  const rewards = [
    { name: "Petit boost XP", rarity: "common" },
    { name: "Badge spécial", rarity: "rare" },
    { name: "Titre exclusif", rarity: "epic" },
    { name: "Pouvoir secret", rarity: "legendary" },
    { name: "Artefact divin", rarity: "mythic" }
  ]

  // 🎲 Probabilités de rareté
  const rollRarity = () => {
    const r = Math.random()
    if (r < 0.5) return "common"
    if (r < 0.75) return "rare"
    if (r < 0.9) return "epic"
    if (r < 0.98) return "legendary"
    return "mythic"
  }

  // 🧰 Ouverture du coffre
  const openChest = () => {
    const rarity = rollRarity()
    const possible = rewards.filter(r => r.rarity === rarity)
    const reward = possible[Math.floor(Math.random() * possible.length)]
    setLoot(reward)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🎁 Coffre Mystère</h2>
      <button onClick={openChest}>Ouvrir un coffre</button>

      {loot && (
        <div
          className={`rarity-${loot.rarity}`}
          style={{
            padding: 16,
            borderRadius: 10,
            marginTop: 20,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 18
          }}
        >
          🎉 Tu as obtenu : {loot.name}
          <div style={{ fontSize: 14, marginTop: 6 }}>
            Rareté : {loot.rarity.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  )
}
