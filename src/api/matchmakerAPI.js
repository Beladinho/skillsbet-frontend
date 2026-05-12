import { apiRequest } from "./http";

export async function joinQueue(playerId, game, bet) {
  return apiRequest("/join-queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { player_id: playerId, game, stake: bet },
  });
}

export async function checkMatch(playerId) {
  return apiRequest(
    `/matchmaking/status?player_id=${encodeURIComponent(playerId)}`,
    { useAuth: false }
  );
}
