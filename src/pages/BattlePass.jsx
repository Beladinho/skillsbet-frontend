import { useEffect, useState } from "react";
import { getBattlePass } from "../api";

export default function BattlePass() {
  const [bp, setBp] = useState(null);

  useEffect(() => {
    getBattlePass().then(setBp);
  }, []);

  if (!bp) return <p>Chargement...</p>;

  return (
    <div>
      <h2>🎟️ Battle Pass</h2>
      <p>Niveau actuel : {bp.current_level}</p>

      {bp.levels.map((lvl) => (
        <div key={lvl.level}>
          <h4>Niveau {lvl.level}</h4>

          <p>
            🎁 {lvl.free.reward} ({lvl.free.rarity})
            {lvl.free.unlocked ? " ✅" : " 🔒"}
          </p>

          <p>
            💎 {lvl.premium.reward} ({lvl.premium.rarity})
            {lvl.premium.unlocked ? " ✅" : " 🔒"}
          </p>
        </div>
      ))}
    </div>
  );
}
