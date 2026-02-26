const BASE_URL = import.meta.env.VITE_API_URL

function getToken() {
  const stored = localStorage.getItem("token")
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    return parsed.access_token
  } catch (e) {
    console.error("Token parse error:", e)
    return null
  }
}

async function safeFetch(url, options = {}) {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text)
  }

  return response.json()
}

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error("Login failed")
  }

  const data = await response.json()

  localStorage.setItem("token", JSON.stringify(data))

  return data
}

export function fetchSkills() {
  return safeFetch(`${BASE_URL}/skills`)
}

export function addSkill(skill) {
  return safeFetch(`${BASE_URL}/skills`, {
    method: "POST",
    body: JSON.stringify(skill),
  })
}
