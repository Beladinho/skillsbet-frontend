const API_URL = "https://skillsbet-production-37ae.up.railway.app"

export const getToken = () => localStorage.getItem("token")

export const api = async (endpoint, method = "GET", body = null) => {
  const headers = {
    "Content-Type": "application/json",
  }

  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  if (res.status === 401) {
    localStorage.removeItem("token")
    window.location.reload()
  }

  return res.json()
}

