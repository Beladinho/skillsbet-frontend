import { useState } from "react";
import { login, register } from "../api";

export default function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      const response = isLogin
        ? await login(username, password)
        : await register(username, password);

      const token = response; // backend renvoie une STRING

      if (!token) throw new Error("Token non reçu");

      localStorage.setItem("token", token);
      setToken(token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <h2>🔐 SkillsBet</h2>
      <h3>{isLogin ? "Login" : "Register"}</h3>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>
        {isLogin ? "Connexion" : "Créer un compte"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer", marginTop: 10 }}>
        {isLogin ? "Créer un compte" : "Déjà un compte ? Connexion"}
      </p>
    </div>
  );
}
