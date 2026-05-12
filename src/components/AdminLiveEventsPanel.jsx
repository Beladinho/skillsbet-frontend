import { useState } from "react";
import { createLiveEventAdmin } from "../api/skillsbetApi";

export default function AdminLiveEventsPanel() {
  const [name, setName] = useState("");
  const [type, setType] = useState("xp_boost");
  const [value, setValue] = useState(1);
  const [duration, setDuration] = useState(24);

  async function create() {
    await createLiveEventAdmin({
      name,
      event_type: type,
      value,
      duration_hours: duration,
    });
    alert("Event créé !");
  }

  return (
    <div className="card">
      <h3>Live Events</h3>

      <input placeholder="Nom" onChange={(e) => setName(e.target.value)} />
      <select onChange={(e) => setType(e.target.value)}>
        <option value="xp_boost">XP Boost</option>
        <option value="deposit_bonus">Deposit Bonus</option>
      </select>

      <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
      <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />

      <button onClick={create}>Créer</button>
    </div>
  );
}