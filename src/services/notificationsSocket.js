let socket = null;

export function connectNotifications(playerId, onMessage) {
  if (!playerId) return;

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }

  socket = new WebSocket(
    `${import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8001"}/ws/notifications/${encodeURIComponent(playerId)}`
  );

  socket.onopen = () => {
    console.log("Notification socket connected for player:", playerId);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (error) {
      console.error("Notification socket invalid JSON:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("Notification socket error:", error);
  };

  socket.onclose = () => {
    console.log("Notification socket closed for player:", playerId);
    socket = null;
  };
}

export function disconnectNotifications() {
  if (!socket) return;

  if (
    socket.readyState === WebSocket.OPEN ||
    socket.readyState === WebSocket.CONNECTING
  ) {
    socket.close();
  }

  socket = null;
}