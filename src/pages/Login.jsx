import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const API_URL = "https://web-production-d4ff4.up.railway.app";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? "/register" : "/login";

    try {
      const response = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Erreur");
        return;
      }

      if (!isRegister) {
        localStorage.setItem("token", data.access_token);
        onLogin(data.access_token);
      } else {
        alert("Compte créé, vous pouvez vous connecter");
        setIsRegister(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isRegister ? "Créer un compte" : "Se connecter"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">
          {isRegister ? "Créer un compte" : "Se connecter"}
        </button>
      </form>

      <br />

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister
          ? "Déjà un compte ? Se connecter"
          : "Créer un compte"}
      </button>
    </div>
  );
}

