import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import { PlayerProvider } from "./context/PlayerContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { SoundProvider } from "./context/SoundContext";
import { MusicProvider } from "./context/MusicContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CreatorProvider } from "./context/CreatorContext";
import { SocialProvider } from "./context/SocialContext";
import { AdvancedNotificationsProvider } from "./context/AdvancedNotificationsContext";
import "./index.css";
import "./styles/theme.css";
import "./styles/global.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p style={{ padding: "2rem", color: "#fff" }}>Une erreur inattendue est survenue. Veuillez recharger la page.</p>}>
      <PlayerProvider>
        <AppSettingsProvider>
          <SoundProvider>
            <MusicProvider>
              <NotificationProvider>
                <CreatorProvider>
                  <SocialProvider>
                    <AdvancedNotificationsProvider>
                      <App />
                    </AdvancedNotificationsProvider>
                  </SocialProvider>
                </CreatorProvider>
              </NotificationProvider>
            </MusicProvider>
          </SoundProvider>
        </AppSettingsProvider>
      </PlayerProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);