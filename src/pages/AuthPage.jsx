import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL

export default function AuthPage() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const endpoint = isLogin ? "/login" : "/register"

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.access_token) {
      login(data.access_token)
    } else {
      alert(data.detail || "Erreur")
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>🔐 SkillsBet {isLogin ? "Login" : "Register"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button type="submit">
          {isLogin ? "Se connecter" : "Créer un compte"}
        </button>
      </form>

      <br />
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "S'inscrire" : "J'ai déjà un compte"}
      </button>
    </div>
  )
}
