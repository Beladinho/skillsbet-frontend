import { useEffect, useState } from "react";
import { getBadges } from "../api/skillsbetApi";
import { useAppSettings } from "../context/AppSettingsContext";

export default function BadgesPanel() {
  const { tr } = useAppSettings();
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getBadges();
      setBadges(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="card" style={{ marginTop: "30px", padding: "16px" }}>
      <h3>🏅 {tr ? tr("badges") : "Badges"}</h3>

      {badges.length === 0 ? (
        <p>{tr ? tr("empty") : "Aucun badge"}</p>
      ) : (
        badges.map((badge) => (
          <div
            key={badge.id}
            className="card"
            style={{ padding: 12, marginBottom: 12 }}
          >
            <p>
              <strong>{badge.name}</strong>
            </p>
            <p>{badge.description}</p>
            <p>{badge.earned ? "✅ Débloqué" : "🔒 Non débloqué"}</p>
          </div>
        ))
      )}
    </div>
  );
}