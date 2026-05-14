import { createContext, useCallback, useContext, useState } from "react";
import {
  approveGame,
  getAllGamesAdmin,
  getApprovedGames,
  getCreatorGames,
  rejectGame,
  submitCreatorGame,
} from "../api/creatorApi";

const CreatorContext = createContext(null);

export function CreatorProvider({ children }) {
  const [myGames, setMyGames] = useState([]);
  const [approvedGames, setApprovedGames] = useState([]);
  const [adminGames, setAdminGames] = useState([]);

  const loadMyGames = useCallback((playerId) => {
    setMyGames(getCreatorGames(playerId));
  }, []);

  const loadApprovedGames = useCallback(() => {
    setApprovedGames(getApprovedGames());
  }, []);

  const loadAdminGames = useCallback(() => {
    setAdminGames(getAllGamesAdmin());
  }, []);

  const submitGame = useCallback((data) => {
    const game = submitCreatorGame(data);
    setMyGames((prev) => [...prev, game]);
    return game;
  }, []);

  const handleApprove = useCallback((id) => {
    approveGame(id);
    setAdminGames(getAllGamesAdmin());
  }, []);

  const handleReject = useCallback((id, reason) => {
    rejectGame(id, reason);
    setAdminGames(getAllGamesAdmin());
  }, []);

  return (
    <CreatorContext.Provider
      value={{
        myGames,
        approvedGames,
        adminGames,
        loadMyGames,
        loadApprovedGames,
        loadAdminGames,
        submitGame,
        handleApprove,
        handleReject,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator() {
  return useContext(CreatorContext);
}
