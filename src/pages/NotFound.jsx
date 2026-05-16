import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { openChat } from "../hooks/useCrisp";

export default function NotFound() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  /* Particle effect on canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,107,0,${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={styles.root}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <div style={styles.container}>
        {/* 404 big number */}
        <div style={styles.codeWrap}>
          <span style={styles.codeLeft}>4</span>
          <span style={styles.codeCenter}>0</span>
          <span style={styles.codeRight}>4</span>
        </div>

        <div style={styles.divider} />

        <h1 style={styles.title}>ZONE INTROUVABLE</h1>

        <p style={styles.subtitle}>
          Cette position n'existe pas sur la carte.
          <br />
          Vous vous êtes aventuré hors des limites du terrain.
        </p>

        <div style={styles.crosshair}>
          <div style={styles.crosshairH} />
          <div style={styles.crosshairV} />
          <div style={styles.crosshairDot} />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={styles.btn}
            onClick={() => navigate("/")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FF8C40";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,107,0,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FF6B00";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ← Retour à la base
          </button>
          <button
            style={{ ...styles.btn, background: "transparent", border: "1px solid #FF6B00", color: "#FF6B00" }}
            onClick={openChat}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            💬 Contacter le support
          </button>
        </div>
      </div>

      <style>{`
        @keyframes glitch {
          0%   { clip-path: inset(40% 0 61% 0); transform: translate(-4px, 0); }
          20%  { clip-path: inset(92% 0 1%  0); transform: translate(4px,  0); }
          40%  { clip-path: inset(43% 0 1%  0); transform: translate(-2px, 0); }
          60%  { clip-path: inset(25% 0 58% 0); transform: translate(2px,  0); }
          80%  { clip-path: inset(54% 0 7%  0); transform: translate(-4px, 0); }
          100% { clip-path: inset(58% 0 43% 0); transform: translate(0,    0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .nf-code-glitch::before,
        .nf-code-glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nf-code-glitch::before {
          color: #FF6B00;
          animation: glitch 2.5s infinite linear alternate-reverse;
        }
        .nf-code-glitch::after {
          color: #ef4444;
          animation: glitch 2s infinite linear alternate;
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0A0A0A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  container: {
    textAlign: "center",
    padding: "48px 40px",
    background: "#111111",
    border: "1px solid #282828",
    borderRadius: 12,
    maxWidth: 520,
    width: "90%",
    animation: "fadeInUp 0.45s ease both",
    position: "relative",
    boxShadow: "0 0 60px rgba(255,107,0,0.06), 0 2px 16px rgba(0,0,0,0.7)",
  },
  codeWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    marginBottom: 12,
  },
  codeLeft: {
    fontSize: "clamp(5rem,15vw,9rem)",
    fontWeight: 900,
    color: "#FFFFFF",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  codeCenter: {
    fontSize: "clamp(5rem,15vw,9rem)",
    fontWeight: 900,
    color: "#FF6B00",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    position: "relative",
    textShadow: "0 0 40px rgba(255,107,0,0.5)",
  },
  codeRight: {
    fontSize: "clamp(5rem,15vw,9rem)",
    fontWeight: 900,
    color: "#FFFFFF",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  divider: {
    height: 2,
    background: "linear-gradient(90deg, transparent, #FF6B00, transparent)",
    margin: "12px 0 20px",
    opacity: 0.5,
  },
  title: {
    fontSize: "clamp(1.4rem,4vw,2rem)",
    fontWeight: 900,
    letterSpacing: "0.12em",
    color: "#FFFFFF",
    textTransform: "uppercase",
    margin: "0 0 12px",
    textShadow: "0 0 30px rgba(255,107,0,0.2)",
  },
  subtitle: {
    color: "#888888",
    fontSize: "0.95rem",
    lineHeight: 1.7,
    marginBottom: 28,
  },
  crosshair: {
    position: "relative",
    width: 48,
    height: 48,
    margin: "0 auto 28px",
  },
  crosshairH: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    background: "rgba(255,107,0,0.5)",
    transform: "translateY(-50%)",
  },
  crosshairV: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1,
    background: "rgba(255,107,0,0.5)",
    transform: "translateX(-50%)",
  },
  crosshairDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 6,
    height: 6,
    background: "#FF6B00",
    borderRadius: "50%",
    transform: "translate(-50%,-50%)",
    boxShadow: "0 0 8px rgba(255,107,0,0.8)",
  },
  btn: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "12px 28px",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.18s ease",
    fontFamily: "inherit",
  },
};
