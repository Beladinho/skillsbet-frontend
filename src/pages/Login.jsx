import { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await login(username, password);

    if (res.token) {
      navigate("/dashboard");
    } else {
      alert("Erreur login");
    }
  };

  return (
    <div>
      <h1>🔐 SkillsBet</h1>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
}
