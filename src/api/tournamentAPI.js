import { apiRequest } from "./http";

export async function getTournaments() {
  return apiRequest("/tournaments", { useAuth: false });
}

export async function joinTournament(tournamentId, playerId) {
  return apiRequest("/tournaments/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { tournament_id: tournamentId, player_id: playerId },
  });
}
