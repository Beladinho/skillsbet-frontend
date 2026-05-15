import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useAppSettings } from "./AppSettingsContext";

const SoundContext = createContext(null);

function safeNow(ctx) {
  return ctx.currentTime || 0;
}

function createBeep(
  ctx,
  destination,
  {
    frequency = 440,
    duration = 0.12,
    type = "sine",
    gainValue = 0.03,
  }
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, safeNow(ctx));

  gain.gain.setValueAtTime(0.0001, safeNow(ctx));
  gain.gain.exponentialRampToValueAtTime(gainValue, safeNow(ctx) + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, safeNow(ctx) + duration);

  oscillator.connect(gain);
  gain.connect(destination);

  oscillator.start();
  oscillator.stop(safeNow(ctx) + duration + 0.02);
}

export function SoundProvider({ children }) {
  const { settings } = useAppSettings();
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, settings?.sound_volume ?? 0.5)) * 2;
    }
  }, [settings?.sound_volume]);

  function getAudioContext() {
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, settings?.sound_volume ?? 0.5)) * 2;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    return audioContextRef.current;
  }

  async function unlockAudio() {
    const ctx = getAudioContext();
    if (!ctx) return null;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (err) {
        console.error("Audio resume failed:", err);
      }
    }

    return ctx;
  }

  async function playSuccess() {
    if (settings?.sound_enabled === false) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    await unlockAudio();

    createBeep(ctx, masterGainRef.current ?? ctx.destination, {
      frequency: 523.25,
      duration: 0.08,
      type: "sine",
      gainValue: 0.03,
    });

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 659.25,
        duration: 0.12,
        type: "sine",
        gainValue: 0.03,
      });
    }, 90);
  }

  async function playError() {
    if (settings?.sound_enabled === false) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    await unlockAudio();

    createBeep(ctx, masterGainRef.current ?? ctx.destination, {
      frequency: 220,
      duration: 0.12,
      type: "sawtooth",
      gainValue: 0.035,
    });

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 180,
        duration: 0.14,
        type: "sawtooth",
        gainValue: 0.03,
      });
    }, 100);
  }

  async function playInfo() {
    if (settings?.sound_enabled === false) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    await unlockAudio();

    createBeep(ctx, masterGainRef.current ?? ctx.destination, {
      frequency: 440,
      duration: 0.08,
      type: "triangle",
      gainValue: 0.025,
    });
  }

  async function playMatchFound() {
    if (settings?.sound_enabled === false) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    await unlockAudio();

    createBeep(ctx, masterGainRef.current ?? ctx.destination, {
      frequency: 523.25,
      duration: 0.08,
      type: "square",
      gainValue: 0.03,
    });

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 659.25,
        duration: 0.08,
        type: "square",
        gainValue: 0.03,
      });
    }, 80);

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 783.99,
        duration: 0.14,
        type: "square",
        gainValue: 0.03,
      });
    }, 160);
  }

  async function playClick() {
    if (settings?.sound_enabled === false) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    await unlockAudio();

    createBeep(ctx, masterGainRef.current ?? ctx.destination, {
      frequency: 330,
      duration: 0.04,
      type: "triangle",
      gainValue: 0.015,
    });
  }

  async function playPromotion() {
    if (settings?.sound_enabled === false) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    await unlockAudio();

    createBeep(ctx, masterGainRef.current ?? ctx.destination, {
      frequency: 523.25,
      duration: 0.08,
      type: "square",
      gainValue: 0.03,
    });

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 659.25,
        duration: 0.08,
        type: "square",
        gainValue: 0.03,
      });
    }, 90);

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 783.99,
        duration: 0.1,
        type: "square",
        gainValue: 0.03,
      });
    }, 180);

    window.setTimeout(() => {
      createBeep(ctx, masterGainRef.current ?? ctx.destination, {
        frequency: 1046.5,
        duration: 0.18,
        type: "square",
        gainValue: 0.035,
      });
    }, 280);
  }

  const value = useMemo(
    () => ({
      unlockAudio,
      playSuccess,
      playError,
      playInfo,
      playMatchFound,
      playClick,
      playPromotion,
      soundEnabled: settings?.sound_enabled !== false,
      musicEnabled: settings?.music_enabled !== false,
    }),
    [settings?.sound_enabled, settings?.music_enabled]
  );

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSounds() {
  const ctx = useContext(SoundContext);

  if (!ctx) {
    throw new Error("useSounds must be used inside SoundProvider");
  }

  return ctx;
}