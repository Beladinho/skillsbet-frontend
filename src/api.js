const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async register(username, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    // 🔥 ON STOCKE JUSTE LA STRING
    localStorage.setItem("token", data.token);

    return data;
  },

  async addSkill(skill) {
    const token = localStorage.getItem("token"); // ✅ STRING

    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ BON TOKEN
      },
      body: JSON.stringify(skill),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  },
};


