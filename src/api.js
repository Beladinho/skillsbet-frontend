const API_URL = import.meta.env.VITE_API_URL;

async function request(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erreur serveur");
  }

  return res.json();
}

export const login = (username, password) =>
  request("/login", "POST", { username, password });

export const register = (username, password) =>
  request("/register", "POST", { username, password });

export const getStats = (token) =>
  request("/stats", "GET", null, token);

export const addSkill = (skill, token) =>
  request("/skills", "POST", skill, token);

export const getBadges = (token) =>
  request("/badges", "GET", null, token);

