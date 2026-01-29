import { useEffect, useState } from "react"

const API = "https://skillsbet-production-37ae.up.railway.app"

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [skills, setSkills] = useState([])
  const [name, setName] = useState("")
  const [level, setLevel] = useState("Débutant")
  const [category, setCategory] = useState("Frontend")
  const [stats, setStats] = useState(null)

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  })

  const fetchSkills = async () => {
    const res = await fetch(API + "/skills", { headers: authHeaders() })
    const data = await res.json()
    setSkills(data)
  }

  const fetchStats = async () => {
    const res = await fetch(API + "/stats", { headers: authHeaders() })
    const data = await res.json()
    setStats(data)
  }

  useEffect(() => {
    if (token) {
      fetchSkills()
      fetchStats()
    }
  }, [token])

  const register = async () => {
    const res = await fetch(API + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    localStorage.setItem("token", data.access_token)
    setToken(data.access_token)
  }

  const login = async () => {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    localStorage.setItem("token", data.access_token)
    setToken(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setSkills([])
    setStats(null)
  }

  const addSkill = async () => {
    await fetch(API + "/skills", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, level, category }),
    })
    setName("")
    fetchSkills()
    fetchStats()
  }

  const deleteSkill = async (id) => {
    await fetch(API + "/skills/" + id, {
      method: "DELETE",
      headers: authHeaders(),
    })
    fetchSkills()
    fetchStats()
  }

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h1>🔐 SkillsBet Login</h1>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={login}>Se connecter</button>
        <button onClick={register} style={{ marginLeft: 10 }}>
          S'inscrire
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🚀 SkillsBet</h1>
      <button onClick={logout}>Se déconnecter</button>

      <h2>Nouvelle compétence</h2>
      <input
        placeholder="Nom de la compétence"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
        <option>Expert</option>
      </select>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Frontend</option>
        <option>Backend</option>
        <option>DevOps</option>
        <option>Autre</option>
      </select>
      <button onClick={addSkill}>Ajouter</button>

      {stats && (
        <>
          <h2>📊 Progression</h2>
          <p>XP Total : {stats.total_xp}</p>
          <p>Niveau : {stats.level}</p>
          <div style={{ background: "#ddd", width: 300, height: 20 }}>
            <div
              style={{
                width: stats.progress_percent + "%",
                background: "green",
                height: "100%",
              }}
            />
          </div>

          <h3>🏆 Badges</h3>
          {stats.badges.length === 0 && <p>Aucun badge</p>}
          {stats.badges.map((b, i) => (
            <div key={i}>{b}</div>
          ))}
        </>
      )}

      <h2>Compétences</h2>
      {skills.map((s) => (
        <div key={s.id}>
          {s.name} — {s.level} ({s.category})
          <button onClick={() => deleteSkill(s.id)}>❌</button>
        </div>
      ))}
    </div>
  )
}

