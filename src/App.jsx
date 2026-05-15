import { lazy, Suspense, useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayerContext } from "./context/PlayerContext";
import { useAppSettings } from "./context/AppSettingsContext";
import NotificationCenter from "./components/NotificationCenter";
import FloatingMusicPlayer from "./components/FloatingMusicPlayer";
import SettingsSidebar from "./components/SettingsSidebar";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

const AdminHub          = lazy(() => import("./pages/AdminHub"));
const CreatorDashboard  = lazy(() => import("./pages/CreatorDashboard"));
const CreatorGamePage   = lazy(() => import("./pages/CreatorGamePage"));

export default function App() {
  const { playerId } = useContext(PlayerContext);
  const { settings } = useAppSettings();

  useEffect(() => {
    document.documentElement.lang = settings.language || "fr";
  }, [settings.language]);

  return (
    <BrowserRouter>
      <NotificationCenter />
      <FloatingMusicPlayer />
      <SettingsSidebar />
      <Routes>
        <Route
          path="/login"
          element={playerId ? <Navigate to="/" replace /> : <Login />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/forgot-password"
          element={playerId ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={playerId ? <Navigate to="/" replace /> : <ResetPassword />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <AdminHub />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator"
          element={
            <ProtectedRoute>
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <CreatorDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/game/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <CreatorGamePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={playerId ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
