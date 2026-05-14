import { useState, useCallback } from "react";

const STYLE_ID = "dm-particle-styles";
let _stylesInjected = false;

function ensureStyles() {
  if (_stylesInjected || typeof document === "undefined") return;
  _stylesInjected = true;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes dm-flash {
      0%   { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(4);   opacity: 0; }
    }
    @keyframes dm-particle {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
    }
    @keyframes dm-shake {
      0%,100% { transform: translate(0,0)     rotate(0deg)  scale(1);    }
      15%     { transform: translate(-4px,2px) rotate(-4deg) scale(0.94); }
      30%     { transform: translate(4px,-3px) rotate(4deg)  scale(1.06); }
      50%     { transform: translate(-3px,3px) rotate(-2deg) scale(0.97); }
      70%     { transform: translate(2px,-2px) rotate(2deg)  scale(1.02); }
    }
    @keyframes dm-eject {
      0%   { transform: translate(0,0) rotate(0deg) scale(1);   opacity: 1; }
      100% { transform: translate(var(--ex),var(--ey)) rotate(var(--er)) scale(0.2); opacity: 0; }
    }
    @keyframes dm-pulse {
      0%,100% { transform: scale(1);    filter: brightness(1);   }
      50%     { transform: scale(1.18); filter: brightness(2.2); }
    }
  `;
  document.head.appendChild(s);
}

const FIRE_COLORS = ["#ff6600", "#ff3300", "#ffaa00", "#ffff00", "#ff8800", "#ff4400"];
let _pid = 0;
let _gid = 0;

function getCellRect(row, col) {
  const el = document.querySelector(`[data-cell="${row}-${col}"]`);
  return el ? el.getBoundingClientRect() : null;
}

function Burst({ x, y, intensity }) {
  const n = intensity === "epic" ? 24 : 12;
  const maxD = intensity === "epic" ? 100 : 55;
  const fs = intensity === "epic" ? 80 : 60;
  return (
    <div style={{ position: "fixed", left: x, top: y, width: 0, height: 0, pointerEvents: "none", zIndex: 9999 }}>
      <div style={{
        position: "absolute",
        left: -fs / 2, top: -fs / 2,
        width: fs, height: fs,
        borderRadius: "50%",
        background: intensity === "epic"
          ? "radial-gradient(circle,rgba(255,255,255,1) 0%,rgba(255,180,0,.9) 40%,transparent 100%)"
          : "radial-gradient(circle,rgba(255,255,255,.9) 0%,rgba(255,120,0,.6) 50%,transparent 100%)",
        animation: "dm-flash 350ms ease-out forwards",
      }} />
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 360 + Math.random() * (360 / n * 0.8);
        const dist = maxD * (0.4 + Math.random() * 0.6);
        const rad = angle * Math.PI / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const sz = intensity === "epic" ? 4 + Math.random() * 9 : 3 + Math.random() * 5;
        const dur = 450 + Math.random() * 350;
        const color = FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)];
        return (
          <div key={i} style={{
            position: "absolute",
            left: -sz / 2, top: -sz / 2,
            width: sz, height: sz,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 ${sz * 1.5}px ${color}`,
            animation: `dm-particle ${dur}ms ease-out forwards`,
            "--tx": `${tx}px`,
            "--ty": `${ty}px`,
          }} />
        );
      })}
    </div>
  );
}

function GhostPiece({ row, col, children, mode, ex, ey, er }) {
  const rect = getCellRect(row, col);
  if (!rect) return null;
  return (
    <div style={{
      position: "fixed",
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height,
      pointerEvents: "none", zIndex: 9998,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: mode === "eject" ? "dm-eject 600ms ease-in forwards" : "dm-shake 350ms ease-out forwards",
      "--ex": `${ex}px`,
      "--ey": `${ey}px`,
      "--er": `${er}deg`,
    }}>
      {children}
    </div>
  );
}

export function useParticles() {
  ensureStyles();
  const [bursts, setBursts] = useState([]);
  const [ghosts, setGhosts] = useState([]);

  const triggerAt = useCallback((row, col, intensity = "normal") => {
    const rect = getCellRect(row, col);
    if (!rect) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const id = ++_pid;
    setBursts(prev => [...prev, { id, x, y, intensity }]);
    setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), 950);
  }, []);

  const addGhost = useCallback((row, col, children, mode = "shake") => {
    const id = ++_gid;
    const ex = mode === "eject" ? (Math.random() - 0.5) * 200 : 0;
    const ey = mode === "eject" ? -80 - Math.random() * 120 : 0;
    const er = mode === "eject" ? (Math.random() - 0.5) * 720 : 0;
    setGhosts(prev => [...prev, { id, row, col, children, mode, ex, ey, er }]);
    setTimeout(() => setGhosts(prev => prev.filter(g => g.id !== id)), 700);
  }, []);

  function ParticleLayer() {
    return (
      <>
        {bursts.map(b => <Burst key={b.id} {...b} />)}
        {ghosts.map(g => (
          <GhostPiece key={g.id} row={g.row} col={g.col} mode={g.mode} ex={g.ex} ey={g.ey} er={g.er}>
            {g.children}
          </GhostPiece>
        ))}
      </>
    );
  }

  return { triggerAt, addGhost, ParticleLayer };
}
