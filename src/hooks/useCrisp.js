import { useContext, useEffect, useCallback } from "react";
import { PlayerContext } from "../context/PlayerContext";

const CRISP_ID = import.meta.env.VITE_CRISP_WEBSITE_ID;

/** Open the Crisp chat bubble programmatically — safe to call from anywhere. */
export function openChat() {
  if (window.$crisp) {
    window.$crisp.push(["do", "chat:open"]);
  }
}

export function useCrisp() {
  const { playerId, playerXp, subscriptionTier } = useContext(PlayerContext);

  /* Load Crisp script dynamically and bootstrap */
  useEffect(() => {
    if (!CRISP_ID) return;
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = CRISP_ID;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
    s.onload = () => {
      if (window.$crisp) {
        window.$crisp.push(["config", "color:theme", "#FF6B00"]);
      }
    };
  }, []);

  /* Push user identity whenever login state changes */
  useEffect(() => {
    if (!CRISP_ID || !window.$crisp) return;

    if (playerId) {
      /* playerId doubles as email in this app (matches Sentry pattern) */
      window.$crisp.push(["set", "user:email", [playerId]]);
      window.$crisp.push(["set", "user:nickname", [playerId]]);
      window.$crisp.push(["set", "session:data", [[
        ["pseudo", playerId],
        ["xp", playerXp],
        ["plan", subscriptionTier],
      ]]]);
    }
  }, [playerId, playerXp, subscriptionTier]);

  /* Reset session on logout */
  const resetCrisp = useCallback(() => {
    if (window.$crisp) {
      window.$crisp.push(["do", "session:reset"]);
    }
  }, []);

  return { openChat, resetCrisp };
}
