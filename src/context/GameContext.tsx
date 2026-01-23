import { createContext, useContext, useEffect, useState } from "react";

type GameContextType = {
  wallet: number;
  refreshWallet: () => void;
};

const GameContext = createContext<GameContextType>({
  wallet: 0,
  refreshWallet: () => {},
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState(0);

  function refreshWallet() {
    fetch("http://127.0.0.1:8000/wallet")
      .then((res) => res.json())
      .then((data) => setWallet(data.balance));
  }

  useEffect(() => {
    refreshWallet();
  }, []);

  return (
    <GameContext.Provider value={{ wallet, refreshWallet }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

