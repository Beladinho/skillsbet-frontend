const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async register(username, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Register failed");
    return data;
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("LOGIN ERROR:", data);
      throw new Error(data.detail || "Login failed");
    }

    console.log("TOKEN REÇU :", data.token);

    // ⚠️ ON STOCKE UNIQUEMENT LE TOKEN STRING
    localStorage.setItem("token", data.token);

    return data;
  },

  async addSkill(name, level, category) {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        level: Number(level),
        category: category,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("ADD SKILL ERROR:", data);
      throw new Error(JSON.stringify(data));
    }

    return data;
  },

  async getSkills() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/skills`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },
};


