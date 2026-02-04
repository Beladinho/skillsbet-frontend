const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async register(username, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error);
    return data;
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log("TOKEN REÇU :", data);

    if (!res.ok || !data.token) {
      throw new Error(data.error || "Identifiants invalides");
    }

    localStorage.setItem("token", data.token);
    return data;
  },

  async getProfile() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Non autorisé");
    return res.json();
  },

  async addSkill(name, level, category) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Utilisateur non connecté");

    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        level: Number(level),
        category: category.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  },
};


