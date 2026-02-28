const API = import.meta.env.VITE_API_URL;

// =========================
// AUTH
// =========================
export const api = {
  async login(email, password) {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(email, password) {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }
};

// =========================
// SKILLS
// =========================
export async function fetchSkills() {
  const res = await fetch(`${API}/skills`);
  return res.json();
}

export async function addSkill(skill) {
  const res = await fetch(`${API}/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(skill),
  });
  return res.json();
}