const API_URL = "https://skillsbet-production-37ae.up.railway.app"

export const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
    return res.json()
  },

  register: async (username, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
    return res.json()
  },

  getProfile: async (token) => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
  },

  getChallenges: async () => {
    const res = await fetch(`${API_URL}/challenges`)
    return res.json()
  },

  completeChallenge: async (id, token) => {
    const res = await fetch(`${API_URL}/challenges/${id}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
  },

  getLeaderboard: async () => {
    const res = await fetch(`${API_URL}/leaderboard`)
    return res.json()
  }
}



