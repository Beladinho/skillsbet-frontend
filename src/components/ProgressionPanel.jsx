import { useEffect, useState } from "react";
import { useAppSettings } from "../context/AppSettingsContext";
import { getRankFromElo, getRankProgress, getRankColor } from "../ranking";
import { rankLabel } from "../i18n";
import RankBadge from "./RankBadge";
import { getRankRewardsStatus } from "../api/skillsbetApi";

export default function ProgressionPanel({ elo }) {
  const { tr, settings } = useAppSettings();

  const [rewardStatus, setRewardStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentRank = getRankFromElo(elo);
  const progress = getRankProgress(elo);

  useEffect(() => {
    let cancelled = false;

    async function loadRewardStatus() {
      try {
        setLoading(true);
        const data = await getRankRewardsStatus();
        if (!cancelled) {
          setRewardStatus(data);
        }
      } catch (error) {
        console.error("Erreur chargement progression :", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRewardStatus();

    return () => {
      cancelled = true;
    };
  }, [elo]);

  const rewards = rewardStatus?.rewards || [];

  return (
    <div className="card" style={{ marginTop: "24px", padding: "20px" }}>
      <h3 style={{ marginTop: 0 }}>{tr("progressionPanel")}</h3>

      <div style={{ marginBottom: "18px" }}>
        <p style={{ marginBottom: "8px" }}>
          <strong>{tr("rank")} :</strong>{" "}
          <RankBadge rankKey={currentRank.key} />
        </p>

        <p style={{ marginBottom: "8px" }}>
          <strong>{tr("globalElo")} :</strong> {elo}
        </p>

        <p style={{ marginBottom: "8px" }}>
          <strong>{tr("progressToNextRank")} :</strong> {progress}%
        </p>

        <div
          style={{
            width: "100%",
            height: "12px",
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.65)",
            overflow: "hidden",
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #3b82f6, #22c55e)",
            }}
          />
        </div>
      </div>

      {loading ? (
        <p>{tr("loading")}</p>
      ) : (
        <div className="simple-list">
          {rewards.map((rank) => {
            let stateLabel = tr("upcoming");
            let stateBg = "#475569";

            if (rank.claimed) {
              stateLabel = tr("rewardClaimed");
              stateBg = "#16a34a";
            } else if (rank.current) {
              stateLabel = tr("current");
              stateBg = "#2563eb";
            } else if (rank.unlocked) {
              stateLabel = tr("unlocked");
              stateBg = "#0f766e";
            }

            return (
              <div
                key={rank.rank_key}
                className="simple-list-item"
                style={{
                  borderLeft: `6px solid ${getRankColor(rank.rank_key)}`,
                  opacity: rank.unlocked ? 1 : 0.72,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <RankBadge rankKey={rank.rank_key} />
                    </div>

                    <p style={{ margin: "4px 0" }}>
                      <strong>{tr("eloRange")} :</strong>{" "}
                      {rank.max_elo >= 1000000000
                        ? `${rank.min_elo}+`
                        : `${rank.min_elo} - ${rank.max_elo}`}
                    </p>

                    <p style={{ margin: "4px 0" }}>
                      <strong>{tr("rankReward")} :</strong> +{rank.reward} {tr("tokens")}
                    </p>

                    {rank.claimed && (
                      <p style={{ margin: "4px 0", color: "#22c55e", fontWeight: 700 }}>
                        ✓ {tr("rewardClaimed")}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: stateBg,
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {stateLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}