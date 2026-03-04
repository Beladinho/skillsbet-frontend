const API_URL = "https://web-production-d4ff4.up.railway.app";

export const api = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Login failed");
    }

    return res.json();
  },

  async register(email, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Register failed");
    }

    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_URL}/me?token=${token}`);

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    return res.json();
  }
};