import { useState } from "react";
import { login, register } from "../api";

export default function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");

      const token = isLogin
        ? await login(username, password)
        : await register(username, password);

      localStorage.setItem("token", token);
      setToken(token);
    } catch (err) {
      console.error(err);
      setError("Erreur connexion serveur");
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

      <p
        style={{ cursor: "pointer", marginTop: 10 }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Créer un compte" : "Déjà un compte ? Connexion"}
      </p>
    </div>
  );
}
