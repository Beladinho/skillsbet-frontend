import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 20 }}>
        <Link to="/">Dashboard</Link> |{" "}
        <Link to="/challenges">Défis</Link> |{" "}
        <Link to="/leaderboard">Classement</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}


