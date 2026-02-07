const API = import.meta.env.VITE_API_URL;

export const api = {
  async init(userId) {
    const res = await fetch(`${API}/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    return res.json();
  },

  async getPlayer(userId) {
    const res = await fetch(`${API}/player/${userId}`);
    return res.json();
  },

  async fight(userId) {
    const res = await fetch(`${API}/fight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    return res.json();
  },

  async getShop() {
    const res = await fetch(`${API}/shop`);
    return res.json();
  },

  async buy(userId, itemId) {
    const res = await fetch(`${API}/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId
      })
    });
    return res.json();
  },

  async openChest(userId) {
    const res = await fetch(`${API}/chest/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    return res.json();
  }
};



