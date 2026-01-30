import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const API = import.meta.env.VITE_API_URL

export default function AuthPage() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const submit = async () => {
    setError("")
    try {
      const res = await fetch(API + (isLogin ? "/login" : "/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) throw new Error("Erreur auth")

      const data = await res.json()
      login(data.access_token)
    } catch (e) {
      setError("Identifiants invalides")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🔐 SkillsBet</h1>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <button onClick={submit}>
        {isLogin ? "Connexion" : "Créer un compte"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin ? "Créer un compte" : "Déjà un compte ? Login"}
      </p>
    </div>
  )
}
