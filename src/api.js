const BASE_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json"
  };

  if (token && token !== "undefined" && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }

  return res.json();
}

const api = {

  // REGISTER
  register(username, password) {
    return safeFetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  },

  // LOGIN
  async login(username, password) {
    const data = await safeFetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  // LOGOUT
  logout() {
    localStorage.removeItem("token");
  },

  // SKILLS
  getSkills() {
    return safeFetch(`${BASE_URL}/skills/`, {
      headers: authHeaders()
    });
  },

  addSkill(skill) {
    return safeFetch(`${BASE_URL}/skills/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(skill)
    });
  },

  // STATS
  getStats() {
    return safeFetch(`${BASE_URL}/stats/`, {
      headers: authHeaders()
    });
  },

  // BADGES
  getBadges() {
    return safeFetch(`${BASE_URL}/badges/`, {
      headers: authHeaders()
    });
  }
};

export default api;