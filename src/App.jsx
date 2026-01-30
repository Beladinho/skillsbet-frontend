import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const { token, logout } = useContext(AuthContext);

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h1>🔐 Auth SkillsBet</h1>
        <Login />
        <hr />
        <Register />
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🚀 SkillsBet connecté</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
