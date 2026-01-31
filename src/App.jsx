import { useContext, useEffect, useState } from "react"
import { AuthContext } from "./context/AuthContext"
import { api } from "./api"

function App() {
  const { token, login, register, logout } = useContext(AuthContext)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [skillName, setSkillName] = useState("")
  const [skillLevel, setSkillLevel] = useState("Débutant")
  const [category, setCategory] = useState("Frontend")

  const [stats, setStats] = useState(null)
  const [badges, setBadges] = useState([])

  const loadStats = async () => {
    const data = await api("/stats")
    setStats(data)
  }

  const loadBadges = async () => {
    const data = await api("/badges")
    setBadges(data)
  }

  const addSkill = async () => {
    await api("/skills", "POST", {
      name: skillName,
      level: skillLevel,
      category,
    })
    setSkillName("")
    loadStats()
    loadBadges()
  }

  useEffect(() => {
    if (token) {
      loadStats()
      loadBadges()
    }
  }, [token])

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h1>🔐 SkillsBet</h1>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
        <br /><br />
        <button onClick={() => login(username, password)}>Connexion</button>
        <button onClick={() => register(username, password)}>Créer un compte</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🚀 SkillsBet connecté</h1>
      <button onClick={logout}>Se déconnecter</button>

      {stats && (
        <>
          <h2>Niveau {stats.level}</h2>
          <p>XP: {stats.xp}</p>
          <progress value={stats.progress} max="100"></progress>
        </>
      )}

      <h3>Ajouter une compétence</h3>
      <input value={skillName} onChange={e => setSkillName(e.target.value)} placeholder="Nom compétence" />
      <button onClick={addSkill}>Ajouter</button>

      <h3>🏆 Badges</h3>
      {badges.map((b, i) => (
        <div key={i}>{b.icon} {b.name}</div>
      ))}
    </div>
  )
}

export default App

