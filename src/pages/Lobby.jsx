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

  const loadLeaderboardData = useCallback(async () => {
    try {
      if (leaderboardMode === "season") {
        const data = await getSeasonLeaderboard();
        const normalized = Array.isArray(data)
          ? data.map((row) => ({
              player: row.player,
              display_elo: row.elo,
              display_wins: row.wins,
            }))
          : [];

        setLeaderboard(normalized);
        return;
      }

      const leaderboardGameParam =
        leaderboardGame === "global" ? null : leaderboardGame;

      const lb = await getLeaderboard(leaderboardGameParam);
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
      notifyError(
        "Erreur lobby",
        error.message || "Impossible de charger les données du lobby."
      );
    }
  }, [playerId, statsGame, notifyError]);

  const loadAllLobbyData = useCallback(async () => {
    await Promise.all([loadLeaderboardData(), loadLobbyCoreData()]);
  }, [loadLeaderboardData, loadLobbyCoreData]);

  function handleMatchFound(matchData) {
    setLiveScores({});
    playMatchFound();

    notifySuccess(
      "Match trouvé",
      `${matchData.players[0]} vs ${matchData.players[1]} — ${gameLabel(
        settings.language,
        matchData.game
      )}`
    );

    setCurrentDuel((prev) => {
      if (prev?.duel_id === matchData.duel_id) {
        return prev;
      }

      return {
        duel_id: matchData.duel_id,
        player1: matchData.players[0],
        player2: matchData.players[1],
        game: matchData.game,
        stake: matchData.stake,
      };
    });
  }

  useEffect(() => {
    loadAllLobbyData();
  }, [loadAllLobbyData]);


  useEffect(() => {
    if (!playerId) return;

    connectGlobalSocket(
      playerId,
      (data) => {
        if (data.type === "match_found") {
          handleMatchFound(data);
        }
      },
      () => {
        console.log("Global socket connected");
      },
      () => {
        console.log("Global socket disconnected");
      }
    );

    return () => {
      disconnectGlobalSocket();
    };
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
        if (data.type === "score_update" && data.scores) {
          setLiveScores(data.scores);
        }

        if (data.type === "duel_finished" && data.result) {
          setResult(data.result);
          setCurrentDuel(null);
          setSocketState("disconnected");
          disconnectDuelSocket();
          notifyInfo("Duel terminé", "Le résultat du duel est disponible.");
        }
      },
      () => {
        setSocketState("connected");
      },
      () => {
        setSocketState("disconnected");
      }
    );

    return () => {
      disconnectDuelSocket();
      setSocketState("disconnected");
    };
  }, [currentDuel?.duel_id, notifyInfo]);

  useEffect(() => {
    if (!playerId) return;

    if (currentDuel || result) {
      stopLobbyMusic();
    } else {
      startLobbyMusic();
    }
  }, [
    playerId,
    currentDuel,
    result,
    settings.music_enabled,
    startLobbyMusic,
    stopLobbyMusic,
  ]);

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

  if (!playerId) {
    return (
      <p>
        {tr("error")} : {tr("noPlayerConnected")}
      </p>
    );
  }

  if (result) {
    return (
      <MatchResult
        result={result}
        playerId={playerId}
        onExit={handleExitResult}
      />
    );
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

      <h1 className="hero-title">{tr("appName")}</h1>
      <h2 className="hero-subtitle">
        {tr("welcome")}, {playerId}
      </h2>

      <SectionCard title={tr("chooseGame")}>
        <div style={{ marginTop: "12px" }}>
          <label>
            <strong>{tr("stake")} :</strong>
          </label>
          <br />
          <input
            type="number"
            min="0"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            style={{ marginTop: "8px", width: "120px" }}
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <label>
            <strong>{tr("selectedGame")} :</strong>
          </label>
          <br />
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            style={{ marginTop: "8px" }}
          >
            <option value="snake">{tr("snake")}</option>
            <option value="reflex">{tr("reflex")}</option>
            <option value="memory">{tr("memory")}</option>
            <option value="tetris">{tr("tetris")}</option>
            <option value="checkers">{tr("checkers")}</option>
            <option value="chess">{tr("chess")}</option>
            <option value="dames">Dames</option>
            <option value="uno">UNO</option>
          </select>
        </div>

        <p style={{ marginTop: "12px" }}>
          <strong>{tr("selectedGame")} :</strong>{" "}
          {gameLabel(settings.language, selectedGame)}
        </p>

        <Matchmaker
          playerId={playerId}
          game={selectedGame}
          stake={Number(stake)}
          onMatchFound={handleMatchFound}
        />
      </SectionCard>

      <Profile />
      <Settings />

      <SectionCard
        title={tr("playerStats")}
        right={currentRank ? <RankBadge rankKey={currentRank.key} /> : null}
      >
        <div className="inline-button-group" style={{ marginBottom: "12px" }}>
          <button onClick={() => setStatsGame("snake")}>{tr("snake")}</button>
          <button onClick={() => setStatsGame("reflex")}>{tr("reflex")}</button>
          <button onClick={() => setStatsGame("memory")}>{tr("memory")}</button>
          <button onClick={() => setStatsGame("tetris")}>{tr("tetris")}</button>
          <button onClick={() => setStatsGame("checkers")}>{tr("checkers")}</button>
          <button onClick={() => setStatsGame("chess")}>{tr("chess")}</button>
        </div>

        {playerStats && (
          <>
            <div className="stats-grid">
              <div className="stat-box">
                <strong>{tr("globalElo")} :</strong> {playerStats.elo}
              </div>
              <div className="stat-box">
                <strong>{tr("rank")} :</strong>{" "}
                <RankBadge rankKey={currentRank.key} />
              </div>
              <div className="stat-box">
                <strong>{tr("wins")} :</strong> {playerStats.wins}
              </div>
              <div className="stat-box">
                <strong>{tr("losses")} :</strong> {playerStats.losses}
              </div>
              <div className="stat-box">
                <strong>{tr("gamesPlayed")} :</strong> {playerStats.games_played}
              </div>
              <div className="stat-box">
                <strong>{tr("winStreak")} :</strong> {playerStats.win_streak}
              </div>
              <div className="stat-box">
                <strong>{tr("balance")} :</strong> {playerStats.balance}
              </div>
              <div className="stat-box">
                <strong>{tr("selectedGame")} :</strong>{" "}
                {gameLabel(settings.language, playerStats.selected_game)}
              </div>
              <div className="stat-box">
                <strong>
                  {gameLabel(settings.language, playerStats.selected_game)} ELO :
                </strong>{" "}
                {playerStats.current_game_elo}
              </div>
              <div className="stat-box">
                <strong>
                  {tr("wins")} {gameLabel(settings.language, playerStats.selected_game)} :
                </strong>{" "}
                {playerStats.current_game_stats?.wins}
              </div>
              <div className="stat-box">
                <strong>
                  {tr("losses")} {gameLabel(settings.language, playerStats.selected_game)} :
                </strong>{" "}
                {playerStats.current_game_stats?.losses}
              </div>
              <div className="stat-box">
                <strong>
                  {tr("gamesPlayed")} {gameLabel(settings.language, playerStats.selected_game)} :
                </strong>{" "}
                {playerStats.current_game_stats?.games_played}
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <p style={{ marginBottom: "8px" }}>
                <strong>{tr("progressToNextRank")} :</strong> {currentRankProgress}%
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
                    width: `${currentRankProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #3b82f6, #22c55e)",
                  }}
                />
              </div>
            </div>

            {currentReward && (
              <div style={{ marginTop: "16px" }} className="stat-box">
                <strong>{tr("rankReward")} :</strong> {currentReward.label}
              </div>
            )}

            {nextReward && (
              <div style={{ marginTop: "12px" }} className="stat-box">
                <strong>{tr("nextRankReward")} :</strong> {nextReward.label}
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

      <SectionCard
        title={leaderboardMode === "season" ? "Classement Saison" : tr("leaderboard")}
      >
        <div className="inline-button-group" style={{ marginBottom: "12px" }}>
          <button onClick={() => setLeaderboardMode("global")}>{tr("global")}</button>
          <button onClick={() => setLeaderboardMode("season")}>Saison</button>
        </div>

        {leaderboardMode === "global" && (
          <div className="inline-button-group" style={{ marginBottom: "12px" }}>
            <button onClick={() => setLeaderboardGame("global")}>{tr("global")}</button>
            <button onClick={() => setLeaderboardGame("snake")}>{tr("snake")}</button>
            <button onClick={() => setLeaderboardGame("reflex")}>{tr("reflex")}</button>
            <button onClick={() => setLeaderboardGame("memory")}>{tr("memory")}</button>
            <button onClick={() => setLeaderboardGame("tetris")}>{tr("tetris")}</button>
            <button onClick={() => setLeaderboardGame("checkers")}>{tr("checkers")}</button>
            <button onClick={() => setLeaderboardGame("chess")}>{tr("chess")}</button>
          </div>
        )}

        <div className="simple-list">
          {leaderboard.map((player, index) => {
            const rank = getRankFromElo(player.display_elo);

            return (
              <div key={index} className="simple-list-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    #{index + 1} — {player.player} — ELO {player.display_elo} — {tr("wins")}{" "}
                    {player.display_wins}
                  </div>

                  <RankBadge rankKey={rank.key} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <Tournaments />

      <SectionCard title={tr("dailyMissions")}>
        <div className="simple-list">
          {missions.map((mission, index) => (
            <div key={index} className="simple-list-item">
              {missionLabel(settings.language, mission.name)} — {tr("reward")} {mission.reward} —{" "}
              {mission.done ? tr("done") : tr("pending")}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={tr("matchHistory")}>
        {history.length === 0 ? (
          <p>{tr("empty")}</p>
        ) : (
          <div className="simple-list">
            {history.map((match, index) => (
              <div key={index} className="simple-list-item">
                {gameLabel(settings.language, String(match.game).toLowerCase())} —{" "}
                {match.player1} vs {match.player2} — {tr("winner")} :{" "}
                {match.winner ?? tr("draw")} — {tr("stake")} : {match.stake ?? 0}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {role === "admin" && (
        <div style={{ marginTop: "24px" }}>
          <Link
            to="/admin"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#f97316",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Panel Admin
          </Link>
        </div>
      )}
    </div>
  );
}