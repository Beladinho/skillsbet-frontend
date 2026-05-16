import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  async function handleRegister(e) {
    e?.preventDefault();
    if (!email || !password) {
      setStatus("Veuillez renseigner votre email et mot de passe.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const data = await registerUser(email, password, referralCode || null);
      setStatus(data.player_id ? "Compte créé ! Vérifiez votre email." : "Compte créé !");
    } catch (err) {
      setStatus(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoWhite}>SKILLS</span>
          <span style={styles.logoOrange}>BET</span>
        </div>

        <h2 style={styles.title}>CRÉER UN COMPTE</h2>

        {referralCode && (
          <div style={styles.refBanner}>
            🎁 Vous avez été parrainé — code <strong>{referralCode}</strong> appliqué automatiquement
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            placeholder="Min. 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label}>Code de parrainage <span style={styles.optional}>(optionnel)</span></label>
          <input
            placeholder="Ex : ABC123"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Création…" : "S'inscrire"}
          </button>
        </form>

        {status && (
          <p style={{ ...styles.status, color: status.startsWith("Erreur") || status.startsWith("Veuillez") ? "#ef4444" : "#22c55e" }}>
            {status}
          </p>
        )}

        <p style={styles.loginLink}>
          Déjà un compte ?{" "}
          <Link to="/login" style={{ color: "#FF6B00", fontWeight: 700 }}>Se connecter</Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input:focus { outline: none; border-color: #FF6B00 !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.12); }
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
    padding: 16,
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
  },
  card: {
    background: "#111111",
    border: "1px solid #282828",
    borderRadius: 12,
    padding: "36px 32px",
    maxWidth: 400,
    width: "100%",
    animation: "fadeInUp 0.45s ease both",
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: 20,
  },
  logoWhite: {
    fontSize: "1.8rem",
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  logoOrange: {
    fontSize: "1.8rem",
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "#FF6B00",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    textAlign: "center",
    margin: "0 0 20px",
  },
  refBanner: {
    background: "rgba(255,107,0,0.1)",
    border: "1px solid rgba(255,107,0,0.3)",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#FF8C40",
    fontSize: "0.85rem",
    marginBottom: 16,
    lineHeight: 1.4,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    color: "#AAAAAA",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 2,
  },
  optional: {
    color: "#555555",
    fontWeight: 400,
    textTransform: "none",
    letterSpacing: 0,
    fontSize: "0.72rem",
  },
  input: {
    background: "#1A1A1A",
    border: "1px solid #383838",
    borderRadius: 6,
    color: "#FFFFFF",
    padding: "10px 12px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  btn: {
    marginTop: 16,
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "12px",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  status: {
    marginTop: 12,
    fontSize: "0.88rem",
    textAlign: "center",
  },
  loginLink: {
    color: "#666666",
    fontSize: "0.85rem",
    textAlign: "center",
    marginTop: 16,
  },
};
