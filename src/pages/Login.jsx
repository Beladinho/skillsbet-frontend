import { useState } from "react";
import { api } from "../api";

export default function Login({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = await api.login(username, password);

    if (data.token) {
      setLoggedIn(true);
    } else {
      alert("Erreur login");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
