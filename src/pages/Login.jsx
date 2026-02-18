import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const data = await api.login(email, password);

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      onLogin(data.access_token);
    } else {
      alert("login failed");
    }
  };

  return (
    <div>
      <h2>Connexion</h2>

      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit}>Login</button>
    </div>
  );
}
