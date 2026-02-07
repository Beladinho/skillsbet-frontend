import { useState } from "react";
import { api } from "../api";

export default function Auth({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    try {
      await api.register(email, password);
      alert("Compte créé. Connecte-toi.");
    } catch (e) {
      setError("Erreur lors de l'inscription");
    }
  };

  const handleLogin = async () => {
    setError("");
    try {
      const data = await api.login(email, password);

      // Vérification du token
      if (!data.access_token) {
        setError("Identifiants invalides");
        return;
      }

      const token = data.access_token;

      localStorage.setItem("token", token);
      setToken(token);
    } catch (e) {
      setError("Erreur de connexion");
    }
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

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
