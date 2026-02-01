const API_URL = import.meta.env.VITE_API_URL;

export const register = async (username, password) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Register failed");
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

export const addSkill = async (skill, token) => {
  const res = await fetch(`${API_URL}/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(skill),
  });

  if (!res.ok) throw new Error("Add skill failed");
  return res.json();
};

export const getStats = async (token) => {
  const res = await fetch(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Stats failed");
  return res.json();
};

export const getBadges = async (token) => {
  const res = await fetch(`${API_URL}/badges`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Badges failed");
  return res.json();
};

