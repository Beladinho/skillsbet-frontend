import { api } from "../api";

export default function Duel() {
  const joinQueue = async () => {
    const res = await api.post("/duel/queue");
    if (res.data.match) {
      alert("🔥 Duel trouvé !");
    } else {
      alert("⏳ En attente...");
    }
  };

  return <button onClick={joinQueue}>Lancer un duel</button>;
}
