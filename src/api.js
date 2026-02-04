const API_URL = "https://skillsbet-production-37ae.up.railway.app";

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  console.log("TOKEN REÇU :", data);

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function register(username, password) {
  return fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function addSkill(name, level, category) {
  const token = localStorage.getItem("token");

  return fetch(`${API_URL}/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, level, category }),
  });
}

export async function getSkills() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/skills`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return res.json();
}


