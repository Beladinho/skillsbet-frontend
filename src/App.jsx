import { useState } from "react"

import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Leaderboard from "./pages/Leaderboard"

export default function App() {

  const [page, setPage] = useState("dashboard")

  return (
    <div>

      <h1>🚀 SkillsBet</h1>

      <nav style={{ marginBottom: 20 }}>

        <button onClick={() => setPage("dashboard")}>
          Dashboard
        </button>

        <button onClick={() => setPage("profile")}>
          Profile
        </button>

        <button onClick={() => setPage("leaderboard")}>
          Leaderboard
        </button>

      </nav>

      {page === "dashboard" && <Dashboard />}
      {page === "profile" && <Profile />}
      {page === "leaderboard" && <Leaderboard />}

    </div>
  )
}
