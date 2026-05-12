import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useAppSettings } from "./AppSettingsContext";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const { settings } = useAppSettings();

  const audioContextRef = useRef(null);
  const gainRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const timerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function getAudioContext() {
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    return audioContextRef.current;
  }

  async function ensureAudioReady() {
    const ctx = getAudioContext();
    if (!ctx) return null;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (err) {
        console.error("Audio resume failed:", err);
        return null;
      }
    }

    return ctx;
  }

  function stopLobbyMusic() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore
      }

      try {
        osc.disconnect();
      } catch {
        // ignore
      }
    });

    oscillatorsRef.current = [];

    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch {
        // ignore
      }
      gainRef.current = null;
    }

    setIsPlaying(false);
  }

  async function startLobbyMusic() {
    if (settings?.music_enabled === false) {
      stopLobbyMusic();
      return;
    }

    if (isPlaying) return;

    const ctx = await ensureAudioReady();
    if (!ctx) return;

    stopLobbyMusic();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.018, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc3.type = "sine";

    osc1.frequency.setValueAtTime(261.63, ctx.currentTime);
    osc2.frequency.setValueAtTime(329.63, ctx.currentTime);
    osc3.frequency.setValueAtTime(392.0, ctx.currentTime);

    osc1.connect(masterGain);
    osc2.connect(masterGain);
    osc3.connect(masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    oscillatorsRef.current = [osc1, osc2, osc3];
    setIsPlaying(true);

    let step = 0;
    const progression = [
      [261.63, 329.63, 392.0],
      [293.66, 369.99, 440.0],
      [329.63, 415.3, 493.88],
      [261.63, 329.63, 392.0],
    ];

    function cycle() {
      if (!audioContextRef.current || oscillatorsRef.current.length === 0) {
        return;
      }

      const now = audioContextRef.current.currentTime;
      const chord = progression[step % progression.length];

      try {
        oscillatorsRef.current[0].frequency.linearRampToValueAtTime(
          chord[0],
          now + 0.8
        );
        oscillatorsRef.current[1].frequency.linearRampToValueAtTime(
          chord[1],
          now + 0.8
        );
        oscillatorsRef.current[2].frequency.linearRampToValueAtTime(
          chord[2],
          now + 0.8
        );
      } catch {
        return;
      }

      step += 1;
      timerRef.current = window.setTimeout(cycle, 1800);
    }

    cycle();
  }

  const value = useMemo(
    () => ({
      startLobbyMusic,
      stopLobbyMusic,
      isPlaying,
      musicEnabled: settings?.music_enabled !== false,
    }),
    [isPlaying, settings?.music_enabled]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);

  if (!ctx) {
    throw new Error("useMusic must be used inside MusicProvider");
  }

  return ctx;
}