import { createContext, useEffect, useState } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [playerId, setPlayerId] = useState("");
  const [balance, setBalance] = useState(0);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("user");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const savedPlayerId = localStorage.getItem("skillsbet_player_id");
    const savedToken = localStorage.getItem("skillsbet_token");
    const savedRole = localStorage.getItem("skillsbet_role");
    const savedBalance = localStorage.getItem("skillsbet_balance");
    const savedAvatar = localStorage.getItem("skillsbet_avatar_url");

    if (savedPlayerId) setPlayerId(savedPlayerId);
    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedAvatar) setAvatarUrl(savedAvatar);

    function handleForcedLogout() {
      logoutPlayer();
    }

    window.addEventListener("skillsbet:logout", handleForcedLogout);

    return () => {
      window.removeEventListener("skillsbet:logout", handleForcedLogout);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("skillsbet_balance", String(balance || 0));
  }, [balance]);

  useEffect(() => {
    if (avatarUrl) {
      localStorage.setItem("skillsbet_avatar_url", avatarUrl);
    } else {
      localStorage.removeItem("skillsbet_avatar_url");
    }
  }, [avatarUrl]);

  function loginPlayer(newPlayerId, newToken, newRole = "user") {
    setPlayerId(newPlayerId);
    setToken(newToken || "");
    setRole(newRole || "user");

    localStorage.setItem("skillsbet_player_id", newPlayerId);

    if (newToken) {
      localStorage.setItem("skillsbet_token", newToken);
    } else {
      localStorage.removeItem("skillsbet_token");
    }

    localStorage.setItem("skillsbet_role", newRole || "user");
  }

  function logoutPlayer() {
    setPlayerId("");
    setToken("");
    setRole("user");
    setBalance(0);
    setAvatarUrl("");

    localStorage.removeItem("skillsbet_player_id");
    localStorage.removeItem("skillsbet_token");
    localStorage.removeItem("skillsbet_role");
    localStorage.removeItem("skillsbet_balance");
    localStorage.removeItem("skillsbet_avatar_url");

    localStorage.removeItem("duel_id");
    localStorage.removeItem("scores");
    localStorage.removeItem("xp");
    localStorage.removeItem("badges");
    localStorage.removeItem("wallet");
  }

  return (
    <PlayerContext.Provider
      value={{
        playerId,
        setPlayerId,
        balance,
        setBalance,
        token,
        setToken,
        role,
        setRole,
        avatarUrl,
        setAvatarUrl,
        loginPlayer,
        logoutPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}