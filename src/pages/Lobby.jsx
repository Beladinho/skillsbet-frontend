import { useCallback, useContext, useEffect, useRef, useState, lazy, Suspense } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { useMusic } from "../context/MusicContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { gameLabel, missionLabel } from "../i18n";
import { getRankFromElo, getRankProgress } from "../ranking";
import { getRankReward } from "../rankRewards";

import Skeleton from "../components/Skeleton";
import TiltCard from "../components/TiltCard";
import { useCountUp } from "../hooks/useCountUp";
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

const LineUp4BotGame    = lazy(() => import("../components/games/LineUp4BotGame"));
const XOBattleBotGame   = lazy(() => import("../components/games/XOBattleBotGame"));
const ViperSoloGame     = lazy(() => import("../components/games/ViperSoloGame"));
const FlipMatchSoloGame = lazy(() => import("../components/games/FlipMatchSoloGame"));
const BlockDropSoloGame = lazy(() => import("../components/games/BlockDropSoloGame"));
const DraughtWarBotGame = lazy(() => import("../components/games/DraughtWarBotGame"));
const KingSlayerBotGame = lazy(() => import("../components/games/KingSlayerBotGame"));
const ColorBlitzBotGame  = lazy(() => import("../components/games/ColorBlitzBotGame"));
const QuickShotSoloGame  = lazy(() => import("../components/games/QuickShotSoloGame"));
const GridBlitzSoloGame  = lazy(() => import("../components/games/GridBlitzSoloGame"));

const SOLO_GAMES = [
  { key: "snake",      label: "Viper"       },
  { key: "reflex",     label: "QuickShot"   },
  { key: "lineup4",    label: "LineUp4"     },
  { key: "xobattle",   label: "XO Battle"  },
  { key: "memory",     label: "FlipMatch"  },
  { key: "tetris",     label: "BlockDrop"  },
  { key: "checkers",   label: "DraughtWar" },
  { key: "chess",      label: "KingSlayer" },
  { key: "uno",        label: "ColorBlitz" },
  { key: "2048",       label: "GridBlitz"  },
];

const DIFFICULTIES = {
  default: [
    { key: "easy",   label: "Facile",    desc: "Joue aléatoirement" },
    { key: "medium", label: "Moyen",     desc: "Bloque et attaque" },
    { key: "hard",   label: "Difficile", desc: "Minimax profondeur 4" },
    { key: "expert", label: "Expert",    desc: "Minimax profondeur 6" },
  ],
  snake: [
    { key: "easy",   label: "Facile",    desc: "Vitesse lente" },
    { key: "medium", label: "Moyen",     desc: "Vitesse normale" },
    { key: "hard",   label: "Difficile", desc: "Vitesse rapide" },
    { key: "expert", label: "Expert",    desc: "Vitesse extrême" },
  ],
  memory: [
    { key: "easy",   label: "Facile",    desc: "Grille 4×4 (8 paires)" },
    { key: "medium", label: "Moyen",     desc: "Grille 4×4 (8 paires)" },
    { key: "hard",   label: "Difficile", desc: "Grille 5×5 (12 paires)" },
    { key: "expert", label: "Expert",    desc: "Grille 6×6 (18 paires)" },
  ],
  tetris: [
    { key: "easy",   label: "Facile",    desc: "Vitesse lente" },
    { key: "medium", label: "Moyen",     desc: "Vitesse normale" },
    { key: "hard",   label: "Difficile", desc: "Vitesse rapide" },
    { key: "expert", label: "Expert",    desc: "Vitesse extrême" },
  ],
  uno: [
    { key: "easy",   label: "Facile",    desc: "Gagner 5 manches" },
    { key: "medium", label: "Moyen",     desc: "Gagner 7 manches" },
    { key: "hard",   label: "Difficile", desc: "Gagner 10 manches" },
    { key: "expert", label: "Expert",    desc: "Gagner 15 manches" },
  ],
  reflex: [
    { key: "easy",   label: "Facile",    desc: "30s · cibles lentes" },
    { key: "medium", label: "Moyen",     desc: "20s · vitesse normale" },
    { key: "hard",   label: "Difficile", desc: "15s · cibles rapides" },
    { key: "expert", label: "Expert",    desc: "10s · cibles éclair" },
  ],
  "2048": [
    { key: "easy",   label: "Facile",    desc: "Objectif : tuile 256" },
    { key: "medium", label: "Moyen",     desc: "Objectif : tuile 512" },
    { key: "hard",   label: "Difficile", desc: "Objectif : tuile 1024" },
    { key: "expert", label: "Expert",    desc: "Objectif : tuile 2048" },
  ],
};

import MatchResult from "../pages/MatchResult";
import Tournaments from "../pages/Tournaments";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

import { Link } from "react-router-dom";

function CountUpStat({ value }) {
  const animated = useCountUp(Number(value) || 0);
  return <>{animated}</>;
}

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
  sendDuelSocketMessage,
} from "../api/socket";
import { getApprovedGames } from "../api/creatorApi";

export default function Lobby() {
  const { playerId, role, avatarUrl } = useContext(PlayerContext);
  const { tr, settings } = useAppSettings();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  const { playMatchFound } = useSounds();
  const { startLobbyMusic, stopLobbyMusic } = useMusic();
  const { sendLocalPush } = usePushNotifications();
  const prevMissionsRef = useRef([]);

  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [missions, setMissions] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [coreLoading, setCoreLoading] = useState(true);
  const [currentDuel, setCurrentDuel] = useState(null);
  const [result, setResult] = useState(null);

  const [stake, setStake] = useState(10);
  const [selectedGame, setSelectedGame] = useState("snake");

  const [showSoloModal, setShowSoloModal] = useState(false);
  const [soloGame, setSoloGame] = useState("lineup4");
  const [soloDifficulty, setSoloDifficulty] = useState("medium");
  const [soloConfig, setSoloConfig] = useState(null);

  const [creatorGames, setCreatorGames] = useState([]);

  const [statsGame, setStatsGame] = useState("snake");
  const [leaderboardGame, setLeaderboardGame] = useState("global");
  const [leaderboardMode, setLeaderboardMode] = useState("global");

  const [socketState, setSocketState] = useState("disconnected");
  const [liveScores, setLiveScores] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [duelAvatarUrls, setDuelAvatarUrls] = useState({});

  const GAMES = ["snake", "reflex", "memory", "tetris", "checkers", "chess", "uno", "lineup4", "xobattle"];

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
      const normalized = Array.isArray(lb)
        ? lb.map((row) => ({ player: row.player, display_elo: row.elo ?? row.display_elo, display_wins: row.wins ?? row.display_wins }))
        : [];
      setLeaderboard(normalized);
    } catch (error) {
      console.error("Erreur chargement leaderboard :", error);
    }
  }, [leaderboardGame, leaderboardMode]);

  const loadLobbyCoreData = useCallback(async () => {
    setCoreLoading(true);
    try {
      if (!playerId) return;
      const [hist, mis, stats] = await Promise.all([
        getMatchHistory(playerId),
        getMissions(playerId),
        getPlayerStats(playerId, statsGame),
      ]);
      setHistory(Array.isArray(hist) ? hist : []);
      const newMissions = Array.isArray(mis) ? mis : [];
      const prev = prevMissionsRef.current;
      if (prev.length > 0) {
        newMissions.forEach((m) => {
          const old = prev.find((p) => p.id === m.id || p.label === m.label);
          if (m.done && old && !old.done) {
            notifySuccess("Mission accomplie !", missionLabel(settings.language, m.label || m.id));
            sendLocalPush("Mission accomplie !", missionLabel(settings.language, m.label || m.id));
          }
        });
      }
      prevMissionsRef.current = newMissions;
      setMissions(newMissions);
      setPlayerStats(stats || null);
    } catch (error) {
      console.error("Erreur chargement données lobby :", error);
      notifyError("Erreur lobby", error.message || "Impossible de charger les données du lobby.");
    } finally {
      setCoreLoading(false);
    }
  }, [playerId, statsGame, notifyError]);

  const loadAllLobbyData = useCallback(async () => {
    await Promise.all([loadLeaderboardData(), loadLobbyCoreData()]);
  }, [loadLeaderboardData, loadLobbyCoreData]);

  function handleSendChat(message, kind) {
    const msg = { type: "chat", player_id: playerId, message, kind };
    setChatMessages((prev) => [...prev, msg]);
    sendDuelSocketMessage(msg);
  }

  async function fetchDuelAvatars(players) {
    const map = {};
    if (playerId && avatarUrl) map[playerId] = avatarUrl;
    await Promise.all(
      players.map(async (pid) => {
        if (map[pid]) return;
        try {
          const stats = await getPlayerStats(pid);
          if (stats?.avatar_url) map[pid] = stats.avatar_url;
        } catch {}
      })
    );
    setDuelAvatarUrls(map);
  }

  function handleMatchFound(matchData) {
    setChatMessages([]);
    setLiveScores({});
    playMatchFound();
    notifySuccess("Match trouvé", `${matchData.players[0]} vs ${matchData.players[1]} — ${gameLabel(settings.language, matchData.game)}`);
    sendLocalPush("Match trouvé !", `${matchData.players[0]} vs ${matchData.players[1]} — ${gameLabel(settings.language, matchData.game)}`);
    setCurrentDuel((prev) => {
      if (prev?.duel_id === matchData.duel_id) return prev;
      return { duel_id: matchData.duel_id, player1: matchData.players[0], player2: matchData.players[1], game: matchData.game, stake: matchData.stake };
    });
    fetchDuelAvatars(matchData.players);
  }

  useEffect(() => { loadAllLobbyData(); }, [loadAllLobbyData]);

  useEffect(() => { setCreatorGames(getApprovedGames()); }, []);

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
        if (data.type === "chat" && data.player_id !== playerId) {
          setChatMessages((prev) => [...prev, data]);
          sendLocalPush("Message reçu", `${data.player_id} : ${String(data.message || "").slice(0, 80)}`);
        }
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
    return <MatchResult result={result} playerId={playerId} onExit={handleExitResult} avatarUrls={duelAvatarUrls} />;
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
        chatMessages={chatMessages}
        onSendChat={handleSendChat}
        onGameFinished={handleDuelFinished}
        avatarUrls={duelAvatarUrls}
      />
    );
  }

  if (soloConfig) {
    const soloProps = { difficulty: soloConfig.difficulty, playerId, onExit: () => setSoloConfig(null) };
    return (
      <div className="app-shell">
        <SessionBar />
        <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
          {soloConfig.game === "lineup4"  && <LineUp4BotGame    {...soloProps} />}
          {soloConfig.game === "xobattle" && <XOBattleBotGame   {...soloProps} />}
          {soloConfig.game === "snake"    && <ViperSoloGame      {...soloProps} />}
          {soloConfig.game === "reflex"   && <QuickShotSoloGame  {...soloProps} />}
          {soloConfig.game === "memory"   && <FlipMatchSoloGame  {...soloProps} />}
          {soloConfig.game === "tetris"   && <BlockDropSoloGame  {...soloProps} />}
          {soloConfig.game === "checkers" && <DraughtWarBotGame  {...soloProps} />}
          {soloConfig.game === "chess"    && <KingSlayerBotGame  {...soloProps} />}
          {soloConfig.game === "uno"      && <ColorBlitzBotGame  {...soloProps} />}
          {soloConfig.game === "2048"     && <GridBlitzSoloGame  {...soloProps} />}
        </Suspense>
      </div>
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

      <div className="lobby-sections">

      {/* Game Selection */}
      <SectionCard title={tr("chooseGame")} style={{ "--section-delay": "0.05s" }}>
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

        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--clr-border)" }}>
          <button
            onClick={() => setShowSoloModal(true)}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(0,180,216,0.08)",
              border: "1px solid rgba(0,180,216,0.35)",
              color: "#00b4d8",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "0.88rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,180,216,0.15)"; e.currentTarget.style.boxShadow = "0 0 14px rgba(0,180,216,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,180,216,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            ▶ Jouer en solo
          </button>
        </div>
      </SectionCard>

      {/* Solo mode modal */}
      {showSoloModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowSoloModal(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div style={{
            background: "var(--clr-surface-1)",
            border: "1px solid rgba(0,180,216,0.4)",
            borderRadius: "var(--radius-lg)",
            padding: "28px 32px",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 0 40px rgba(0,180,216,0.15)",
          }}>
            <h3 style={{ color: "#00b4d8", marginBottom: "20px", fontSize: "1.4rem", letterSpacing: "3px" }}>
              Mode Solo
            </h3>

            {/* Game selector */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-muted)", marginBottom: "10px" }}>
                Jeu
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {SOLO_GAMES.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setSoloGame(g.key)}
                    className={soloGame === g.key ? "" : "btn-ghost"}
                    style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selector */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-muted)", marginBottom: "10px" }}>
                Difficulté
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(DIFFICULTIES[soloGame] ?? DIFFICULTIES.default).map(d => (
                  <button
                    key={d.key}
                    onClick={() => setSoloDifficulty(d.key)}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      background: soloDifficulty === d.key ? "rgba(0,180,216,0.14)" : "rgba(255,255,255,0.03)",
                      border: soloDifficulty === d.key ? "1px solid rgba(0,180,216,0.6)" : "1px solid var(--clr-border)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.88rem", textTransform: "uppercase", color: soloDifficulty === d.key ? "#00b4d8" : "var(--clr-text)" }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)", marginTop: "2px" }}>
                      {d.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setSoloConfig({ game: soloGame, difficulty: soloDifficulty }); setShowSoloModal(false); }}
                style={{ flex: 1, padding: "12px" }}
              >
                ▶ Jouer
              </button>
              <button
                onClick={() => setShowSoloModal(false)}
                className="btn-ghost"
                style={{ padding: "12px 20px" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <Profile />
      <Settings />

      {/* Player Stats */}
      <SectionCard
        title={tr("playerStats")}
        right={currentRank ? <RankBadge rankKey={currentRank.key} /> : null}
        style={{ "--section-delay": "0.13s" }}
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

        {!playerStats && coreLoading && (
          <div className="stats-grid">
            {[...Array(6)].map((_, i) => <Skeleton key={i} height={72} />)}
          </div>
        )}

        {playerStats && (
          <>
            <div className="stats-grid">
              {[
                [tr("globalElo"), playerStats.elo, true],
                [tr("rank"), <RankBadge key="rank" rankKey={currentRank?.key} />, false],
                [tr("wins"), playerStats.wins, true],
                [tr("losses"), playerStats.losses, true],
                [tr("gamesPlayed"), playerStats.games_played, true],
                [tr("winStreak"), playerStats.win_streak, true],
                [tr("balance"), playerStats.balance, true],
                [`${gameLabel(settings.language, playerStats.selected_game)} ELO`, playerStats.current_game_elo, true],
                [`${tr("wins")} ${gameLabel(settings.language, playerStats.selected_game)}`, playerStats.current_game_stats?.wins, true],
                [`${tr("losses")} ${gameLabel(settings.language, playerStats.selected_game)}`, playerStats.current_game_stats?.losses, true],
              ].map(([label, value, isNumeric]) => (
                <div key={label} className="stat-box">
                  <strong>{label}</strong>
                  <div>{isNumeric ? <CountUpStat value={value} /> : value}</div>
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

      {/* Creator Games */}
      <SectionCard
        title="Jeux Créateurs"
        style={{ "--section-delay": "0.21s" }}
        right={
          <Link
            to="/creator"
            style={{ fontSize: "0.75rem", color: "var(--clr-orange)", textDecoration: "none", fontWeight: 700 }}
          >
            Espace Créateur →
          </Link>
        }
      >
        {creatorGames.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 16px" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>🎮</div>
            <p style={{ color: "var(--clr-text-muted)", fontSize: "0.85rem", marginBottom: "14px" }}>
              Aucun jeu créateur disponible pour l'instant.
            </p>
            <Link
              to="/creator"
              style={{
                display: "inline-block", padding: "9px 20px",
                background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.35)",
                borderRadius: "8px", color: "var(--clr-orange)", textDecoration: "none",
                fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.78rem",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}
            >
              Soumettre un jeu
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
            {creatorGames.map((game) => {
              const freeUntil = game.free_until ? new Date(game.free_until) : null;
              const isFree    = freeUntil && freeUntil > new Date();
              return (
                <Link
                  key={game.id}
                  to={`/creator/game/${game.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <TiltCard style={{
                    background: "var(--clr-surface-1)",
                    border: "1px solid var(--clr-border)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,0,0.5)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(255,107,0,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--clr-border)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {game.screenshot ? (
                      <img src={game.screenshot} alt={game.name} style={{ width: "100%", height: "100px", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100px", background: "rgba(255,107,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🎮</div>
                    )}
                    <div style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.88rem", textTransform: "uppercase", color: "var(--clr-text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {game.name}
                        </span>
                        <span style={{ padding: "2px 8px", background: isFree ? "rgba(34,197,94,0.1)" : "rgba(168,85,247,0.1)", border: `1px solid ${isFree ? "rgba(34,197,94,0.3)" : "rgba(168,85,247,0.3)"}`, borderRadius: "20px", fontSize: "0.62rem", fontWeight: 800, color: isFree ? "#22c55e" : "#a855f7", textTransform: "uppercase", flexShrink: 0 }}>
                          {isFree ? "Free" : "Premium"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)" }}>
                        par <strong style={{ color: "var(--clr-text)" }}>{game.creator_id}</strong>
                        {" · "}{game.plays || 0} parties
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Leaderboard */}
      <SectionCard title={leaderboardMode === "season" ? "Classement Saison" : tr("leaderboard")} style={{ "--section-delay": "0.29s" }}>
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

        {leaderboard.length === 0 && coreLoading && (
          <div className="simple-list">
            {[...Array(4)].map((_, i) => <Skeleton key={i} height={48} style={{ marginBottom: 6 }} />)}
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
      <SectionCard title={tr("dailyMissions")} style={{ "--section-delay": "0.37s" }}>
        {missions.length === 0 && coreLoading && (
          <div className="simple-list">
            {[...Array(3)].map((_, i) => <Skeleton key={i} height={44} style={{ marginBottom: 6 }} />)}
          </div>
        )}
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
      <SectionCard title={tr("matchHistory")} style={{ "--section-delay": "0.44s" }}>
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

      </div>{/* end .lobby-sections */}
    </div>
  );
}
