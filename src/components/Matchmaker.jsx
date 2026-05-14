import { useEffect, useRef, useState } from "react";
import { getPlayerStats, fillQueueWithBot } from "../api/skillsbetApi";
import { getProfile } from "../api/profileApi";
import { connectMatchmaking, leaveMatchmaking } from "../services/matchmakingSocket";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { gameLabel } from "../i18n";
import { getFlagByCode, getCountryNameByCode } from "../utils/countries";

function getAllowedGap(waitSeconds) {
  const baseGap = 50;
  const extraSteps = Math.floor(waitSeconds / 3);
  return Math.min(baseGap + extraSteps * 50, 400);
}

function getBotCountdown(waitSeconds) {
  return Math.max(0, 5 - waitSeconds);
}

function getStatusModifier(searching, status) {
  if (!searching && status === "matched") return "matched";
  if (searching) return "searching";
  if (status?.toLowerCase().includes("erreur")) return "error";
  return "";
}

const REGION_FILTERS = ["world", "region", "country"];

export default function Matchmaker({ playerId, game, stake, onMatchFound }) {
  const { tr, settings } = useAppSettings();
  const { notifyError, notifyInfo, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("");
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [playerCountry, setPlayerCountry] = useState(null);
  const [regionFilter, setRegionFilter] = useState("world");

  const hasMatchedRef = useRef(false);
  const botFillStartedRef = useRef(false);

  const allowedGap = getAllowedGap(waitSeconds);
  const botCountdown = getBotCountdown(waitSeconds);
  const botProgress = Math.min(100, Math.round((waitSeconds / 5) * 100));
  const statusMod = getStatusModifier(searching, status);

  useEffect(() => {
    getProfile()
      .then((p) => { if (p?.country) setPlayerCountry(p.country); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!searching) { setWaitSeconds(0); return; }
    const interval = window.setInterval(() => setWaitSeconds((p) => p + 1), 1000);
    return () => window.clearInterval(interval);
  }, [searching]);

  useEffect(() => {
    if (!searching || waitSeconds < 5 || hasMatchedRef.current || botFillStartedRef.current) return;
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
        country: playerCountry,
        regionFilter,
        onOpen: () => setStatus("waiting"),
        onClose: () => setSearching(false),
        onMessage: (data) => {
          if (hasMatchedRef.current) return;

          if (data.type === "waiting") {
            setStatus("waiting");
            notifyInfo(tr("waiting"), `${gameLabel(settings.language, game)} — ELO ${currentGameElo}`);
            return;
          }

          if (data.type === "match_found") {
            hasMatchedRef.current = true;
            botFillStartedRef.current = false;
            setSearching(false);
            setStatus("matched");

            const p0flag = data.player_countries?.[0] ? getFlagByCode(data.player_countries[0]) : "";
            const p1flag = data.player_countries?.[1] ? getFlagByCode(data.player_countries[1]) : "";
            notifySuccess(
              tr("matchFound"),
              `${p0flag} ${data.players[0]} vs ${p1flag} ${data.players[1]} — ${gameLabel(settings.language, data.game)}`
            );
            onMatchFound?.({ duel_id: data.duel_id, players: data.players, game: data.game, stake: data.stake });
          }
        },
      });
    } catch (error) {
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
      if (hasMatchedRef.current || botFillStartedRef.current) return;
      botFillStartedRef.current = true;
      setStatus("bot");

      const duel = await fillQueueWithBot(playerId, game);
      if (hasMatchedRef.current) return;

      hasMatchedRef.current = true;
      leaveMatchmaking();
      setSearching(false);
      setWaitSeconds(0);
      setStatus("matched");

      notifySuccess(tr("matchFound"), isAutomatic
        ? `Bot Alpha — ${gameLabel(settings.language, game)}`
        : `${playerId} vs Bot Alpha — ${gameLabel(settings.language, game)}`
      );

      onMatchFound?.({ duel_id: duel.duel_id, players: duel.players, game: duel.game, stake: duel.stake });
    } catch (error) {
      botFillStartedRef.current = false;
      if (!hasMatchedRef.current) {
        notifyError(tr("matchmaking"), error.message || "Erreur bot fill");
        setStatus(`Erreur bot fill : ${error.message || "Erreur"}`);
      }
    }
  }

  function renderStatusText() {
    if (status === "searching") return tr("searchingOpponent");
    if (status === "waiting")   return tr("waitingOpponent");
    if (status === "matched")   return tr("matched");
    if (status === "left")      return tr("leftQueue");
    if (status === "bot")       return tr("botAutoStarting");
    return status || "—";
  }

  function getFilterLabel(f) {
    if (f === "country") return playerCountry ? `${getFlagByCode(playerCountry)} ${tr("filterMyCountry")}` : tr("filterMyCountry");
    if (f === "region")  return tr("filterMyRegion");
    return tr("filterWorld");
  }

  return (
    <div className="card" style={{ marginTop: "20px", padding: "20px" }}>
      <h3 style={{ marginBottom: "14px" }}>{tr("matchmaking")}</h3>

      <div className="stats-grid" style={{ marginBottom: "16px" }}>
        <div className="stat-box">
          <strong>{tr("matchmakingGame")}</strong>
          {gameLabel(settings.language, game)}
        </div>
        <div className="stat-box">
          <strong>{tr("stake")}</strong>
          {stake} {tr("tokens")}
        </div>
        {playerCountry && (
          <div className="stat-box">
            <strong>{tr("country")}</strong>
            <span>{getFlagByCode(playerCountry)} {getCountryNameByCode(playerCountry)}</span>
          </div>
        )}
      </div>

      {/* Region filter */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ margin: "0 0 8px 0", fontSize: "0.82rem", color: "var(--clr-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {tr("matchmakingFilter")}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {REGION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { playClick(); setRegionFilter(f); }}
              disabled={searching || (f === "country" && !playerCountry) || (f === "region" && !playerCountry)}
              className={regionFilter === f ? "" : "btn-ghost"}
              style={{ fontSize: "0.82rem", padding: "4px 12px" }}
            >
              {getFilterLabel(f)}
            </button>
          ))}
        </div>
        {!playerCountry && (
          <p style={{ margin: "6px 0 0 0", fontSize: "0.78rem", color: "var(--clr-text-dim)" }}>
            {tr("noCountrySet")}
          </p>
        )}
      </div>

      <div className={`matchmaker-status matchmaker-status--${statusMod || "idle"}`}>
        <p style={{ margin: "0 0 6px 0", fontWeight: 700, color: "var(--clr-text)" }}>
          {tr("queueStatus")} :{" "}
          <span style={{ color: statusMod === "matched" ? "var(--clr-success)" : statusMod === "searching" ? "var(--clr-info)" : "var(--clr-text-dim)" }}>
            {renderStatusText()}
          </span>
        </p>

        {searching && (
          <>
            <p style={{ margin: "4px 0", fontSize: "0.84rem", color: "var(--clr-text-dim)" }}>
              {tr("waiting")} : <strong style={{ color: "var(--clr-text)" }}>{waitSeconds}s</strong>
              {"  "}·{"  "}
              {tr("eloGapWindow")} : <strong style={{ color: "var(--clr-text)" }}>±{allowedGap}</strong>
            </p>

            {waitSeconds < 5 ? (
              <p style={{ margin: "4px 0", fontSize: "0.84rem", color: "var(--clr-text-dim)" }}>
                {tr("botIn")} : <strong style={{ color: "var(--clr-orange)" }}>{botCountdown}s</strong>
              </p>
            ) : (
              <p style={{ margin: "4px 0", fontSize: "0.84rem", color: "var(--clr-orange)" }}>
                {tr("botAutoStarting")}
              </p>
            )}

            <div className="progress-track" style={{ marginTop: "12px" }}>
              <div className="progress-fill" style={{ width: `${botProgress}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="inline-button-group" style={{ marginTop: "16px" }}>
        {!searching ? (
          <button onClick={handleJoin}>{tr("joinQueue")}</button>
        ) : (
          <>
            <button className="btn-ghost" onClick={handleLeave}>{tr("leaveQueue")}</button>
            {waitSeconds >= 5 && !botFillStartedRef.current && (
              <button onClick={() => handleBotFill(false)}>{tr("playVsBot")}</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
