import { useState } from "react"
import SkillTree from "./pages/SkillTree"
import Quests from "./pages/Quests"
import Duel from "./pages/Duel"
import Skills from "./pages/Skills"

export default function App() {
  const [page, setPage] = useState("skilltree")

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>🚀 SkillsBet</h1>

      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("skilltree")}>🌳 Arbre</button>{" "}
        <button onClick={() => setPage("quests")}>🗺️ Quêtes</button>{" "}
        <button onClick={() => setPage("duel")}>⚔️ Duel</button>{" "}
        <button onClick={() => setPage("skills")}>🎯 Skills</button>
      </nav>

      {page === "skilltree" && <SkillTree />}
      {page === "quests" && <Quests />}
      {page === "duel" && <Duel


