type GameResultPayload = {
  game: string;
  bet: number;
  win: boolean;
  score?: number;
};

export async function sendGameResult(payload: GameResultPayload) {
  const res = await fetch("http://127.0.0.1:8000/game/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}
