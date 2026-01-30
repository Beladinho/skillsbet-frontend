import { useState } from "react"
import { apiFetch } from "../api"

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      if (isRegister) {
        const res = await apiFetch("/register", {
          method: "POST",
          body: JSON.stringify({ username, password })
        })
        if (res.detail) throw new Error(res.detail)
      }
      const loginRes = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      })
      localStorage.setItem("token", loginRes.access_token)
      onLogin()
    } catch (err) {
      setError(err.message || "Identifiants invalides")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{isRegister ? "Créer un compte" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">{isRegister ? "Créer un compte" : "Se connecter"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Déjà un compte ? Login" : "Créer un compte"}
      </button>
    </div>
  )
}
