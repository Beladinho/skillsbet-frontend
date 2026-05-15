import { useEffect, useMemo, useRef } from "react";
import { useAppSettings } from "../context/AppSettingsContext";
import { useSounds } from "../context/SoundContext";
import { useNotifications } from "../context/NotificationContext";
import { gameLabel, rankLabel } from "../i18n";
import PlayerAvatar from "../components/PlayerAvatar";

export default function MatchResult({ result, playerId, onExit, avatarUrls = {} }) {
  const { tr, settings } = useAppSettings();
  const { playClick, playPromotion } = useSounds();
  const { notifySuccess } = useNotifications();
  const hasAnnouncedPromotionRef = useRef(false);

  if (!result) {
    return null;
  }

  const winnerLabel =
    result.winner === null || result.winner === undefined
      ? tr("draw")
      : result.winner;

  const safeScores = result.scores || {};
  const safeEloChange = result.elo_change || {};
  const safeGameElo = result.game_elo || {};
  const safeGameEloChange = result.game_elo_change || {};
  const safeBalance = result.balance || {};
  const safeBalanceChange = result.balance_change || {};
  const safeRankRewards = result.rank_rewards || {};
  const myRankRewards = safeRankRewards[playerId] || [];
  const safeStreakRewards = result.streak_rewards || {};
const myStreakRewards = safeStreakRewards[playerId] || [];

  const totalPromotionReward = useMemo(() => {
    return myRankRewards.reduce((sum, item) => sum + Number(item.reward || 0), 0);
  }, [myRankRewards]);

  useEffect(() => {
    if (!myRankRewards.length) return;
    if (hasAnnouncedPromotionRef.current) return;

    hasAnnouncedPromotionRef.current = true;
    playPromotion();

    const bestRank = myRankRewards[myRankRewards.length - 1];

    notifySuccess(
      tr("rankPromotion"),
      `${tr("newRankReached")} : ${rankLabel(settings.language, bestRank.rank_key)} (+${totalPromotionReward} ${tr("tokens")})`
    );
  }, [myRankRewards, notifySuccess, playPromotion, settings.language, totalPromotionReward, tr]);

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{tr("matchResult")}</h1>

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <p>
          <strong>{tr("matchmakingGame")} :</strong>{" "}
          {gameLabel(settings.language, result.game)}
        </p>
        <p>
          <strong>{tr("winner")} :</strong> {winnerLabel}
        </p>
        <p>
          <strong>{tr("stake")} :</strong> {result.stake ?? 0}
        </p>
      </div>

      {myRankRewards.length > 0 && (
        <div
          className="card"
          style={{
            padding: "18px",
            marginTop: "16px",
            border: "2px solid rgba(234, 179, 8, 0.5)",
            background: "linear-gradient(135deg, rgba(234,179,8,0.18), rgba(15,23,42,0.9))",
          }}
        >
          <h3 style={{ marginTop: 0 }}>🏆 {tr("rankPromotion")}</h3>

          {myRankRewards.map((reward, index) => (
            <p key={index} style={{ margin: "8px 0" }}>
              <strong>{tr("newRankReached")} :</strong>{" "}
              {rankLabel(settings.language, reward.rank_key)} —{" "}
              <strong>{tr("promotionReward")} :</strong> +{reward.reward} {tr("tokens")}
            </p>
          ))}

          <p style={{ marginTop: "12px", fontWeight: 700 }}>
            Total : +{totalPromotionReward} {tr("tokens")}
          </p>
        </div>
      )}

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <h3>{tr("scores")}</h3>
        {Object.entries(safeScores).map(([name, score]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <PlayerAvatar playerId={name} avatarUrl={avatarUrls[name]} size={32} />
            <strong style={{ color: name === playerId ? "var(--clr-orange)" : "var(--clr-text)" }}>{name}</strong>
            <span style={{ color: "var(--clr-text-dim)" }}>: {score}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <h3>{tr("eloChange")}</h3>
        {Object.entries(safeEloChange).map(([name, value]) => (
          <p key={name}>
            <strong>{name}</strong> : {value > 0 ? `+${value}` : value}
          </p>
        ))}
      </div>

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <h3>{tr("gameElo")}</h3>
        {Object.entries(safeGameElo).map(([name, value]) => (
          <p key={name}>
            <strong>{name}</strong> : {value}
          </p>
        ))}
      </div>

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <h3>{tr("gameEloChange")}</h3>
        {Object.entries(safeGameEloChange).map(([name, value]) => (
          <p key={name}>
            <strong>{name}</strong> : {value > 0 ? `+${value}` : value}
          </p>
        ))}
      </div>

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <h3>{tr("balance")}</h3>
        {Object.entries(safeBalance).map(([name, value]) => (
          <p key={name}>
            <strong>{name}</strong> : {value}
          </p>
        ))}
      </div>

      <div className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <h3>{tr("balanceChange")}</h3>
        {Object.entries(safeBalanceChange).map(([name, value]) => (
          <p key={name}>
            <strong>{name}</strong> : {value > 0 ? `+${value}` : value}
          </p>
        ))}
      </div>

      {myStreakRewards.length > 0 && (
  <div
    className="card"
    style={{
      padding: "16px",
      marginTop: "16px",
      border: "2px solid #f97316",
      background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(15,23,42,0.9))",
    }}
  >
    <h3>🔥 {tr("winStreak")}</h3>

    {myStreakRewards.map((r, i) => (
      <p key={i}>
        {r.streak} wins → +{r.reward} {tr("tokens")}
      </p>
    ))}
  </div>
)}

<div style={{ marginTop: "20px" }}>
  <button
    onClick={() => {
      playClick();
      onExit?.();
    }}
  >
    {tr("backToLobby")}
  </button>
</div>
    </div>
  );
}