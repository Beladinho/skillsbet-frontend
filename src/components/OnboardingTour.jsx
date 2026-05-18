import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const STEPS = [
  {
    selector: ".session-bar__player",
    title: "Bienvenue ! 👋",
    desc: "Voici ton profil : pseudo, niveau XP et solde de jetons.",
    placement: "bottom",
  },
  {
    selector: ".game-selector, .stats-grid select",
    title: "Choisis un jeu",
    desc: "Sélectionne le jeu pour ton prochain duel depuis ce sélecteur.",
    placement: "bottom",
  },
  {
    selector: ".matchmaker-status, .matchmaker-btn",
    title: "Lance une recherche !",
    desc: "Trouve un adversaire en quelques secondes, ou entraîne-toi en mode Solo.",
    placement: "bottom",
  },
  {
    selector: "button[title='Paramètres']",
    title: "Personnalise ⚙",
    desc: "Accède aux paramètres : langue, thème, musique et bien plus.",
    placement: "bottom",
  },
  {
    selector: ".session-bar__friends",
    title: "Invite des amis 👥",
    desc: "Retrouve tes amis, envoie des défis et grimpez ensemble au classement !",
    placement: "bottom",
  },
];

export default function OnboardingTour() {
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== "/lobby") return;
    if (localStorage.getItem("sb_onboarding_done")) return;
    timerRef.current = setTimeout(() => {
      // Don't start tour if user is already in solo/game mode (lobby-sections absent)
      if (document.querySelector(".lobby-sections")) setVisible(true);
    }, 1800);
    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  useEffect(() => {
    if (!visible) return;
    const tryFind = (attempt = 0) => {
      const current = STEPS[step];
      const selectors = current.selector.split(", ");
      let el = null;
      for (const sel of selectors) {
        el = document.querySelector(sel);
        if (el) break;
      }
      if (el) {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (attempt < 5) {
        setTimeout(() => tryFind(attempt + 1), 300);
      } else {
        // Element not found: user likely navigated away (solo mode), dismiss tour
        finish();
      }
    };
    tryFind();
  }, [visible, step]);

  function finish() {
    localStorage.setItem("sb_onboarding_done", "1");
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  }

  if (!visible) return null;
  const curr = STEPS[step];

  const TOOLTIP_W = 300;
  let tipStyle = { position: "fixed", zIndex: 9992, width: TOOLTIP_W };
  if (rect) {
    const GAP = 14;
    const left = Math.max(12, Math.min(window.innerWidth - TOOLTIP_W - 12, rect.left + rect.width / 2 - TOOLTIP_W / 2));
    if (curr.placement === "bottom") {
      tipStyle = { ...tipStyle, top: rect.bottom + GAP, left };
    } else {
      tipStyle = { ...tipStyle, top: rect.top - 180 - GAP, left };
    }
  } else {
    tipStyle = { ...tipStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  }

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9989, background: "rgba(0,0,0,0.7)", pointerEvents: "all" }} onClick={finish} />
      {rect && (
        <div style={{
          position: "fixed", zIndex: 9990, pointerEvents: "none",
          top: rect.top - 6, left: rect.left - 6,
          width: rect.width + 12, height: rect.height + 12,
          borderRadius: 10,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.7), 0 0 0 2px #FF6B00, 0 0 24px rgba(255,107,0,0.5)",
        }} />
      )}
      <div style={{
        ...tipStyle,
        background: "#111111",
        border: "1px solid #383838",
        borderTop: "3px solid #FF6B00",
        borderRadius: 10,
        padding: "18px 20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
        animation: "fadeInUp 0.3s ease both",
        pointerEvents: "all",
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i === step ? "#FF6B00" : "#383838",
              transition: "background 0.2s",
            }} />
          ))}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#fff", marginBottom: 8 }}>
          {curr.title}
        </div>
        <p style={{ fontSize: "0.83rem", color: "#AAAAAA", lineHeight: 1.5, marginBottom: 16 }}>
          {curr.desc}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          <button
            onClick={finish}
            style={{ background: "transparent", border: "1px solid #383838", color: "#666", fontSize: "0.72rem", padding: "6px 12px", borderRadius: 6, cursor: "pointer", minHeight: "auto" }}
          >
            Ignorer
          </button>
          <button
            onClick={next}
            style={{ background: "#FF6B00", border: "none", color: "#fff", fontSize: "0.8rem", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontWeight: 700, minHeight: "auto" }}
          >
            {step === STEPS.length - 1 ? "Terminer ✓" : "Suivant →"}
          </button>
        </div>
      </div>
    </>
  );
}
