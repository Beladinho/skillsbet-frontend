let socket = null;
let currentSession = null;

export function connectMatchmaking({
  playerId,
  game,
  stake,
  elo,
  country,
  regionFilter,
  onMessage,
  onOpen,
  onClose,
}) {
  currentSession = { playerId, game, stake, elo };

  socket = new WebSocket(import.meta.env.VITE_API_URL.replace(/^http/, "ws") + "/ws/matchmaking");

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: "join",
        player_id: playerId,
        game,
        stake,
        elo,
        country: country || null,
        region_filter: regionFilter || "world",
      })
    );

    onOpen?.();
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage?.(data);
  };

  socket.onclose = () => {
    onClose?.();
    socket = null;
    currentSession = null;
  };

  socket.onerror = (error) => {
    console.error("Matchmaking socket error:", error);
  };
}

export function leaveMatchmaking() {
  if (!socket || !currentSession) return;

  try {
    socket.send(
      JSON.stringify({
        type: "leave",
        player_id: currentSession.playerId,
        game: currentSession.game,
        stake: currentSession.stake,
      })
    );
  } catch (error) {
    console.error("leaveMatchmaking error:", error);
  }

  socket.close();
  socket = null;
  currentSession = null;
}