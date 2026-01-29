import { useState } from "react"
import { createUser } from "./api"

export default function UserGate({ onLogin }) {
  const [username, setUsername] = useState("")

  const handleStart = async () => {
    if (!username) return
    const user = await createUser(username)
    localStorage.setItem("user_id", user.id)
    onLogin(user)
  }

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>🎮 Bienvenue sur SkillsBet</h1>
      <p>Choisis ton pseudo de joueur</p>
      <input
        placeholder="Pseudo"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br /><br />
      <button onClick={handleStart}>Entrer dans le jeu</button>
    </div>
  )
}
