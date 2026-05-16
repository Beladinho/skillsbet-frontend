import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openChat } from "../hooks/useCrisp";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const RETRY_INTERVAL = 30;

export default function Maintenance() {
  const [countdown, setCountdown] = useState(RETRY_INTERVAL);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          tryReconnect();
          return RETRY_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  async function tryReconnect() {
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        navigate("/", { replace: true });
        return;
      }
    } catch {
      // still down
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.noise} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoText}>SKILLS</span>
          <span style={styles.logoBet}>BET</span>
        </div>

        <div style={styles.divider} />

        {/* Icon */}
        <div style={styles.iconWrap}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.9 }}>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="#FF6B00"
            />
          </svg>
        </div>

        <h1 style={styles.title}>MAINTENANCE EN COURS</h1>
        <p style={styles.subtitle}>
          Nos serveurs sont temporairement hors ligne pour une mise à jour.
          <br />
          Nous revenons très vite, opérateur.
        </p>

        {/* Countdown ring */}
        <div style={styles.countdownWrap}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,107,0,0.12)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - countdown / RETRY_INTERVAL)}`}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <div style={styles.countdownInner}>
            {checking ? (
              <span style={styles.checkingDot}>...</span>
            ) : (
              <span style={styles.countdownNum}>{countdown}</span>
            )}
            <span style={styles.countdownLabel}>{checking ? "vérification" : "secondes"}</span>
          </div>
        </div>

        <p style={styles.retryText}>
          Reconnexion automatique dans <strong style={{ color: "#FF6B00" }}>{countdown}s</strong>
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={styles.btn}
            onClick={tryReconnect}
            disabled={checking}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FF8C40";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FF6B00";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {checking ? "Vérification…" : "Réessayer maintenant"}
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
        @keyframes maintenance-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
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
  noise: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,107,0,0.03) 2px, rgba(255,107,0,0.03) 4px)",
    animation: "maintenance-pulse 4s ease-in-out infinite",
    pointerEvents: "none",
  },
  container: {
    textAlign: "center",
    padding: "48px 32px",
    background: "#111111",
    border: "1px solid #282828",
    borderRadius: 12,
    maxWidth: 480,
    width: "90%",
    animation: "fadeInUp 0.5s ease both",
    position: "relative",
    boxShadow: "0 0 60px rgba(255,107,0,0.08), 0 2px 16px rgba(0,0,0,0.6)",
  },
  logoWrap: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 16,
  },
  logoText: {
    fontSize: "2rem",
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  logoBet: {
    fontSize: "2rem",
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "#FF6B00",
    textTransform: "uppercase",
  },
  divider: {
    height: 2,
    background: "linear-gradient(90deg, transparent, #FF6B00, transparent)",
    marginBottom: 24,
    opacity: 0.4,
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#FFFFFF",
    textTransform: "uppercase",
    margin: "0 0 12px",
  },
  subtitle: {
    color: "#AAAAAA",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    marginBottom: 28,
  },
  countdownWrap: {
    position: "relative",
    display: "inline-block",
    marginBottom: 12,
  },
  countdownInner: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  countdownNum: {
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "#FF6B00",
    lineHeight: 1,
  },
  checkingDot: {
    fontSize: "1.2rem",
    fontWeight: 900,
    color: "#FF6B00",
    lineHeight: 1,
  },
  countdownLabel: {
    fontSize: "0.6rem",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginTop: 2,
  },
  retryText: {
    color: "#666666",
    fontSize: "0.85rem",
    marginBottom: 20,
  },
  btn: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 24px",
    fontSize: "0.9rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.18s ease",
    fontFamily: "inherit",
  },
};
