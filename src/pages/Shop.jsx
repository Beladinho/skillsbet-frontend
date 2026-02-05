export default function Shop() {
  const shopItems = [
    { id: 1, name: "Double XP (1h)", price: 50, rarity: "common" },
    { id: 2, name: "Badge Stylé", price: 120, rarity: "rare" },
    { id: 3, name: "Titre VIP", price: 250, rarity: "epic" },
    { id: 4, name: "Skin Légendaire", price: 500, rarity: "legendary" },
    { id: 5, name: "Aura Mythique", price: 1000, rarity: "mythic" }
  ]

  const buyItem = (item) => {
    alert(`🛒 Achat de : ${item.name}`)
  }

  const cardStyle = {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🛍 Boutique</h2>

      {shopItems.map(item => (
        <div key={item.id} className={`rarity-${item.rarity}`} style={cardStyle}>
          <h3>{item.name}</h3>
          <p>Prix : {item.price} 💰</p>
          <p>Rareté : {item.rarity.toUpperCase()}</p>
          <button onClick={() => buyItem(item)}>Acheter</button>
        </div>
      ))}
    </div>
  )
}
