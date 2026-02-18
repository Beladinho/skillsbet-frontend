const BASE_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {

  async getSkills() {
    const res = await fetch(`${BASE_URL}/skills/`);
    if (!res.ok) throw new Error("skills fetch failed");
    return res.json();
  },

  async addSkill(name: string, level: number, category: string) {
    const res = await fetch(`${BASE_URL}/skills/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level, category }),
    });

    if (!res.ok) throw new Error("add skill failed");
    return res.json();
  },

  async login(username: string, password: string) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    return res.json();
  },

};

