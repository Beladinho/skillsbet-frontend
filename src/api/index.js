export {
  apiRequest as apiFetch,
  apiRequest,
  API_URL,
} from "./http";

export {
  loginUser as login,
  registerUser as register,
} from "./authApi";

export {
  getMyBadges as getBadges,
  getBattlePass,
  getMyNotifications as getNotifications,
  markNotificationRead as readNotification,
} from "./skillsbetApi";

export const api = {
  get: (path) => import("./http").then(({ apiRequest }) => apiRequest(path)),
  post: (path, body) =>
    import("./http").then(({ apiRequest }) =>
      apiRequest(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
    ),
};

export async function claimDaily() {
  const { apiRequest } = await import("./http");
  return apiRequest("/daily/claim", { method: "POST" });
}

export default api;
