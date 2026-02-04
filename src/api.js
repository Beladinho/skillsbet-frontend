const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    localStorage.setItem("token", data.token); // string
    return data;
  },

  async addSkill(name, level, category) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      // 🚨 ICI ÉTAIT TON BUG
      body: JSON.stringify({
        name: name,
        level: Number(level), // force number
        category: category,
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  },
};


