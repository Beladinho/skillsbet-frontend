import { useState } from "react";
import { registerUser } from "../api/authApi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleRegister() {
    try {
      const data = await registerUser(email, password);
      setStatus(`Compte créé : ${data.player_id}`);
    } catch (err) {
      setStatus(err.message || "Erreur lors de l'inscription");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: 24 }}>
      <h2>Créer un compte</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 12 }}
      />

      <button onClick={handleRegister}>S'inscrire</button>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
