import { useState } from "react"
import { api } from "../api"

export default function Auth({ setToken }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const data = isLogin
      ? await api.login(username, password)
      : await api.register(username, password)

    if (data.access_token) {
      localStorage.setItem("token", data.access_token)
      setToken(data.access_token)
    } else {
      setError(data.detail || data.error || "Erreur")
    }
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Connexion" : "Inscription"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          {isLogin ? "Se connecter" : "Créer un compte"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin
          ? "Pas de compte ? S'inscrire"
          : "Déjà un compte ? Se connecter"}
      </p>
    </div>
  )
}
