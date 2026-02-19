const BASE_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {

  async register(username, password) {
    const res = await fetch(BASE_URL + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("register failed");
    return res.json();
  },

  async login(username, password) {
    const res = await fetch(BASE_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("login failed");

    const data = await res.json();

    // ✅ ton backend renvoie "token"
    localStorage.setItem("token", data.token);

    return data;
  },

  async getSkills() {
    const res = await fetch(BASE_URL + "/skills", {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });

    if (!res.ok) throw new Error("getSkills failed");
    return res.json();
  },

  async addSkill(name, level, category) {
    const res = await fetch(BASE_URL + "/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token")
      },
      body: JSON.stringify({ name, level, category })
    });

    if (!res.ok) throw new Error("addSkill failed");
    return res.json();
  }
};
