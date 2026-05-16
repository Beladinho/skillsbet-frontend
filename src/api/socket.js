function normalizeBaseHttpUrl() {
  return import.meta.env.VITE_API_URL;
}

function buildWsUrl(path) {
  const httpBase = normalizeBaseHttpUrl();

  if (httpBase.startsWith("https://")) {
    return httpBase.replace("https://", "wss://") + path;
  }

  if (httpBase.startsWith("http://")) {
    return httpBase.replace("http://", "ws://") + path;
  }

  return `${import.meta.env.VITE_API_URL.replace(/^http/, "ws")}${path}`;
}

let duelSocket = null;
let globalSocket = null;
let spectatorSocket = null;

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

export function connectToSpectatorSocket(duelId, playerId, onMessage, onOpen, onClose) {
  if (!duelId || !playerId) return null;

  if (spectatorSocket) {
    if (
      spectatorSocket.readyState === WebSocket.OPEN ||
      spectatorSocket.readyState === WebSocket.CONNECTING
    ) {
      spectatorSocket.close();
    }
    spectatorSocket = null;
  }

  const url = buildWsUrl(
    `/ws/duel/${duelId}?player_id=${encodeURIComponent(playerId)}&spectator=true`
  );
  spectatorSocket = new WebSocket(url);

  spectatorSocket.onopen = () => {
    if (onOpen) onOpen();
  };

  spectatorSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error("Invalid spectator WebSocket JSON:", error);
    }
  };

  spectatorSocket.onclose = () => {
    if (onClose) onClose();
  };

  spectatorSocket.onerror = (error) => {
    console.error("Spectator WebSocket error:", error);
  };

  return spectatorSocket;
}

export function sendSpectatorMessage(payload) {
  if (!spectatorSocket || spectatorSocket.readyState !== WebSocket.OPEN) return;
  spectatorSocket.send(JSON.stringify(payload));
}

export function disconnectSpectatorSocket() {
  if (!spectatorSocket) return;
  if (
    spectatorSocket.readyState === WebSocket.OPEN ||
    spectatorSocket.readyState === WebSocket.CONNECTING
  ) {
    spectatorSocket.close();
  }
  spectatorSocket = null;
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