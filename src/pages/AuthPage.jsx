import { useState } from "react";
import { login, register } from "../api";

export default function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const data = isLogin
        ? await login(username, password)
        : await register(username, password);

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <h2>{isLogin ? "Login" : "Register"}</h2>

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

      {error && <p style={{color:"red"}}>{error}</p>}

      <p onClick={() => setIsLogin(!isLogin)} style={{cursor:"pointer"}}>
        {isLogin ? "Créer un compte" : "Déjà un compte ? Connexion"}
      </p>
    </div>
  );
}
