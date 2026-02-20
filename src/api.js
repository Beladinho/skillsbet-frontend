const BASE_URL = "https://skillsbet-production-37ae.up.railway.app";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}

const api = {

  // REGISTER
  async register(username, password) {
    const res = await fetch(BASE_URL + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("register failed");
    return res.json();
  },

  // LOGIN
  async login(username, password) {
    const res = await fetch(BASE_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("login failed");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data;
  },

  // GET SKILLS
  async getSkills() {
    const res = await fetch(BASE_URL + "/skills/", {
      method: "GET",
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("get skills failed");
    return res.json();
  },

  // ADD SKILL
  async addSkill(skill) {
    const res = await fetch(BASE_URL + "/skills/", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(skill)
    });

    if (!res.ok) throw new Error("add skill failed");
    return res.json();
  },

  // STATS
  async getStats() {
    const res = await fetch(BASE_URL + "/stats", {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("stats failed");
    return res.json();
  },

  // BADGES
  async getBadges() {
    const res = await fetch(BASE_URL + "/badges", {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("badges failed");
    return res.json();
  }

};

export default api;// cache bust
