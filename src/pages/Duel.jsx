import { useState } from "react";

export default function Duel() {
  const [state, setState] = useState(null);

  const ws = new WebSocket(import.meta.env.VITE_WS_URL + "/ws/duel/demo/1");

  ws.onmessage = (e) => setState(JSON.parse(e.data));

  const attack = () => {
    ws.send(JSON.stringify({ type: "attack" }));
  };

  const skill1 = () => {
    ws.send(JSON.stringify({ type: "skill", skill_id: 1 }));
  };

  const skill3 = () => {
    ws.send(JSON.stringify({ type: "skill", skill_id: 3 }));
  };

  return (
    <div>
      <h2>⚔️ Duel</h2>

      <button onClick={attack}>Attaque</button>
      <button onClick={skill1}>Coup puissant</button>
      <button onClick={skill3}>Poison</button>

      {state && (
        <pre>{JSON.stringify(state, null, 2)}</pre>
      )}
    </div>
  );
}
