import { useEffect, useRef, useState } from "react";
import { getPlayerStats, fillQueueWithBot } from "../api/skillsbetApi";
import {
  connectMatchmaking,
  leaveMatchmaking,
} from "../services/matchmakingSocket";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { gameLabel } from "../i18n";

function getAllowedGap(waitSeconds) {
  const baseGap = 50;
  const extraSteps = Math.floor(waitSeconds / 3);
  const gap = baseGap + extraSteps * 50;
  return Math.min(gap, 400);
}

function getBotCountdown(waitSeconds) {
  return Math.max(0, 5 - waitSeconds);
}

function getStatusColor(searching, status) {
  if (!searching && status === "matched") return "#16a34a";
  if (searching) return "#2563eb";
  if (status?.toLowerCase().includes("erreur")) return "#dc2626";
  return "#475569";
}

export default function Matchmaker({
  playerId,
  game,
  stake,
  onMatchFound,
}) {
  const { tr, settings } = useAppSettings();
  const { notifyError, notifyInfo, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("");
  const [waitSeconds, setWaitSeconds] = useState(0);

  const hasMatchedRef = useRef(false);
  const botFillStartedRef = useRef(false);

  const allowedGap = getAllowedGap(waitSeconds);
  const botCountdown = getBotCountdown(waitSeconds);
  const botProgress = Math.min(100, Math.round((waitSeconds / 5) * 100));

  useEffect(() => {
    if (!searching) {
      setWaitSeconds(0);
      return;
    }

    const interval = window.setInterval(() => {
      setWaitSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [searching]);

  useEffect(() => {
    if (!searching) return;
    if (waitSeconds < 5) return;
    if (hasMatchedRef.current) return;
    if (botFillStartedRef.current) return;

    handleBotFill(true);
  }, [waitSeconds, searching]);

  async function handleJoin() {
    try {
      playClick();

      hasMatchedRef.current = false;
      botFillStartedRef.current = false;

      setSearching(true);
      setStatus("searching");
      setWaitSeconds(0);

      const stats = await getPlayerStats(playerId, game);
      const currentGameElo = Number(stats?.current_game_elo ?? 1200);

      connectMatchmaking({
        playerId,
        game,
        stake,
        elo: currentGameElo,
        onOpen: () => {
          setStatus("waiting");
        },
        onClose: () => {
          setSearching(false);
        },
        onMessage: (data) => {
          if (hasMatchedRef.current) {
            return;
          }

          if (data.type === "waiting") {
            setStatus("waiting");
            notifyInfo(
              tr("waiting"),
              `${gameLabel(settings.language, game)} — ELO ${currentGameElo}`
            );
            return;
          }

          if (data.type === "match_found") {
            hasMatchedRef.current = true;
            botFillStartedRef.current = false;

            setSearching(false);
            setStatus("matched");

            notifySuccess(
              tr("matchFound"),
              `${data.players[0]} vs ${data.players[1]} — ${gameLabel(
                settings.language,
                data.game
              )}`
            );

            onMatchFound?.({
              duel_id: data.duel_id,
              players: data.players,
              game: data.game,
              stake: data.stake,
            });
          }
        },
      });
    } catch (error) {
      console.error(error);
      setSearching(false);
      setStatus(`Erreur matchmaking : ${error.message || "Erreur"}`);
      notifyError(tr("matchmaking"), error.message || "Erreur matchmaking");
    }
  }

  function handleLeave() {
    playClick();

    hasMatchedRef.current = false;
    botFillStartedRef.current = false;

    leaveMatchmaking();
    setSearching(false);
    setWaitSeconds(0);
    setStatus("left");
  }

  async function handleBotFill(isAutomatic = false) {
    try {
      if (hasMatchedRef.current) return;
      if (botFillStartedRef.current) return;

      botFillStartedRef.current = true;
      setStatus("bot");

      const duel = await fillQueueWithBot(playerId, game);

      if (hasMatchedRef.current) return;

      hasMatchedRef.current = true;

      leaveMatchmaking();
      setSearching(false);
      setWaitSeconds(0);
      setStatus("matched");

      notifySuccess(
        tr("matchFound"),
        isAutomatic
          ? `Bot Alpha — ${gameLabel(settings.language, game)}`
          : `${playerId} vs Bot Alpha — ${gameLabel(settings.language, game)}`
      );

      onMatchFound?.({
        duel_id: duel.duel_id,
        players: duel.players,
        game: duel.game,
        stake: duel.stake,
      });
    } catch (error) {
      console.error(error);
      botFillStartedRef.current = false;

      if (!hasMatchedRef.current) {
        notifyError(tr("matchmaking"), error.message || "Erreur bot fill");
        setStatus(`Erreur bot fill : ${error.message || "Erreur"}`);
      }
    }
  }

  function renderStatusText() {
    if (status === "searching") return tr("searchingOpponent");
    if (status === "waiting") return tr("waitingOpponent");
    if (status === "matched") return tr("matched");
    if (status === "left") return tr("leftQueue");
    if (status === "bot") return tr("botAutoStarting");
    return status || "";
  }

  return (
    <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
      <h3>{tr("matchmaking")}</h3>

      <p>
        <strong>{tr("matchmakingGame")} :</strong>{" "}
        {gameLabel(settings.language, game)}
      </p>

      <p>
        <strong>{tr("stake")} :</strong> {stake} {tr("tokens")}
      </p>

      <div
        style={{
          marginTop: "14px",
          padding: "12px",
          borderRadius: "12px",
          background: "rgba(15, 23, 42, 0.45)",
          border: `1px solid ${getStatusColor(searching, status)}`,
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>{tr("queueStatus")} :</strong> {renderStatusText()}
        </p>

        {searching && (
          <>
            <p style={{ margin: "6px 0" }}>
              <strong>{tr("waiting")} :</strong> {waitSeconds}s
            </p>

            <p style={{ margin: "6px 0" }}>
              <strong>{tr("eloGapWindow")} :</strong> ±{allowedGap}
            </p>

            {waitSeconds < 5 ? (
              <p style={{ margin: "6px 0" }}>
                <strong>{tr("botIn")} :</strong> {botCountdown} {tr("seconds")}
              </p>
            ) : (
              <p style={{ margin: "6px 0" }}>
                {tr("botAutoStarting")}
              </p>
            )}

            <div
              style={{
                width: "100%",
                height: "10px",
                borderRadius: "999px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.08)",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: `${botProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #3b82f6, #22c55e)",
                }}
              />
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {!searching ? (
          <button onClick={handleJoin}>
            {tr("joinQueue")}
          </button>
        ) : (
          <>
            <button onClick={handleLeave}>
              {tr("leaveQueue")}
            </button>

            {waitSeconds >= 5 && !botFillStartedRef.current && (
              <button onClick={() => handleBotFill(false)}>
                {tr("playVsBot")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}