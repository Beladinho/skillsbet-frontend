const API_URL = "https://web-production-d4ff4.up.railway.app";

export async function apiFetch(endpoint) {

  const res = await fetch(API_URL + endpoint, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return await res.json();
}