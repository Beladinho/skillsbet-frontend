const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem("token")
    window.location.reload()
    return
  }

  return response.json()
}

