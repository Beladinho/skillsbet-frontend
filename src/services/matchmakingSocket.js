let socket = null;
let currentSession = null;

export function connectMatchmaking({
  playerId,
  game,
  stake,
  elo,
  onMessage,
  onOpen,
  onClose,
}) {
  currentSession = { playerId, game, stake, elo };

  socket = new WebSocket("ws://127.0.0.1:8001/ws/matchmaking");

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: "join",
        player_id: playerId,
        game,
        stake,
        elo,
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