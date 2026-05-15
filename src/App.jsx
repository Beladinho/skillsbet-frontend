import { lazy, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PlayerContext } from "./context/PlayerContext";
import { useAppSettings } from "./context/AppSettingsContext";
import { usePushNotifications } from "./hooks/usePushNotifications";
import NotificationCenter from "./components/NotificationCenter";
import FloatingMusicPlayer from "./components/FloatingMusicPlayer";
import SettingsSidebar from "./components/SettingsSidebar";
import SplashScreen from "./components/SplashScreen";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import LandingPage from "./pages/LandingPage";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

const AdminHub          = lazy(() => import("./pages/AdminHub"));
const CreatorDashboard  = lazy(() => import("./pages/CreatorDashboard"));
const CreatorGamePage   = lazy(() => import("./pages/CreatorGamePage"));

/* Inner component so useLocation works inside BrowserRouter */
function AppRoutes() {
  const location = useLocation();
  const { playerId } = useContext(PlayerContext);
  const { settings } = useAppSettings();
  const { requestPushPermission, subscribeToPush } = usePushNotifications();

  useEffect(() => {
    document.documentElement.lang = settings.language || "fr";
  }, [settings.language]);

  /* Request push permission once after login */
  useEffect(() => {
    if (!playerId) return;
    requestPushPermission().then(() => subscribeToPush(playerId));
  }, [playerId, requestPushPermission, subscribeToPush]);

  return (
    <>
      <NotificationCenter />
      <FloatingMusicPlayer />
      <SettingsSidebar />
      <ScrollToTop />
      <div key={location.pathname} className="page-transition">
        <Routes location={location}>
          <Route
            path="/"
            element={playerId ? <Navigate to="/lobby" replace /> : <LandingPage />}
          />
          <Route
            path="/login"
            element={playerId ? <Navigate to="/lobby" replace /> : <Login />}
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/forgot-password"
            element={playerId ? <Navigate to="/lobby" replace /> : <ForgotPassword />}
          />
          <Route
            path="/reset-password"
            element={playerId ? <Navigate to="/lobby" replace /> : <ResetPassword />}
          />
          <Route
            path="/lobby"
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
            element={<Navigate to={playerId ? "/lobby" : "/"} replace />}
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  if (!splashDone) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
