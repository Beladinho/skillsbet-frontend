import { useMusic } from "../context/MusicContext";

export default function MusicStylePicker() {
  const {
    tracks,
    currentStyle,
    currentVolume,
    setMusicStyle,
    setMusicVolume,
    startPreview,
    stopPreview,
    previewTrackId,
    isPlaying,
    musicEnabled,
  } = useMusic();

  function handlePreviewToggle(e, trackId) {
    e.stopPropagation();
    if (previewTrackId === trackId) {
      stopPreview();
    } else {
      startPreview(trackId);
    }
  }

  function handleVolumeChange(e) {
    const pct = Number(e.target.value) / 100;
    setMusicVolume(pct);
    e.target.style.setProperty("--vol-pct", `${e.target.value}%`);
  }

  const volPct = Math.round(currentVolume * 100);

  return (
    <div className="music-picker">
      <div className="music-picker__label">Style musical</div>

      <div className="music-picker__grid">
        {tracks.map((track) => {
          const isSelected = currentStyle === track.id;
          const isPreviewing = previewTrackId === track.id;

          return (
            <div
              key={track.id}
              className={`music-track-card${isSelected ? " is-selected" : ""}`}
              onClick={() => setMusicStyle(track.id)}
            >
              <span className="music-track-card__icon">{track.icon}</span>
              <div className="music-track-card__info">
                <div className="music-track-card__name">{track.label}</div>
              </div>
              <button
                type="button"
                className={`music-track-card__preview-btn${isPreviewing ? " is-previewing" : ""}`}
                onClick={(e) => handlePreviewToggle(e, track.id)}
                title={isPreviewing ? "Arrêter l'aperçu" : "Écouter un aperçu"}
              >
                {isPreviewing ? "■" : "▶"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="music-volume">
        <span className="music-volume__icon">
          {volPct === 0 ? "🔇" : volPct < 50 ? "🔉" : "🔊"}
        </span>
        <input
          type="range"
          className="music-volume__slider"
          min={0}
          max={100}
          value={volPct}
          style={{ "--vol-pct": `${volPct}%` }}
          onChange={handleVolumeChange}
        />
        <span className="music-volume__value">{volPct}%</span>
      </div>

      {musicEnabled && isPlaying && (
        <div>
          <span className="music-now-playing">
            <span className="music-now-playing__dot" />
            {tracks.find((t) => t.id === currentStyle)?.icon}{" "}
            {tracks.find((t) => t.id === currentStyle)?.label}
          </span>
        </div>
      )}
    </div>
  );
}
