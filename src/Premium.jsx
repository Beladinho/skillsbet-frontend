import { api } from "../api";

export default function Premium() {
  const buy = async () => {
    const res = await api.post("/premium");
    window.location.href = res.data.url;
  };

  return <button onClick={buy}>Passer Premium ⭐</button>;
}
