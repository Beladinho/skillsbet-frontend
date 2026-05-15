import { useRef, useEffect, useState, useContext, useMemo } from "react";
import { useAppSettings } from "../context/AppSettingsContext";
import { useSounds } from "../context/SoundContext";
import { useNotifications } from "../context/NotificationContext";
import { gameLabel, rankLabel } from "../i18n";
import PlayerAvatar from "../components/PlayerAvatar";
import { PlayerContext } from "../context/PlayerContext";

function Confetti({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#FF6B00", "#FFD700", "#4ade80", "#60a5fa", "#f87171", "#c084fc", "#fff"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 4 + 2,
      phase: Math.random() * Math.PI * 2,
      wobble: Math.random() * 0.06 + 0.02,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
    }));
    let rafId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.y += p.speed;
        p.x += Math.sin(p.phase) * 2.5;
        p.phase += p.wobble;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (pieces.some((p) => p.y < canvas.height + 40)) {
        rafId = requestAnimationFrame(draw);
      }
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [active]);
  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9995 }}
    />
  );
}

export default function MatchResult({ result, playerId, onExit, avatarUrls = {} }) {
  const { tr, settings } = useAppSettings();
  const { playClick, playPromotion } = useSounds();
  const { notifySuccess } = useNotifications();
  const { setPlayerLevel, setPlayerXp } = useContext(PlayerContext);
  const hasAnnouncedPromotionRef = useRef(false);
  const hasAnnouncedXpRef = useRef(false);

  const isWin = result?.winner === playerId;
  const isLoss = result?.winner !== null && result?.winner !== undefined && result?.winner !== playerId;
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (isLoss) {
      setShaking(true);
      setTimeout(() => setShaking(false), 700);
    }
  }, [isLoss]);

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
  const safeXpChange = result.xp_change || {};
  const myXpChange = safeXpChange[playerId] || null;

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

  useEffect(() => {
    if (!myXpChange || hasAnnouncedXpRef.current) return;
    hasAnnouncedXpRef.current = true;

    setPlayerXp(myXpChange.new_xp);
    setPlayerLevel(myXpChange.new_level);

    if (myXpChange.leveled_up) {
      notifySuccess("Level Up !", `Tu es maintenant niveau ${myXpChange.new_level} !`);
    } else {
      notifySuccess("XP gagnés", `+${myXpChange.xp_gained} XP`);
    }
  }, [myXpChange, notifySuccess, setPlayerLevel, setPlayerXp]);

  return (
    <>
    <Confetti active={isWin} />
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", animation: shaking ? "screenShake 0.6s ease both" : "none" }}>
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

      {myXpChange && (
        <div className="card" style={{
          padding: "18px",
          marginTop: "16px",
          border: "2px solid rgba(255,107,0,0.4)",
          background: "linear-gradient(135deg, rgba(255,107,0,0.12), rgba(15,23,42,0.9))",
        }}>
          <h3 style={{ marginTop: 0, color: "var(--clr-orange)", fontFamily: "var(--font-heading)" }}>
            XP GAGNÉS
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--clr-orange)" }}>
              +{myXpChange.xp_gained} XP
            </span>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--clr-text-dim)" }}>
                Total : {myXpChange.new_xp} XP
              </div>
              <div style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #ff6b00, #ff9500)",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "0.85rem",
                padding: "2px 10px",
                borderRadius: 4,
                marginTop: 4,
              }}>
                NIVEAU {myXpChange.new_level}
                {myXpChange.leveled_up && " 🏆"}
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}