const API = import.meta.env.VITE_API_URL;

export const api = {
  async joinQueue(userId) {
    const res = await fetch(`${API}/queue/join?user_id=${userId}`, {
      method: "POST"
    });
    return res.json();
  },

  async getElo(userId) {
    const res = await fetch(`${API}/elo/${userId}`);
    return res.json();
  }
};



