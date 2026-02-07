import { useState } from "react";
import { api } from "../api";

export default function Auth({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await api.register(email, password);
    alert("Compte créé, connecte-toi");
  };

  const handleLogin = async () => {
    const data = await api.login(email, password);

    // IMPORTANT : récupérer la string du token
    const token = data.access_token;

    localStorage.setItem("token", token);
    setToken(token);
  };

  return (
    <div>
      <h1>Connexion</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div>
        <button onClick={handleLogin}>Connexion</button>
        <button onClick={handleRegister}>Inscription</button>
      </div>
    </div>
  );
}
