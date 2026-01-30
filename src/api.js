const API = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token")

  const res = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {})
    }
  })

  // ⚠️ IMPORTANT : NE PAS logout automatiquement ici
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Erreur API")
  }

  return res.json()
}

