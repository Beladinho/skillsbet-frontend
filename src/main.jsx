import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PlayerProvider } from "./context/PlayerContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { SoundProvider } from "./context/SoundContext";
import { MusicProvider } from "./context/MusicContext";
import { NotificationProvider } from "./context/NotificationContext";
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
              <App />
            </NotificationProvider>
          </MusicProvider>
        </SoundProvider>
      </AppSettingsProvider>
    </PlayerProvider>
  </React.StrictMode>
);