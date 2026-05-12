function normalizeBaseHttpUrl() {
  return import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";
}

function buildWsUrl(path) {
  const httpBase = normalizeBaseHttpUrl();

  if (httpBase.startsWith("https://")) {
    return httpBase.replace("https://", "wss://") + path;
  }

  if (httpBase.startsWith("http://")) {
    return httpBase.replace("http://", "ws://") + path;
  }

  return `${import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8001"}${path}`;
}

let duelSocket = null;
let globalSocket = null;

export function connectToDuelSocket(duelId, onMessage, onOpen, onClose) {
  if (!duelId) return null;

  if (duelSocket) {
    if (
      duelSocket.readyState === WebSocket.OPEN ||
      duelSocket.readyState === WebSocket.CONNECTING
    ) {
      duelSocket.close();
    }
    duelSocket = null;
  }

  duelSocket = new WebSocket(buildWsUrl(`/ws/duel/${duelId}`));

  duelSocket.onopen = () => {
    console.log("WebSocket duel connected:", duelId);

    if (onOpen) {
      onOpen();
    }

    duelSocket.send(
      JSON.stringify({
        type: "join",
        duel_id: duelId,
        message: "Frontend connected to duel room",
      })
    );
  };

  duelSocket.onmessage = (event) => {
    try {
      const raw = event.data;

      if (raw === "connected") {
        return;
      }

      const data = JSON.parse(raw);
      console.log("Duel WebSocket message:", data);

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error("Invalid duel WebSocket JSON:", error);
    }
  };

  duelSocket.onclose = () => {
    console.log("WebSocket duel closed:", duelId);

    if (onClose) {
      onClose();
    }
  };

  duelSocket.onerror = (error) => {
    console.error("Duel WebSocket error:", error);
  };

  return duelSocket;
}

export function disconnectDuelSocket() {
  if (!duelSocket) return;

  if (
    duelSocket.readyState === WebSocket.OPEN ||
    duelSocket.readyState === WebSocket.CONNECTING
  ) {
    duelSocket.close();
  }

  duelSocket = null;
}

export function connectGlobalSocket(playerId, onMessage, onOpen, onClose) {
  if (!playerId) return null;

  if (globalSocket) {
    if (
      globalSocket.readyState === WebSocket.OPEN ||
      globalSocket.readyState === WebSocket.CONNECTING
    ) {
      globalSocket.close();
    }
    globalSocket = null;
  }

  globalSocket = new WebSocket(
    buildWsUrl(`/ws?player_id=${encodeURIComponent(playerId)}`)
  );

  globalSocket.onopen = () => {
    console.log("Global WebSocket connected for player:", playerId);

    if (onOpen) {
      onOpen();
    }

    globalSocket.send("connected");
  };

  globalSocket.onmessage = (event) => {
    try {
      const raw = event.data;

      if (raw === "connected") {
        return;
      }

      const data = JSON.parse(raw);
      console.log("Global WebSocket message:", data);

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error("Invalid global WebSocket JSON:", error);
    }
  };

  globalSocket.onclose = () => {
    console.log("Global WebSocket closed for player:", playerId);

    if (onClose) {
      onClose();
    }
  };

  globalSocket.onerror = (error) => {
    console.error("Global WebSocket error:", error);
  };

  return globalSocket;
}

export function disconnectGlobalSocket() {
  if (!globalSocket) return;

  if (
    globalSocket.readyState === WebSocket.OPEN ||
    globalSocket.readyState === WebSocket.CONNECTING
  ) {
    globalSocket.close();
  }

  globalSocket = null;
}

export function sendDuelSocketMessage(payload) {
  if (!duelSocket || duelSocket.readyState !== WebSocket.OPEN) {
    return;
  }

  duelSocket.send(JSON.stringify(payload));
}

export function connectSocket(duelId, playerId, callback) {
  return connectToDuelSocket(
    duelId,
    (data) => {
      if (callback) {
        callback(data);
      }
    },
    () => {
      console.log(`Socket ouverte pour ${playerId} sur duel ${duelId}`);
    },
    () => {
      console.log(`Socket fermée pour ${playerId} sur duel ${duelId}`);
    }
  );
}

export function disconnectSocket() {
  disconnectDuelSocket();
}