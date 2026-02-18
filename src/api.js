const BASE_URL = "https://skillsbet-production-37ae.up.railway.app";

export const api = {

  async getSkills() {
    const r = await fetch(BASE_URL + "/skills/");
    return r.json();
  },

  async addSkill(data) {
    const r = await fetch(BASE_URL + "/skills/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  async login(email, password) {
    const r = await fetch(BASE_URL + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    return r.json();
  },

  async register(email, password) {
    const r = await fetch(BASE_URL + "/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    return r.json();
  }

};

