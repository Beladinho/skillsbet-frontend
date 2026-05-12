import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { playerId, role } = useContext(PlayerContext);

  if (!playerId) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/" replace />;

  return children;
}
