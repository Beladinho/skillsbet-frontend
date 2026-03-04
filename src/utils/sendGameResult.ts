const API_URL = "https://web-production-d4ff4.up.railway.app";

export async function sendGameResult(data: any, token: string) {
  const res = await fetch(`${API_URL}/game/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to send game result");
  }

  return res.json();
}
