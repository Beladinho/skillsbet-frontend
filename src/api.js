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

    localStorage.setItem("token", data.token);
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

    if (!res.ok) throw new Error(data.detail || "Login failed");

    localStorage.setItem("token", data.token);
    return data;
  },

  async addSkill(name, level, category) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not logged in");

    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, level: Number(level), category }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));

    return data;
  },

  async getSkills() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/skills`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.json();
  },
};


