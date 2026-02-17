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

  async getPlayer(userId) {
    const res = await fetch(`${BASE_URL}/player/${userId}`);
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
      category
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

  async getSkills() {
    const res = await fetch(`${BASE_URL}/skills`);
    return res.json();
  },
};




