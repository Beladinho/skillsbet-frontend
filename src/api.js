const BASE_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(email, password) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getSkills() {
    const res = await fetch(`${BASE_URL}/skills/`);
    return res.json();
  },

  async addSkill(token, skill) {
    const res = await fetch(`${BASE_URL}/skills/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(skill),
    });
    return res.json();
  },
};


