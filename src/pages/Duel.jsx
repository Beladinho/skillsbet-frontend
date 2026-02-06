import { useState } from "react";
import { api } from "../api";

export default function Duel() {
  const [duelId, setDuelId] = useState(null);
  const [state, setState] = useState(null);

  const join = async () => {
    const res = await api.post("/duel/queue");
    if (res.data.match) {
      setDuelId(res.data.duel_id);
      connectWS(res.data.duel_id);
    }
  };

  const connectWS = (id) => {
    const userId = 1; // demo
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/duel/${id}/${userId}`
    );

    ws.onmessage = (e) => {
      setState(JSON.parse(e.data));
    };

    window.ws = ws;
  };

  const attack = () => {
    window.ws.send(JSON.stringify({ action: "attack" }));
  };

  return (
    <div>
      {!duelId && <button onClick={join}>Lancer un duel</button>}

      {state && (
        <>
          <p>❤️ HP: {JSON.stringify(state.hp)}</p>
          <button onClick={attack}>⚔️ Attaquer</button>
          {state.finished && <h2>🏆 Duel terminé</h2>}
        </>
      )}
    </div>
  );
}
