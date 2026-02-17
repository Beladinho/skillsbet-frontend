const BASE_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  async register(username, password) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async addSkill(token, name, level, category) {
    const res = await fetch(`${BASE_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        level,
        category,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t);
    }

    return res.json();
  },

  async getSkills() {
    const res = await fetch(`${BASE_URL}/skills`);
    return res.json();
  },
};


