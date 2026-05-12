import { apiRequest } from "./http";

export async function getDuelResult(duelId) {
  return apiRequest(`/duel/result?duel_id=${encodeURIComponent(duelId)}`, {
    useAuth: false,
  });
}
