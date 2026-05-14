const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function moderateWithAI(message) {
  if (!API_KEY) return { blocked: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 5,
        messages: [
          {
            role: "user",
            content: `You are a game chat moderator. Is this message toxic, harassing, threatening, or severely inappropriate for an online gaming context? Reply only "YES" or "NO".\n\nMessage: "${message.replace(/"/g, "'")}"`,
          },
        ],
      }),
    });

    if (!res.ok) return { blocked: false };

    const data = await res.json();
    const answer = data.content?.[0]?.text?.trim().toUpperCase() ?? "";
    return { blocked: answer.startsWith("YES") };
  } catch {
    return { blocked: false };
  } finally {
    clearTimeout(timeout);
  }
}
