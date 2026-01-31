const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) throw new Error("Identifiants invalides");

  return res.json(); // retourne directement le token (string)
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) throw new Error("Erreur création compte");

  return res.json(); // retourne directement le token
}

export async function getStats(token) {
  const res = await fetch(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Token invalide");

  return res.json();
}

export async function addSkill(skill, token) {
  const res = await fetch(`${API_URL}/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(skill)
  });

  if (!res.ok) throw new Error("Erreur ajout compétence");

  return res.json();
}

export async function getBadges(token) {
  const res = await fetch(`${API_URL}/badges`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Erreur badges");

  return res.json();
}

