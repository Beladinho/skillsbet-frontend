import { useEffect, useState } from "react";
import { getSeasonStatus } from "../api/skillsbetApi";
import { useAppSettings } from "../context/AppSettingsContext";

export default function SeasonPanel() {
  const { tr } = useAppSettings();
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSeason() {
      try {
        setLoading(true);
        const data = await getSeasonStatus();
        if (!cancelled) {
          setSeason(data);
        }
      } catch (error) {
        console.error("Erreur chargement saison :", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSeason();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="card" style={{ marginTop: "24px", padding: "20px" }}>
      <h3 style={{ marginTop: 0 }}>{tr("season")}</h3>

      {loading ? (
        <p>{tr("loading")}</p>
      ) : season ? (
        <>
          <p>
            <strong>{tr("seasonLabel")} :</strong> {season.label}
          </p>
          <p>
            <strong>{tr("status")} :</strong> {season.is_active ? tr("active") : tr("inactive")}
          </p>
        </>
      ) : (
        <p>{tr("empty")}</p>
      )}
    </div>
  );
}