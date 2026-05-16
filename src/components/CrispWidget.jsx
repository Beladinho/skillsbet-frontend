import { useContext, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useCrisp } from "../hooks/useCrisp";

/**
 * Mounts inside PlayerProvider — syncs Crisp with auth state.
 * Renders nothing; purely side-effectful.
 */
export default function CrispWidget() {
  const { playerId } = useContext(PlayerContext);
  const { resetCrisp } = useCrisp();

  /* Reset Crisp session when player logs out */
  useEffect(() => {
    if (!playerId) {
      resetCrisp();
    }
  }, [playerId, resetCrisp]);

  return null;
}
