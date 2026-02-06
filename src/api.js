import axios from "axios";

export const api = axios.create({
  baseURL: "https://skillsbet-production-37ae.up.railway.app",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* AUTH */
export const login = async (email, password) => {
  const res = await api.post("/login", { email, password });
  return res.data;
};

export const register = async (email, password) => {
  const res = await api.post("/register", { email, password });
  return res.data;
};

/* USER */
export const getMe = async () => {
  const res = await api.get("/me");
  return res.data;
};

/* SKILLS */
export const addSkill = async (name) => {
  const res = await api.post("/skills", { name });
  return res.data;
};

/* XP */
export const addXP = async (amount) => {
  const res = await api.post("/xp", { amount });
  return res.data;
};

/* QUESTS */
export const getQuests = async () => {
  const res = await api.get("/quests");
  return res.data;
};

/* CHESTS */
export const openChest = async () => {
  const res = await api.post("/chests/open");
  return res.data;
};

/* SHOP */
export const getShop = async () => {
  const res = await api.get("/shop");
  return res.data;
};

/* LEADERBOARD */
export const getLeaderboard = async () => {
  const res = await api.get("/leaderboard");
  return res.data;
};

/* 🔔 NOTIFICATIONS */
export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const readNotification = async (id) => {
  await api.post(`/notifications/${id}/read`);
};



