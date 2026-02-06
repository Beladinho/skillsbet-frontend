let socket;

export const connectWS = (onMessage) => {
  socket = new WebSocket("wss://skillsbet-production-37ae.up.railway.app/ws");

  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };
};
