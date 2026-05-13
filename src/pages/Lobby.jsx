import { useCallback, useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { useMusic } from "../context/MusicContext";
import { gameLabel, missionLabel } from "../i18n";
import { getRankFromElo, getRankProgress } from "../ranking";
import { getRankReward } from "../rankRewards";

import Wallet from "../components/Wallet";
import Matchmaker from "../components/Matchmaker";
import SessionBar from "../components/SessionBar";
import SectionCard from "../components/SectionCard";
import RankBadge from "../components/RankBadge";
import ProgressionPanel from "../components/ProgressionPanel";
import SeasonPanel from "../components/SeasonPanel";
import SeasonResultsPanel from "../components/SeasonResultsPanel";
import BadgesPanel from "../components/BadgesPanel";
import NotificationsPanel from "../components/NotificationsPanel";
import KycPanel from "../components/KycPanel";
import LimitsPanel from "../components/LimitsPanel";
import TierPanel from "../components/TierPanel";
import BattlePassPanel from "../components/BattlePassPanel";
import BattlePassMissionsPanel from "../components/BattlePassMissionsPanel";
import BattlePassHistoryPanel from "../components/BattlePassHistoryPanel";
import PromoCodePanel from "../components/PromoCodePanel";
import ReferralPanel from "../components/ReferralPanel";
import VipBenefitsPanel from "../components/VipBenefitsPanel";
import GameScreen from "../components/GameScreen";

import MatchResult from "../pages/MatchResult";
import Tournaments from "../pages/Tournaments";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

import { Link } from "react-router-dom";

import {
  getLeaderboard,
  getMatchHistory,
  getMissions,
  getPlayerStats,
  getSeasonLeaderboard,
} from "../api/skillsbetApi";

import {
  connectToDuelSocket,
  disconnectDuelSocket,
  connectGlobalSocket,
  disconnectGlobalSocket,
} from "../api/socket";

export default function Lobby() {
  const { playerId, role } = useContext(PlayerContext);
  const { tr, settings } = useAppSettings();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  const { playMatchFound } = useSounds();
  const { startLobbyMusic, stopLobbyMusic } = useMusic();

  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [missions, setMissions] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [currentDuel, setCurrentDuel] = useState(null);
  const [result, setResult] = useState(null);

  const [stake, setStake] = useState(10);
  const [selectedGame, setSelectedGame] = useState("snake");

  const [statsGame, setStatsGame] = useState("snake");
  const [leaderboardGame, setLeaderboardGame] = useState("global");
  const [leaderboardMode, setLeaderboardMode] = useState("global");

  const [socketState, setSocketState] = useState("disconnected");
  const [liveScores, setLiveScores] = useState({});

  const GAMES = ["snake", "reflex", "memory", "tetris", "checkers", "chess", "dames", "uno"];

  const loadLeaderboardData = useCallback(async () => {
    try {
      if (leaderboardMode === "season") {
        const data = await getSeasonLeaderboard();
        const normalized = Array.isArray(data)
          ? data.map((row) => ({ player: row.player, display_elo: row.elo, display_wins: row.wins }))
          : [];
        setLeaderboard(normalized);
        return;
      }
      const lb = await getLeaderboard(leaderboardGame === "global" ? null : leaderboardGame);
      setLeaderboard(Array.isArray(lb) ? lb : []);
    } catch (error) {
      console.error("Erreur chargement leaderboard :", error);
    }
  }, [leaderboardGame, leaderboardMode]);

  const loadLobbyCoreData = useCallback(async () => {
    try {
      if (!playerId) return;
      const [hist, mis, stats] = await Promise.all([
        getMatchHistory(playerId),
        getMissions(playerId),
        getPlayerStats(playerId, statsGame),
      ]);
      setHistory(Array.isArray(hist) ? hist : []);
      setMissions(Array.isArray(mis) ? mis : []);
      setPlayerStats(stats || null);
    } catch (error) {
      console.error("Erreur chargement données lobby :", error);
      notifyError("Erreur lobby", error.message || "Impossible de charger les données du lobby.");
    }
  }, [playerId, statsGame, notifyError]);

  const loadAllLobbyData = useCallback(async () => {
    await Promise.all([loadLeaderboardData(), loadLobbyCoreData()]);
  }, [loadLeaderboardData, loadLobbyCoreData]);

  function handleMatchFound(matchData) {
    setLiveScores({});
    playMatchFound();
    notifySuccess("Match trouvé", `${matchData.players[0]} vs ${matchData.players[1]} — ${gameLabel(settings.language, matchData.game)}`);
    setCurrentDuel((prev) => {
      if (prev?.duel_id === matchData.duel_id) return prev;
      return { duel_id: matchData.duel_id, player1: matchData.players[0], player2: matchData.players[1], game: matchData.game, stake: matchData.stake };
    });
  }

  useEffect(() => { loadAllLobbyData(); }, [loadAllLobbyData]);

  useEffect(() => {
    if (!playerId) return;
    connectGlobalSocket(
      playerId,
      (data) => { if (data.type === "match_found") handleMatchFound(data); },
      () => {},
      () => {}
    );
    return () => disconnectGlobalSocket();
  }, [playerId, settings.language]);

  useEffect(() => {
    if (!currentDuel?.duel_id) {
      disconnectDuelSocket();
      setSocketState("disconnected");
      return;
    }
    setSocketState("connecting");
    connectToDuelSocket(
      currentDuel.duel_id,
      (data) => {
        if (data.type === "score_update" && data.scores) setLiveScores(data.scores);
        if (data.type === "duel_finished" && data.result) {
          setResult(data.result);
          setCurrentDuel(null);
          setSocketState("disconnected");
          disconnectDuelSocket();
          notifyInfo("Duel terminé", "Le résultat du duel est disponible.");
        }
      },
      () => setSocketState("connected"),
      () => setSocketState("disconnected")
    );
    return () => { disconnectDuelSocket(); setSocketState("disconnected"); };
  }, [currentDuel?.duel_id, notifyInfo]);

  useEffect(() => {
    if (!playerId) return;
    if (currentDuel || result) stopLobbyMusic();
    else startLobbyMusic();
  }, [playerId, currentDuel, result, settings.music_enabled, startLobbyMusic, stopLobbyMusic]);

  async function handleDuelFinished(res) {
    setCurrentDuel(null);
    setResult(res);
    disconnectDuelSocket();
    setSocketState("disconnected");
    notifyInfo("Partie terminée", "Le résultat a bien été enregistré.");
  }

  async function handleExitResult() {
    setResult(null);
    await loadAllLobbyData();
  }

  if (!playerId) return <p style={{ padding: 24 }}>{tr("error")} : {tr("noPlayerConnected")}</p>;

  if (result) {
    return <MatchResult result={result} playerId={playerId} onExit={handleExitResult} />;
  }

  const currentRank = playerStats ? getRankFromElo(playerStats.elo) : null;
  const currentRankProgress = playerStats ? getRankProgress(playerStats.elo) : 0;
  const currentReward = currentRank ? getRankReward(currentRank.key) : null;
  const nextReward = currentRank?.next ? getRankReward(currentRank.next) : null;

  if (currentDuel) {
    return (
      <GameScreen
        duel={currentDuel}
        playerId={playerId}
        socketState={socketState}
        liveScores={liveScores}
        onGameFinished={handleDuelFinished}
      />
    );
  }

  return (
    <div className="app-shell">
      <SessionBar />

      <div style={{ marginBottom: "28px" }}>
        <h1 className="hero-title">{tr("appName")}</h1>
        <p className="hero-subtitle">
          {tr("welcome")}, <strong style={{ color: "var(--clr-orange)" }}>{playerId}</strong>
        </p>
      </div>

      {/* Game Selection */}
      <SectionCard title={tr("chooseGame")}>
        <div className="stats-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-box">
            <strong>{tr("stake")}</strong>
            <input
              type="number"
              min="0"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              style={{ marginTop: "8px", width: "100%" }}
            />
          </div>
          <div className="stat-box">
            <strong>{tr("selectedGame")}</strong>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{ marginTop: "8px", width: "100%" }}
            >
              {GAMES.map((g) => (
                <option key={g} value={g}>{gameLabel(settings.language, g)}</option>
              ))}
            </select>
          </div>
        </div>

        <Matchmaker
          playerId={playerId}
          game={selectedGame}
          stake={Number(stake)}
          onMatchFound={handleMatchFound}
        />
      </SectionCard>

      <Profile />
      <Settings />

      {/* Player Stats */}
      <SectionCard
        title={tr("playerStats")}
        right={currentRank ? <RankBadge rankKey={currentRank.key} /> : null}
      >
        <div className="inline-button-group" style={{ marginBottom: "16px" }}>
          {["snake", "reflex", "memory", "tetris", "checkers", "chess"].map((g) => (
            <button
              key={g}
              className={statsGame === g ? "" : "btn-ghost"}
              style={{ padding: "6px 14px", fontSize: "0.75rem" }}
              onClick={() => setStatsGame(g)}
            >
              {tr(g)}
            </button>
          ))}
        </div>

        {playerStats && (
          <>
            <div className="stats-grid">
              {[
                [tr("globalElo"), playerStats.elo],
                [tr("rank"), <RankBadge key="rank" rankKey={currentRank?.key} />],
                [tr("wins"), playerStats.wins],
                [tr("losses"), playerStats.losses],
                [tr("gamesPlayed"), playerStats.games_played],
                [tr("winStreak"), playerStats.win_streak],
                [tr("balance"), playerStats.balance],
                [`${gameLabel(settings.language, playerStats.selected_game)} ELO`, playerStats.current_game_elo],
                [`${tr("wins")} ${gameLabel(settings.language, playerStats.selected_game)}`, playerStats.current_game_stats?.wins],
                [`${tr("losses")} ${gameLabel(settings.language, playerStats.selected_game)}`, playerStats.current_game_stats?.losses],
              ].map(([label, value]) => (
                <div key={label} className="stat-box">
                  <strong>{label}</strong>
                  <div>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {tr("progressToNextRank")}
                </span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--clr-orange)" }}>
                  {currentRankProgress}%
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${currentRankProgress}%` }} />
              </div>
            </div>

            {(currentReward || nextReward) && (
              <div className="stats-grid" style={{ marginTop: "16px" }}>
                {currentReward && (
                  <div className="stat-box">
                    <strong>{tr("rankReward")}</strong>
                    <div>{currentReward.label}</div>
                  </div>
                )}
                {nextReward && (
                  <div className="stat-box">
                    <strong>{tr("nextRankReward")}</strong>
                    <div>{nextReward.label}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SectionCard>

      {playerStats && <ProgressionPanel elo={playerStats.elo} />}

      <SeasonPanel />
      <SeasonResultsPanel />
      <BadgesPanel />
      <NotificationsPanel />
      <KycPanel />
      <TierPanel />
      <VipBenefitsPanel />
      <PromoCodePanel />
      <ReferralPanel />
      <BattlePassPanel />
      <BattlePassMissionsPanel />
      <BattlePassHistoryPanel />
      <LimitsPanel />

      <div style={{ marginTop: "24px" }}>
        <Wallet />
      </div>

      {/* Leaderboard */}
      <SectionCard title={leaderboardMode === "season" ? "Classement Saison" : tr("leaderboard")}>
        <div className="inline-button-group" style={{ marginBottom: "14px" }}>
          <button
            className={leaderboardMode === "global" ? "" : "btn-ghost"}
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
            onClick={() => setLeaderboardMode("global")}
          >
            {tr("global")}
          </button>
          <button
            className={leaderboardMode === "season" ? "" : "btn-ghost"}
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
            onClick={() => setLeaderboardMode("season")}
          >
            SAISON
          </button>
        </div>

        {leaderboardMode === "global" && (
          <div className="inline-button-group" style={{ marginBottom: "14px" }}>
            {["global", "snake", "reflex", "memory", "tetris", "checkers", "chess"].map((g) => (
              <button
                key={g}
                className={leaderboardGame === g ? "" : "btn-ghost"}
                style={{ padding: "5px 10px", fontSize: "0.72rem" }}
                onClick={() => setLeaderboardGame(g)}
              >
                {g === "global" ? tr("global") : tr(g)}
              </button>
            ))}
          </div>
        )}

        <div className="simple-list">
          {leaderboard.map((player, index) => {
            const rank = getRankFromElo(player.display_elo);
            const rankClass = index === 0 ? " leaderboard-item--top1" : index === 1 ? " leaderboard-item--top2" : index === 2 ? " leaderboard-item--top3" : "";
            return (
              <div key={index} className={`leaderboard-item${rankClass}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    color: index < 3 ? "var(--clr-orange)" : "var(--clr-text-muted)",
                    minWidth: "28px",
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontWeight: 600 }}>{player.player}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--clr-text-dim)" }}>
                    ELO <strong style={{ color: "var(--clr-text)" }}>{player.display_elo}</strong>
                    {"  "}·{"  "}
                    {tr("wins")} <strong style={{ color: "var(--clr-text)" }}>{player.display_wins}</strong>
                  </span>
                  {rank && <RankBadge rankKey={rank.key} />}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <Tournaments />

      {/* Daily Missions */}
      <SectionCard title={tr("dailyMissions")}>
        <div className="simple-list">
          {missions.map((mission, index) => (
            <div key={index} className="simple-list-item" style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}>
              <span>{missionLabel(settings.language, mission.name)}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--clr-orange)", fontWeight: 700 }}>
                  +{mission.reward}
                </span>
                <span className={`badge ${mission.done ? "badge-success" : "badge-muted"}`}>
                  {mission.done ? tr("done") : tr("pending")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Match History */}
      <SectionCard title={tr("matchHistory")}>
        {history.length === 0 ? (
          <p>{tr("empty")}</p>
        ) : (
          <div className="simple-list">
            {history.map((match, index) => (
              <div key={index} className="simple-list-item" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}>
                <span>
                  <span style={{ color: "var(--clr-orange)", fontWeight: 700 }}>
                    {gameLabel(settings.language, String(match.game).toLowerCase())}
                  </span>
                  {"  "}—{"  "}
                  {match.player1} <span style={{ color: "var(--clr-text-muted)" }}>vs</span> {match.player2}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--clr-text-dim)" }}>
                    {tr("stake")} : <strong style={{ color: "var(--clr-text)" }}>{match.stake ?? 0}</strong>
                  </span>
                  <span className={`badge ${match.winner === playerId ? "badge-success" : match.winner ? "badge-error" : "badge-muted"}`}>
                    {match.winner ?? tr("draw")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {role === "admin" && (
        <div style={{ marginTop: "28px" }}>
          <Link
            to="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "rgba(255,107,0,0.1)",
              border: "1px solid rgba(255,107,0,0.35)",
              color: "var(--clr-orange)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.18)";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(255,107,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ⚙ Panel Admin
          </Link>
        </div>
      )}
    </div>
  );
}
