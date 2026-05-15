import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "./PlayerContext";
import {
  acceptFriendRequest,
  challengeFriend,
  deleteFriendship,
  getFriendRequests,
  getMyFriends,
  getSentRequests,
  rejectFriendRequest,
  searchPlayers,
  sendFriendRequest,
} from "../api/friendsApi";

const SocialContext = createContext(null);

export function SocialProvider({ children }) {
  const { playerId } = useContext(PlayerContext);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const loadRequests = useCallback(async () => {
    if (!playerId) return;
    try {
      const data = await getFriendRequests();
      setRequests(Array.isArray(data) ? data : []);
      setPendingCount(Array.isArray(data) ? data.length : 0);
    } catch {}
  }, [playerId]);

  const loadFriends = useCallback(async () => {
    if (!playerId) return;
    setLoading(true);
    try {
      const data = await getMyFriends();
      setFriends(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, [playerId]);

  const loadSent = useCallback(async () => {
    if (!playerId) return;
    try {
      const data = await getSentRequests();
      setSent(Array.isArray(data) ? data : []);
    } catch {}
  }, [playerId]);

  useEffect(() => {
    if (!playerId) return;
    loadRequests();
    pollRef.current = setInterval(loadRequests, 15000);
    return () => clearInterval(pollRef.current);
  }, [playerId, loadRequests]);

  const sendRequest = useCallback(async (addresseeId) => {
    const result = await sendFriendRequest(addresseeId);
    await loadRequests();
    return result;
  }, [loadRequests]);

  const acceptRequest = useCallback(async (friendshipId) => {
    const result = await acceptFriendRequest(friendshipId);
    await Promise.all([loadRequests(), loadFriends()]);
    return result;
  }, [loadRequests, loadFriends]);

  const rejectRequest = useCallback(async (friendshipId) => {
    const result = await rejectFriendRequest(friendshipId);
    setRequests((prev) => prev.filter((r) => r.friendship_id !== friendshipId));
    setPendingCount((n) => Math.max(0, n - 1));
    return result;
  }, []);

  const removeFriend = useCallback(async (friendshipId) => {
    const result = await deleteFriendship(friendshipId);
    setFriends((prev) => prev.filter((f) => f.friendship_id !== friendshipId));
    setSent((prev) => prev.filter((s) => s.friendship_id !== friendshipId));
    return result;
  }, []);

  const challenge = useCallback((targetId, game, stake) => {
    return challengeFriend(targetId, game, stake);
  }, []);

  return (
    <SocialContext.Provider value={{
      friends,
      requests,
      sent,
      pendingCount,
      loading,
      loadFriends,
      loadRequests,
      loadSent,
      sendRequest,
      acceptRequest,
      rejectRequest,
      removeFriend,
      searchPlayers,
      challenge,
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used inside SocialProvider");
  return ctx;
}
