import { apiRequest } from "./http";

export function getMyFriends() {
  return apiRequest("/friends");
}

export function getFriendRequests() {
  return apiRequest("/friends/requests");
}

export function getSentRequests() {
  return apiRequest("/friends/sent");
}

export function searchPlayers(q) {
  return apiRequest(`/friends/search?q=${encodeURIComponent(q)}`);
}

export function sendFriendRequest(addresseeId) {
  return apiRequest("/friends/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { addressee_id: addresseeId },
  });
}

export function acceptFriendRequest(friendshipId) {
  return apiRequest(`/friends/accept/${friendshipId}`, { method: "POST" });
}

export function rejectFriendRequest(friendshipId) {
  return apiRequest(`/friends/reject/${friendshipId}`, { method: "POST" });
}

export function deleteFriendship(friendshipId) {
  return apiRequest(`/friends/${friendshipId}`, { method: "DELETE" });
}

export function challengeFriend(targetId, game, stake = 0) {
  return apiRequest("/friends/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { target_id: targetId, game, stake },
  });
}
