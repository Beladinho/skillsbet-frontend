import { lazy, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { PlayerContext } from "./context/PlayerContext";
import { useAppSettings } from "./context/AppSettingsContext";
import { usePushNotifications } from "./hooks/usePushNotifications";
import NotificationCenter from "./components/NotificationCenter";
import CookieBanner from "./components/CookieBanner";
import FloatingMusicPlayer from "./components/FloatingMusicPlayer";
import SettingsSidebar from "./components/SettingsSidebar";
import SplashScreen from "./components/SplashScreen";
import ScrollToTop from "./components/ScrollToTop";
import OnboardingTour from "./components/OnboardingTour";
import RippleEffect from "./components/RippleEffect";
import CrispWidget from "./components/CrispWidget";
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
const FriendsPage       = lazy(() => import("./pages/Friends"));
const PublicProfile     = lazy(() => import("./pages/PublicProfile"));
const StatsPage         = lazy(() => import("./pages/Stats"));
const SpectatePage      = lazy(() => import("./pages/Spectate"));
const PremiumPage       = lazy(() => import("./pages/Premium"));
const CGU               = lazy(() => import("./pages/legal/CGU"));
const Privacy           = lazy(() => import("./pages/legal/Privacy"));
const ResponsibleGaming = lazy(() => import("./pages/legal/ResponsibleGaming"));
const ContactPage       = lazy(() => import("./pages/legal/Contact"));
const ReplayPage        = lazy(() => import("./pages/Replay"));
const ReferralPage      = lazy(() => import("./pages/Referral"));
const BattlePassPage    = lazy(() => import("./pages/BattlePass"));
const MaintenancePage   = lazy(() => import("./pages/Maintenance"));
const NotFoundPage      = lazy(() => import("./pages/NotFound"));

function JoinRedirect() {
  const [params] = useSearchParams();
  const ref = params.get("ref");
  return <Navigate to={ref ? `/register?ref=${ref}` : "/register"} replace />;
}

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
      <CrispWidget />
      <CookieBanner />
      <NotificationCenter />
      <RippleEffect />
      <OnboardingTour />
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
            path="/player/:email"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <PublicProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <FriendsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <StatsPage />
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
            path="/spectate/:duel_id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <SpectatePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <PremiumPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/legal/cgu"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <CGU />
              </Suspense>
            }
          />
          <Route
            path="/legal/privacy"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <Privacy />
              </Suspense>
            }
          />
          <Route
            path="/legal/responsible-gaming"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <ResponsibleGaming />
              </Suspense>
            }
          />
          <Route
            path="/legal/contact"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="/replay/:duel_id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <ReplayPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <ReferralPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/battlepass"
            element={
              <ProtectedRoute>
                <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                  <BattlePassPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <Suspense fallback={null}>
                <MaintenancePage />
              </Suspense>
            }
          />
          {/* /join?ref=CODE → redirect to /register preserving ref param */}
          <Route
            path="/join"
            element={<JoinRedirect />}
          />
          <Route
            path="*"
            element={
              <Suspense fallback={null}>
                <NotFoundPage />
              </Suspense>
            }
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
