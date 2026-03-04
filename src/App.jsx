import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken && savedToken !== "undefined" && savedToken !== "null") {
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const handleLogin = (newToken) => {
    if (!newToken) return;

    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 SkillsBet</h1>
      <button onClick={handleLogout}>Logout</button>
      <Dashboard token={token} />
    </div>
  );
}
