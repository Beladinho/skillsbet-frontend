const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async register(username, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ✅ STRINGIFY
    });
    return res.json();
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ✅ STRINGIFY
    });
    return res.json();
  },

  async addSkill(token, skill) {
    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ TOKEN DANS HEADER
      },
      body: JSON.stringify(skill), // ✅ LE FIX PRINCIPAL ICI
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  },
};


