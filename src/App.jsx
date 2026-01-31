import { useState } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) return <Auth setToken={setToken} />;

  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;

