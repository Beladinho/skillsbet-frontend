import { createContext, useContext, useEffect, useRef } from "react";
import { PlayerContext } from "./PlayerContext";
import { useAppSettings } from "./AppSettingsContext";
import { useSocial } from "./SocialContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { getLeaderboard } from "../api/skillsbetApi";

export const AdvancedNotificationsContext = createContext(null);

const FRIEND_COOLDOWN_MS = 30 * 60 * 1000;
const LEADERBOARD_INTERVAL_MS = 60 * 60 * 1000;
const DAILY_CHECK_INTERVAL_MS = 60 * 1000;

export function AdvancedNotificationsProvider({ children }) {
  const { playerId } = useContext(PlayerContext);
  const { settings } = useAppSettings();
  const { friends } = useSocial();
  const { sendLocalPush } = usePushNotifications();

  const prevOnlineRef = useRef(new Map());
  const cooldownRef = useRef(new Map());
  const lastRankRef = useRef(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // ── 1. Friend online detection ───────────────────────────────────
  useEffect(() => {
    if (!playerId) return;

    friends.forEach((friend) => {
      const fid = friend.id;
      const wasOnline = prevOnlineRef.current.get(fid);
      const isNow = !!friend.is_online;

      if (!wasOnline && isNow) {
        const s = settingsRef.current;
        if (s.notifications_enabled && s.notif_friends_online) {
          const lastNotified = cooldownRef.current.get(fid) || 0;
          const now = Date.now();
          if (now - lastNotified >= FRIEND_COOLDOWN_MS) {
            cooldownRef.current.set(fid, now);
            sendLocalPush(
              `🟢 ${friend.display_name || fid} est en ligne`,
              "Défiez-le maintenant !",
              "/friends"
            );
          }
        }
      }

      prevOnlineRef.current.set(fid, isNow);
    });
  }, [friends, playerId, sendLocalPush]);

  // ── 2. Challenge accepted (global WS) ────────────────────────────
  useEffect(() => {
    if (!playerId) return;

    function onGlobalWs({ detail: data }) {
      if (!data) return;
      const s = settingsRef.current;
      if (
        data.type === "challenge_accepted" &&
        s.notifications_enabled &&
        s.notif_challenges
      ) {
        const pseudo = data.opponent_name || data.player_name || "Un ami";
        sendLocalPush(
          `⚔️ ${pseudo} accepte ton défi !`,
          "Le duel commence !",
          "/lobby"
        );
      }
    }

    window.addEventListener("skillsbet:ws-global", onGlobalWs);
    return () => window.removeEventListener("skillsbet:ws-global", onGlobalWs);
  }, [playerId, sendLocalPush]);

  // ── 3. Leaderboard overtake (hourly) ─────────────────────────────
  useEffect(() => {
    if (!playerId) return;

    async function checkRank() {
      const s = settingsRef.current;
      if (!s.notifications_enabled || !s.notif_leaderboard) return;

      try {
        const raw = await getLeaderboard();
        const entries = Array.isArray(raw) ? raw : (raw?.leaderboard ?? []);
        const myIdx = entries.findIndex(
          (e) => e.player_id === playerId || e.id === playerId
        );
        if (myIdx === -1) return;

        const myRank = myIdx + 1;

        if (lastRankRef.current !== null && myRank > lastRankRef.current) {
          const overtaker = entries[myIdx - 1];
          const pseudo =
            overtaker?.display_name || overtaker?.player_name || "Quelqu'un";
          sendLocalPush(
            `📉 ${pseudo} vient de te dépasser au classement !`,
            `Tu es maintenant #${myRank} au classement.`,
            "/stats"
          );
        }

        lastRankRef.current = myRank;
      } catch {}
    }

    checkRank();
    const id = setInterval(checkRank, LEADERBOARD_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playerId, sendLocalPush]);

  // ── 4. Accumulate daily stats via duel WS ────────────────────────
  useEffect(() => {
    if (!playerId) return;

    function onDuelWs({ detail: data }) {
      if (data?.type !== "duel_finished" || !data.result) return;
      const today = new Date().toISOString().slice(0, 10);
      const key = "skillsbet_daily_stats";
      let daily = {};
      try {
        daily = JSON.parse(localStorage.getItem(key) || "{}");
      } catch {}
      if (daily.date !== today) daily = { date: today, games: 0, wins: 0 };
      daily.games += 1;
      if (data.result.winner === playerId) daily.wins += 1;
      localStorage.setItem(key, JSON.stringify(daily));
    }

    window.addEventListener("skillsbet:ws-duel", onDuelWs);
    return () => window.removeEventListener("skillsbet:ws-duel", onDuelWs);
  }, [playerId]);

  // ── 5. Daily summary at 20h ──────────────────────────────────────
  useEffect(() => {
    if (!playerId) return;

    function checkDailySummary() {
      const s = settingsRef.current;
      if (!s.notifications_enabled || !s.notif_daily_summary) return;

      const now = new Date();
      if (now.getHours() !== 20 || now.getMinutes() !== 0) return;

      const today = now.toISOString().slice(0, 10);
      const summaryKey = "skillsbet_last_summary_date";
      if (localStorage.getItem(summaryKey) === today) return;

      let daily = {};
      try {
        daily = JSON.parse(localStorage.getItem("skillsbet_daily_stats") || "{}");
      } catch {}
      if (daily.date !== today || !daily.games) return;

      localStorage.setItem(summaryKey, today);

      const losses = daily.games - daily.wins;
      const eloChange = (daily.wins - losses) * 20;
      const eloStr = eloChange >= 0 ? `+${eloChange}` : `${eloChange}`;

      sendLocalPush(
        "📊 Résumé du jour",
        `${daily.games} partie${daily.games > 1 ? "s" : ""} · ${daily.wins} victoire${daily.wins > 1 ? "s" : ""} · ${eloStr} ELO`,
        "/stats"
      );
    }

    const id = setInterval(checkDailySummary, DAILY_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playerId, sendLocalPush]);

  return (
    <AdvancedNotificationsContext.Provider value={{}}>
      {children}
    </AdvancedNotificationsContext.Provider>
  );
}
