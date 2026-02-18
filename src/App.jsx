import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 SkillsBet</h1>
      <Dashboard token={token} />
    </div>
  );
}

