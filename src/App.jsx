import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  if (!token) return <Auth setToken={setToken} />;

  return <Dashboard token={token} setToken={setToken} />;
}

export default App;

