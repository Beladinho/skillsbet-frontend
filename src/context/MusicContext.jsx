import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAppSettings } from "./AppSettingsContext";

const MusicContext = createContext(null);

export const MUSIC_TRACKS = [
  { id: "gaming-electro", label: "Electro Gaming",   icon: "⚡", file: "/music/gaming-electro.mp3" },
  { id: "lofi-chill",     label: "Lofi Chill",        icon: "🎧", file: "/music/lofi-chill.mp3" },
  { id: "hip-hop-trap",   label: "Hip-Hop / Trap",    icon: "🔥", file: "/music/hip-hop-trap.mp3" },
  { id: "rock-intense",   label: "Rock Intense",      icon: "🎸", file: "/music/rock-intense.mp3" },
  { id: "ambient-space",  label: "Ambient Space",     icon: "🌌", file: "/music/ambient-space.mp3" },
  { id: "jazz-smooth",    label: "Jazz Smooth",       icon: "🎷", file: "/music/jazz-smooth.mp3" },
  { id: "orchestral-epic",label: "Orchestral Epic",   icon: "🎻", file: "/music/orchestral-epic.mp3" },
  { id: "synthwave-retro",label: "Synthwave Rétro",   icon: "🌆", file: "/music/synthwave-retro.mp3" },
];

function getTrackFile(styleId) {
  return MUSIC_TRACKS.find((t) => t.id === styleId)?.file ?? MUSIC_TRACKS[0].file;
}

export function MusicProvider({ children }) {
  const { settings, setSettings } = useAppSettings();

  const audioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState(null);

  const currentStyle = settings?.music_style ?? "gaming-electro";
  const currentVolume = settings?.music_volume ?? 0.4;
  const musicEnabled = settings?.music_enabled !== false;

  // Sync volume on both audio elements whenever settings change
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = currentVolume;
    if (previewAudioRef.current) previewAudioRef.current.volume = currentVolume;
  }, [currentVolume]);

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewTrackId(null);
  }, []);

  const stopLobbyMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const startLobbyMusic = useCallback(async () => {
    if (!musicEnabled) {
      stopLobbyMusic();
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = currentVolume;
    }

    const src = getTrackFile(currentStyle);
    if (audioRef.current.dataset.style !== currentStyle) {
      audioRef.current.src = src;
      audioRef.current.dataset.style = currentStyle;
      audioRef.current.load();
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      // Autoplay blocked — will start on next user interaction
    }
  }, [musicEnabled, currentStyle, currentVolume, stopLobbyMusic]);

  const startPreview = useCallback((trackId) => {
    stopPreview();

    const track = MUSIC_TRACKS.find((t) => t.id === trackId);
    if (!track) return;

    const audio = new Audio(track.file);
    audio.volume = currentVolume;
    audio.play().catch(() => {});
    previewAudioRef.current = audio;
    setPreviewTrackId(trackId);

    audio.addEventListener("ended", () => {
      previewAudioRef.current = null;
      setPreviewTrackId(null);
    });
  }, [currentVolume, stopPreview]);

  const setMusicStyle = useCallback((styleId) => {
    stopPreview();
    setSettings((prev) => ({ ...prev, music_style: styleId }));
  }, [setSettings, stopPreview]);

  const setMusicVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSettings((prev) => ({ ...prev, music_volume: clamped }));
  }, [setSettings]);

  const value = useMemo(() => ({
    startLobbyMusic,
    stopLobbyMusic,
    isPlaying,
    musicEnabled,
    currentStyle,
    currentVolume,
    setMusicStyle,
    setMusicVolume,
    startPreview,
    stopPreview,
    previewTrackId,
    tracks: MUSIC_TRACKS,
  }), [
    startLobbyMusic, stopLobbyMusic, isPlaying, musicEnabled,
    currentStyle, currentVolume, setMusicStyle, setMusicVolume,
    startPreview, stopPreview, previewTrackId,
  ]);

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
}
