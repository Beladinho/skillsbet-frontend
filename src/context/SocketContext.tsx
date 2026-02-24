import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

/* =======================
   TYPES
======================= */
type SocketContextType = {
  socket: Socket | null;
  wallet: number;
  score: number;
};

/* =======================
   CONTEXT PAR DÉFAUT
======================= */
const SocketContext = createContext<SocketContextType>({
  socket: null,
  wallet: 0,
  score: 0,
});

/* =======================
   PROVIDER
======================= */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [wallet, setWallet] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    // 🔹 URL BACKEND
    // Local : http://localhost:5050
    // Production : Railway
    const BACKEND_URL =
      import.meta.env.MODE === "production"
        ? "https://web-production-d4ff4.up.railway.app"
        : "http://localhost:5050";

    const s = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    setSocket(s);

    // 🔹 ÉCOUTE DES ÉVÉNEMENTS BACKEND
    s.on("walletUpdate", (amount: number) => {
      setWallet(amount);
    });

    s.on("scoreUpdate", (value: number) => {
      setScore(value);
    });

    // 🔹 REJOINT UNE ROOM (exemple)
    s.emit("joinRoom", {
      roomId: "room1",
      userId: "player1",
    });

    // 🔹 CLEANUP
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, wallet, score }}>
      {children}
    </SocketContext.Provider>
  );
};

/* =======================
   HOOK
======================= */
export const useSocket = () => useContext(SocketContext);
