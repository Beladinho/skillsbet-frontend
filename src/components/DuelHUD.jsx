import { useAppSettings } from "../context/AppSettingsContext";
import { gameLabel } from "../i18n";

export default function DuelHUD({
  duel,
  socketState,
  liveScores,
  playerId,
}) {
  const { tr, settings } = useAppSettings();

  if (!duel) return null;

  const isPlayer1 = duel.player1 === playerId;
  const opponent = isPlayer1 ? duel.player2 : duel.player1;

  const score1 = liveScores?.[duel.player1] ?? 0;
  const score2 = liveScores?.[duel.player2] ?? 0;

  const playerScore = isPlayer1 ? score1 : score2;
  const opponentScore = isPlayer1 ? score2 : score1;

  const isWinning = playerScore > opponentScore;
  const isLosing = playerScore < opponentScore;

  function getConnectionColor() {
    if (socketState === "connected") return "#22c55e";
    if (socketState === "connecting") return "#f59e0b";
    return "#ef4444";
  }

  function getConnectionLabel() {
    if (socketState === "connected") return "Connecté";
    if (socketState === "connecting") return "Connexion...";
    return "Déconnecté";
  }

  return (
    <div
      className="card"
      style={{
        padding: "16px",
        marginBottom: "20px",
        border: "2px solid rgba(255,255,255,0.1)",
        background: "rgba(15, 23, 42, 0.7)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>
          🎮 {gameLabel(settings.language, duel.game)}
        </h3>

        <span
          style={{
            padding: "4px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            background: getConnectionColor(),
            color: "white",
          }}
        >
          {getConnectionLabel()}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
          fontWeight: "bold",
        }}
      >
        <div>
          👤 {duel.player1}
          {duel.player1 === playerId && " (toi)"}
        </div>

        <div>
          👤 {duel.player2}
          {duel.player2 === playerId && " (toi)"}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "28px",
          margin: "16px 0",
          fontWeight: "bold",
          color: isWinning ? "#22c55e" : isLosing ? "#ef4444" : "#f8fafc",
        }}
      >
        {score1} — {score2}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: isWinning ? "#22c55e" : isLosing ? "#ef4444" : "#cbd5e1",
          fontWeight: 600,
        }}
      >
        {tr("you")} : {playerScore} | {tr("opponent")} : {opponentScore}
      </div>

      <div
        style={{
          marginTop: "12px",
          textAlign: "center",
          fontSize: "13px",
          opacity: 0.8,
        }}
      >
        💰 {tr("stake")} : {duel.stake} {tr("tokens")}
      </div>

      <div
        style={{
          marginTop: "8px",
          textAlign: "center",
          fontSize: "13px",
          opacity: 0.8,
        }}
      >
        ⚔️ {tr("against")} : {opponent}
      </div>
    </div>
  );
}