import { useState } from "react";
import { claimDaily } from "../api";
import DailyCalendar from "../components/DailyCalendar";

export default function Daily() {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("");

  const handleClaim = async () => {
    try {
      const data = await claimDaily();
      setStreak(data.day);
      setMessage(
        `🎁 Jour ${data.day} : +${data.reward.xp} XP (${data.reward.rarity})`
      );
    } catch (err) {
      setMessage(err.response?.data?.detail || "Erreur");
    }
  };

  return (
    <div>
      <h2>📅 Récompense quotidienne</h2>
      <button onClick={handleClaim}>Réclamer</button>
      <p>{message}</p>
      <DailyCalendar streak={streak} />
    </div>
  );
}
