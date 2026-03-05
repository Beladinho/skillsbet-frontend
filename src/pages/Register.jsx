import { useState } from "react";

export default function Register({ onRegister }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      const response = await fetch(
        "https://web-production-d4ff4.up.railway.app/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      alert("Compte créé ! Connectez-vous.");

      onRegister();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>

      <h2>Créer un compte</h2>

      <form onSubmit={handleRegister}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">
          S'inscrire
        </button>

      </form>

      {error && <p>{error}</p>}

    </div>
  );
}