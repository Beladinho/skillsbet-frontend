import { useState } from "react";

export default function Duel() {
  const [state, setState] = useState(null);

  const ws = new WebSocket(import.meta.env.VITE_WS_URL + "/ws/duel/demo/1");

  ws.onmessage = (e) => setState(JSON.parse(e.data));

  const attack = () => {
    ws.send(JSON.stringify({ type: "attack" }));
  };

  const skill = () => {
    ws.send(JSON.stringify({ type: "skill", skill_id: 1 }));
  };

  return (
    <div>
      <button onClick={attack}>⚔️ Attaquer</button>
      <button onClick={skill}>🔥 Skill</button>

      {state && <pre>{JSON.stringify(state, null, 2)}</pre>}
    </div>
  );
}
