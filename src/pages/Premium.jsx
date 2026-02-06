import { api } from "../api";

export default function Premium() {
  const activate = async () => {
    await api.post("/premium");
    alert("Premium activé");
  };

  return <button onClick={activate}>Devenir Premium ⭐</button>;
}
