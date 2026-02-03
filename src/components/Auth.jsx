import { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export default function Auth() {
  const { login, register } = useContext(AuthContext)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isRegister) {
      await register(username, password)
    } else {
      await login(username, password)
    }
  }

  return (
    <div>
      <h2>{isRegister ? "Créer un compte" : "Connexion"}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">{isRegister ? "S'inscrire" : "Se connecter"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Déjà un compte ?" : "Créer un compte"}
      </button>
    </div>
  )
}

