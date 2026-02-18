import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const r = await api.login(email, password);
    if (r.token) {
      localStorage.setItem("token", r.token);
      onLogin(r.token);
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

