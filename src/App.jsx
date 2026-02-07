import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Badges from "./pages/Badges";
import Streak from "./pages/Streak";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Chest from "./pages/Chest";
import Duel from "./pages/Duel";
import Classes from "./pages/Classes";
import Shop from "./pages/Shop";
import Titles from "./pages/Titles";
import SkillTree from "./pages/SkillTree";
import Daily from "./pages/Daily";
import Matchmaking from "./pages/Matchmaking";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 SkillsBet</h1>

      {/* MENU */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("badges")}>Badges</button>
        <button onClick={() => setPage("streak")}>Streak</button>
        <button onClick={() => setPage("quests")}>Quêtes</button>
        <button onClick={() => setPage("leaderboard")}>Classement</button>
        <button onClick={() => setPage("chest")}>Coffre</button>
        <button onClick={() => setPage("duel")}>Duel</button>
        <button onClick={() => setPage("classes")}>Classes</button>
        <button onClick={() => setPage("shop")}>Boutique</button>
        <button onClick={() => setPage("titles")}>Titres</button>
        <button onClick={() => setPage("tree")}>Arbre</button>
        <button onClick={() => setPage("daily")}>Daily</button>
        <button onClick={() => setPage("matchmaking")}>Matchmaking</button>
      </div>

      {/* ROUTING SIMPLE */}
      {page === "dashboard" && <Dashboard />}
      {page === "badges" && <Badges />}
      {page === "streak" && <Streak />}
      {page === "quests" && <Quests />}
      {page === "leaderboard" && <Leaderboard />}
      {page === "chest" && <Chest />}
      {page === "duel" && <Duel />}
      {page === "classes" && <Classes />}
      {page === "shop" && <Shop />}
      {page === "titles" && <Titles />}
      {page === "tree" && <SkillTree />}
      {page === "daily" && <Daily />}
      {page === "matchmaking" && <Matchmaking />}
    </div>
  );
}
