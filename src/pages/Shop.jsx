import { useEffect, useState } from "react"
import { api } from "../api"

export default function Shop({ userId }) {
  const [loading, setLoading] = useState(false)

  async function buyGems(amount) {
    setLoading(true)
    const res = await api.post("/stripe/create-session", {
      amount
    })

    window.location.href = res.data.url
  }

  return (
    <div>
      <h2>Boutique de gems</h2>

      <button onClick={() => buyGems(5)}>
        Acheter 5€ de gems
      </button>

      <button onClick={() => buyGems(10)}>
        Acheter 10€ de gems
      </button>

      <button onClick={() => buyGems(20)}>
        Acheter 20€ de gems
      </button>

      {loading && <p>Redirection vers le paiement…</p>}
    </div>
  )
}
