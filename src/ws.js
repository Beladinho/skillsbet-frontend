let socket;

export const connectWS = (onMessage) => {
  socket = new WebSocket("wss://web-production-d4ff4.up.railway.app/ws");

  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };
};
