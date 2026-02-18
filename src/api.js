const BASE_URL = "https://skillsbet-production-37ae.up.railway.app"

export const api = {

  // ======================
  // REGISTER
  // ======================
  async register(email, password) {
    const res = await fetch(BASE_URL + "/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error("register failed");
    return res.json();
  },

  // ======================
  // LOGIN
  // ======================
  async login(email, password) {
    const res = await fetch(BASE_URL + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error("login failed");

    const data = await res.json();

    // 🔐 stock token
    localStorage.setItem("token", data.access_token);

    return data;
  },

  // ======================
  // GET SKILLS (AUTH)
  // ======================
  async getSkills() {
    const res = await fetch(BASE_URL + "/skills/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    if (!res.ok) throw new Error("getSkills failed");
    return res.json();
  },

  // ======================
  // ADD SKILL (AUTH)
  // ======================
  async addSkill(name, level, category) {
    const res = await fetch(BASE_URL + "/skills/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({
        name,
        level,
        category
      })
    });

    if (!res.ok) throw new Error("addSkill failed");
    return res.json();
  }

};

