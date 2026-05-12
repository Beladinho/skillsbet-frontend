import { useEffect, useState } from "react";
import { getLatestSeasonResults } from "../api/skillsbetApi";
import { useAppSettings } from "../context/AppSettingsContext";

export default function SeasonResultsPanel() {
  const { tr } = useAppSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      try {
        setLoading(true);
        const result = await getLatestSeasonResults();
        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        console.error("Erreur chargement résultats saison :", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="card" style={{ marginTop: "24px", padding: "20px" }}>
      <h3 style={{ marginTop: 0 }}>{tr("seasonResults")}</h3>

      {loading ? (
        <p>{tr("loading")}</p>
      ) : !data || !data.results || data.results.length === 0 ? (
        <p>{tr("empty")}</p>
      ) : (
        <>
          <p>
            <strong>{tr("season")} :</strong> {data.season_number}
          </p>

          <div className="simple-list">
            {data.results.map((row) => (
              <div key={`${row.player_id}-${row.final_rank}`} className="simple-list-item">
                <strong>#{row.final_rank}</strong> — {row.player_id} — ELO {row.final_elo} — +{row.reward_tokens} {tr("tokens")}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}