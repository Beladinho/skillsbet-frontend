import { useCallback, useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useMusic } from "../context/MusicContext";

export default function FloatingMusicPlayer() {
  const { playerId } = useContext(PlayerContext);
  const {
    isPlaying,
    musicEnabled,
    currentStyle,
    currentVolume,
    tracks,
    startLobbyMusic,
    stopLobbyMusic,
    nextTrack,
    prevTrack,
    setMusicVolume,
  } = useMusic();

  const [collapsed, setCollapsed] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  // Only render when the user is logged in
  if (!playerId) return null;

  const track = tracks.find((t) => t.id === currentStyle) ?? tracks[0];
  const volPct = Math.round(currentVolume * 100);

  function handlePlayPause() {
    if (isPlaying) stopLobbyMusic();
    else startLobbyMusic();
  }

  function handleVolume(e) {
    setMusicVolume(Number(e.target.value) / 100);
    e.target.style.setProperty("--vol-pct", `${e.target.value}%`);
  }

  return (
    <div className={`fmp${collapsed ? " fmp--collapsed" : ""}${!musicEnabled ? " fmp--disabled" : ""}`}>
      {/* Collapse toggle */}
      <button
        type="button"
        className="fmp__toggle"
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Ouvrir le lecteur" : "Réduire"}
      >
        {collapsed ? "♪" : "−"}
      </button>

      {!collapsed && (
        <>
          {/* Track info */}
          <div className="fmp__track">
            <span className="fmp__icon">{track.icon}</span>
            <div className="fmp__info">
              <span className="fmp__name">{track.label}</span>
              {isPlaying && musicEnabled && (
                <span className="fmp__wave" aria-hidden="true">
                  <span /><span /><span /><span /><span />
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="fmp__controls">
            <button type="button" className="fmp__btn" onClick={prevTrack} title="Piste précédente">
              &#9664;&#9664;
            </button>
            <button
              type="button"
              className={`fmp__btn fmp__btn--play${isPlaying ? " is-playing" : ""}`}
              onClick={handlePlayPause}
              title={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <button type="button" className="fmp__btn" onClick={nextTrack} title="Piste suivante">
              &#9654;&#9654;
            </button>
            <button
              type="button"
              className={`fmp__btn fmp__btn--vol${showVolume ? " is-active" : ""}`}
              onClick={() => setShowVolume((v) => !v)}
              title="Volume"
            >
              {volPct === 0 ? "🔇" : volPct < 50 ? "🔉" : "🔊"}
            </button>
          </div>

          {/* Volume slider */}
          {showVolume && (
            <div className="fmp__volume">
              <input
                type="range"
                min={0}
                max={100}
                value={volPct}
                style={{ "--vol-pct": `${volPct}%` }}
                className="music-volume__slider"
                onChange={handleVolume}
              />
              <span className="fmp__vol-label">{volPct}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
