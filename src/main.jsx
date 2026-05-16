import React from "react";
import ReactDOM from "react-dom/client";
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
  </React.StrictMode>
);