import axios from "axios";

const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================
// AUTH
// =====================
export const login = async (email, password) => {
  const res = await api.post("/login", { email, password });
  return res.data;
};

export const register = async (email, password) => {
  const res = await api.post("/register", { email, password });
  return res.data;
};

// =====================
// BATTLE PASS
// =====================
export const getBattlePass = async () => {
  const res = await api.get("/battle-pass");
  return res.data;
};



