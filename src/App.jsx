import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddSkill from "./components/AddSkill"

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return <Dashboard token={token} setToken={setToken} />;
}

