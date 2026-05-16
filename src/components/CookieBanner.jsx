import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "sb_cookie_consent";

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !getStored());
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    const handler = () => {
      const stored = getStored();
      setAnalytics(stored?.analytics ?? true);
      setPreferences(stored?.preferences ?? true);
      setShowModal(true);
      setVisible(true);
    };
    window.addEventListener("openCookieSettings", handler);
    return () => window.removeEventListener("openCookieSettings", handler);
  }, []);

  if (!visible) return null;

  const save = (prefs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }));
    } catch {}
    setVisible(false);
    setShowModal(false);
  };

  const acceptAll = () => save({ essential: true, analytics: true, preferences: true });
  const refuseAll = () => save({ essential: true, analytics: false, preferences: false });
  const saveCustom = () => save({ essential: true, analytics, preferences });

  if (showModal) {
    return (
      <div style={s.overlay} role="dialog" aria-modal="true" aria-label="Paramètres des cookies">
        <div style={s.modal}>
          <h2 style={s.modalTitle}>Paramètres des cookies</h2>
          <p style={s.modalSubtext}>
            Gérez vos préférences ci-dessous. Vos choix s'appliquent au prochain chargement de la page.
          </p>

          <div style={s.category}>
            <div style={s.categoryRow}>
              <span style={s.categoryName}>Cookies essentiels</span>
              <div style={{ ...s.toggle, background: "#FF6B00", opacity: 0.5, cursor: "not-allowed" }}>
                <div style={{ ...s.thumb, transform: "translateX(20px)" }} />
              </div>
            </div>
            <p style={s.categoryDesc}>Nécessaires au fonctionnement du site. Toujours actifs.</p>
          </div>

          <div style={s.category}>
            <div style={s.categoryRow}>
              <span style={s.categoryName}>Cookies analytiques</span>
              <div
                style={{ ...s.toggle, background: analytics ? "#FF6B00" : "#333", cursor: "pointer" }}
                onClick={() => setAnalytics((v) => !v)}
                role="switch"
                aria-checked={analytics}
                tabIndex={0}
                onKeyDown={(e) => e.key === " " && setAnalytics((v) => !v)}
              >
                <div style={{ ...s.thumb, transform: analytics ? "translateX(20px)" : "translateX(0)" }} />
              </div>
            </div>
            <p style={s.categoryDesc}>Sentry, mesures de performance. Nous aident à améliorer l'application.</p>
          </div>

          <div style={{ ...s.category, borderBottom: "none" }}>
            <div style={s.categoryRow}>
              <span style={s.categoryName}>Cookies de préférences</span>
              <div
                style={{ ...s.toggle, background: preferences ? "#FF6B00" : "#333", cursor: "pointer" }}
                onClick={() => setPreferences((v) => !v)}
                role="switch"
                aria-checked={preferences}
                tabIndex={0}
                onKeyDown={(e) => e.key === " " && setPreferences((v) => !v)}
              >
                <div style={{ ...s.thumb, transform: preferences ? "translateX(20px)" : "translateX(0)" }} />
              </div>
            </div>
            <p style={s.categoryDesc}>Thème, langue, musique. Mémorisent vos préférences d'interface.</p>
          </div>

          <div style={s.modalActions}>
            <button style={s.btnMinimal} onClick={refuseAll}>Tout refuser</button>
            <button style={s.btnGhost} onClick={saveCustom}>Enregistrer</button>
            <button style={s.btnOrange} onClick={acceptAll}>Tout accepter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.banner} role="dialog" aria-label="Consentement cookies">
      <p style={s.bannerText}>
        Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{" "}
        <Link to="/legal/privacy" style={s.link}>politique de confidentialité</Link>.
      </p>
      <div style={s.bannerActions}>
        <button style={s.btnOrange} onClick={acceptAll}>Tout accepter</button>
        <button style={s.btnGhost} onClick={() => setShowModal(true)}>Personnaliser</button>
        <button style={s.btnMinimal} onClick={refuseAll}>Refuser</button>
      </div>
    </div>
  );
}

const s = {
  banner: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: "#111111",
    borderTop: "2px solid #FF6B00",
    padding: "14px 24px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px 24px",
    boxShadow: "0 -4px 24px rgba(0,0,0,0.6)",
  },
  bannerText: {
    flex: 1,
    minWidth: 240,
    margin: 0,
    color: "#AAAAAA",
    fontSize: "0.85rem",
    lineHeight: 1.5,
  },
  link: {
    color: "#FF6B00",
    textDecoration: "underline",
  },
  bannerActions: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
    flexWrap: "wrap",
  },
  btnOrange: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "8px 18px",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  btnGhost: {
    background: "transparent",
    color: "#FF6B00",
    border: "1px solid #FF6B00",
    borderRadius: 4,
    padding: "8px 18px",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  btnMinimal: {
    background: "transparent",
    color: "#AAAAAA",
    border: "1px solid #444",
    borderRadius: 4,
    padding: "8px 18px",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(0,0,0,0.78)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#1A1A1A",
    border: "1px solid #FF6B00",
    borderRadius: 8,
    padding: "28px 32px",
    maxWidth: 520,
    width: "100%",
    boxShadow: "0 0 40px rgba(255,107,0,0.12)",
  },
  modalTitle: {
    margin: "0 0 6px",
    color: "#fff",
    fontSize: "1.2rem",
    fontFamily: "var(--font-heading, 'Barlow Condensed', sans-serif)",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  modalSubtext: {
    margin: "0 0 20px",
    color: "#AAAAAA",
    fontSize: "0.82rem",
    lineHeight: 1.5,
  },
  category: {
    borderBottom: "1px solid #242424",
    padding: "14px 0",
  },
  categoryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.88rem",
  },
  categoryDesc: {
    margin: 0,
    color: "#666666",
    fontSize: "0.78rem",
    lineHeight: 1.4,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    position: "relative",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  thumb: {
    position: "absolute",
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s",
  },
  modalActions: {
    display: "flex",
    gap: 8,
    marginTop: 20,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
};
