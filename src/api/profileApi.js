import { apiRequest } from "./http";

export async function getProfile() {
  return apiRequest("/profile");
}

export async function updateProfile(payload) {
  return apiRequest("/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      display_name: payload?.display_name ?? null,
      bio: payload?.bio ?? null,
      country: payload?.country ?? null,
      avatar_url: payload?.avatar_url ?? null,
    },
  });
}