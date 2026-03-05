import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [page, setPage] = useState("login");

  if (!token) {

    if (page === "register") {
      return (
        <Register
          onRegister={() => setPage("login")}
        />
      );
    }

    return (
      <Login
        onLogin={setToken}
        goToRegister={() => setPage("register")}
      />
    );
  }

  return (
    <div style={{ padding: 20 }}>

      <h1>🚀 SkillsBet</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          setToken(null);
        }}
      >
        Déconnexion
      </button>

      <Dashboard token={token} />

    </div>
  );
}
