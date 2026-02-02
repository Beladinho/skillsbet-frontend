const API_URL = import.meta.env.VITE_API_URL

export async function api(endpoint, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
  }

  // 🔥 ICI EST LA CORRECTION IMPORTANTE
  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(JSON.stringify(data))
  }

  return data
}

