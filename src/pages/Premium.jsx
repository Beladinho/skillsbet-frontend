import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import SessionBar from "../components/SessionBar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLANS = [
  {
    key: "free",
    name: "Gratuit",
    nameEn: "Free",
    price: null,
    desc: "Pour commencer l'aventure",
    descEn: "To start the adventure",
    color: "#666",
    features: [
      { text: "Accès aux jeux de base", en: "Access to basic games" },
      { text: "Classement mondial", en: "World rankings" },
      { text: "Chat en duel", en: "In-duel chat" },
      { text: "10 jetons de départ", en: "10 starting tokens" },
    ],
    unavailable: [],
  },
  {
    key: "premium",
    name: "Premium",
    nameEn: "Premium",
    price: "4.99",
    desc: "Pour les joueurs sérieux",
    descEn: "For serious players",
    color: "#FFD700",
    popular: true,
    features: [
      { text: "Tout du plan Gratuit", en: "Everything in Free" },
      { text: "Badge PREMIUM doré dans le profil", en: "Golden PREMIUM badge in profile" },
      { text: "2x XP sur chaque partie", en: "2x XP on every game" },
      { text: "Accès aux tournois premium", en: "Access to premium tournaments" },
      { text: "Bordure d'avatar dorée", en: "Golden avatar frame" },
      { text: "Stats avancées enrichies", en: "Enhanced advanced stats" },
    ],
    unavailable: [],
  },
  {
    key: "vip",
    name: "VIP",
    nameEn: "VIP",
    price: "9.99",
    desc: "L'expérience ultime",
    descEn: "The ultimate experience",
    color: "#FF6B00",
    features: [
      { text: "Tout du plan Premium", en: "Everything in Premium" },
      { text: "Badge VIP exclusif", en: "Exclusive VIP badge" },
      { text: "3x XP sur chaque partie", en: "3x XP on every game" },
      { text: "Bordure d'avatar VIP exclusive", en: "Exclusive VIP avatar frame" },
      { text: "Thèmes de couleurs exclusifs", en: "Exclusive color themes" },
      { text: "Support prioritaire", en: "Priority support" },
      { text: "Accès anticipé aux nouveautés", en: "Early access to new features" },
    ],
    unavailable: [],
  },
];

export default function Premium() {
  const { playerId, token } = useContext(PlayerContext);
  const { settings, tr } = useAppSettings();
  const { notifyError } = useNotifications();
  const navigate = useNavigate();
  const lang = settings?.language || "fr";

  const [currentTier, setCurrentTier] = useState("free");
  const [loading, setLoading] = useState(false);
  const [loadingTier, setLoadingTier] = useState(true);

  useEffect(() => {
    if (!playerId || !token) return;
    fetch(`${API_URL}/subscription/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setCurrentTier(d.tier || "free"))
      .catch(() => {})
      .finally(() => setLoadingTier(false));
  }, [playerId, token]);

  async function handleSubscribe(planKey) {
    if (planKey === "free" || planKey === currentTier) return;
    if (!playerId || !token) { navigate("/login"); return; }
    setLoading(planKey);
    try {
      const res = await fetch(`${API_URL}/subscription/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        notifyError("Premium", data.detail || "Erreur lors de la souscription.");
      }
    } catch (e) {
      notifyError("Premium", "Erreur lors de la souscription.");
    } finally {
      setLoading(false);
    }
  }

  const tn = (plan, field) => {
    if (field === "name") return lang === "en" ? plan.nameEn : plan.name;
    if (field === "desc") return lang === "en" ? plan.descEn : plan.desc;
    return "";
  };

  const tf = (feat) => lang === "en" ? feat.en : feat.text;

  return (
    <div className="app-shell">
      <SessionBar />
      <div style={{ paddingTop: 72, maxWidth: 1100, margin: "0 auto", padding: "72px 16px 60px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,107,0,0.1)",
            border: "1px solid rgba(255,107,0,0.3)",
            borderRadius: 20,
            padding: "4px 16px",
            fontSize: "0.75rem",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--clr-orange)",
            marginBottom: 16,
          }}>
            {lang === "en" ? "SUBSCRIPTIONS" : "ABONNEMENTS"}
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "linear-gradient(135deg, #ff6b00, #ff9500)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12,
          }}>
            {lang === "en" ? "UPGRADE YOUR GAME" : "PASSEZ AU NIVEAU SUPÉRIEUR"}
          </h1>
          <p style={{ color: "var(--clr-text-dim)", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto" }}>
            {lang === "en"
              ? "Unlock exclusive features and dominate the leaderboards."
              : "Débloquez des fonctionnalités exclusives et dominez les classements."}
          </p>
        </div>

        {/* Plans grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}>
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.key;
            const isVip = plan.key === "vip";
            const isPremium = plan.key === "premium";
            const isLoadingThis = loading === plan.key;

            return (
              <div
                key={plan.key}
                style={{
                  position: "relative",
                  background: isVip
                    ? "linear-gradient(160deg, rgba(255,107,0,0.08) 0%, rgba(255,107,0,0.03) 100%)"
                    : isPremium
                    ? "linear-gradient(160deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)"
                    : "var(--clr-surface-1)",
                  border: isVip
                    ? "1px solid rgba(255,107,0,0.5)"
                    : isPremium
                    ? "1px solid rgba(255,215,0,0.4)"
                    : "1px solid var(--clr-border)",
                  borderRadius: 16,
                  padding: "28px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  boxShadow: isVip
                    ? "0 0 40px rgba(255,107,0,0.12), inset 0 0 0 1px rgba(255,107,0,0.05)"
                    : isPremium
                    ? "0 0 30px rgba(255,215,0,0.08)"
                    : "none",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* VIP shimmer effect */}
                {isVip && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: 2,
                    background: "linear-gradient(90deg, transparent, #FF6B00, #FF9500, transparent)",
                    borderRadius: "16px 16px 0 0",
                    animation: "shimmer 2s linear infinite",
                  }} />
                )}
                {isPremium && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: 2,
                    background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
                    borderRadius: "16px 16px 0 0",
                  }} />
                )}

                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #FFD700, #FFA500)",
                    color: "#000",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    padding: "3px 14px",
                    borderRadius: 20,
                    textTransform: "uppercase",
                    boxShadow: "0 4px 12px rgba(255,215,0,0.3)",
                    whiteSpace: "nowrap",
                  }}>
                    {lang === "en" ? "⭐ MOST POPULAR" : "⭐ PLUS POPULAIRE"}
                  </div>
                )}

                {/* Plan name & price */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: plan.color,
                    marginBottom: 6,
                  }}>
                    {tn(plan, "name")}
                  </div>
                  <div style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem", marginBottom: 16 }}>
                    {tn(plan, "desc")}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    {plan.price ? (
                      <>
                        <span style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900,
                          fontSize: "2.4rem",
                          color: "var(--clr-text)",
                          lineHeight: 1,
                        }}>
                          {plan.price}€
                        </span>
                        <span style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem" }}>
                          {lang === "en" ? "/month" : "/mois"}
                        </span>
                      </>
                    ) : (
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 900,
                        fontSize: "2rem",
                        color: "var(--clr-text-muted)",
                        lineHeight: 1,
                      }}>
                        {lang === "en" ? "Free" : "Gratuit"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {plan.features.map((feat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        color: plan.color,
                        fontSize: "0.9rem",
                        flexShrink: 0,
                        marginTop: 1,
                      }}>✓</span>
                      <span style={{ fontSize: "0.875rem", color: "var(--clr-text-dim)", lineHeight: 1.4 }}>
                        {tf(feat)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={isCurrent || plan.key === "free" || isLoadingThis || loadingTier}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 10,
                    border: "none",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: isCurrent || plan.key === "free" ? "default" : "pointer",
                    transition: "all 0.2s",
                    background: isCurrent
                      ? "rgba(255,255,255,0.06)"
                      : isVip
                      ? "linear-gradient(135deg, #FF6B00, #FF9500)"
                      : isPremium
                      ? "linear-gradient(135deg, #FFD700, #FFA500)"
                      : "rgba(255,255,255,0.06)",
                    color: isCurrent
                      ? "var(--clr-text-muted)"
                      : isVip || isPremium
                      ? "#000"
                      : "var(--clr-text-muted)",
                    boxShadow: isVip && !isCurrent
                      ? "0 4px 20px rgba(255,107,0,0.3)"
                      : isPremium && !isCurrent
                      ? "0 4px 20px rgba(255,215,0,0.2)"
                      : "none",
                    opacity: loadingTier ? 0.7 : 1,
                  }}
                >
                  {isLoadingThis
                    ? (lang === "en" ? "Loading…" : "Chargement…")
                    : isCurrent
                    ? (lang === "en" ? "✓ Current plan" : "✓ Plan actuel")
                    : plan.key === "free"
                    ? (lang === "en" ? "Free" : "Gratuit")
                    : (lang === "en" ? "Subscribe" : "S'abonner")}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: "center",
          color: "var(--clr-text-muted)",
          fontSize: "0.8rem",
          maxWidth: 500,
          margin: "0 auto",
        }}>
          {lang === "en"
            ? "Subscriptions are managed via Stripe. You can cancel anytime from your account settings."
            : "Les abonnements sont gérés via Stripe. Vous pouvez annuler à tout moment depuis les paramètres de votre compte."}
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
