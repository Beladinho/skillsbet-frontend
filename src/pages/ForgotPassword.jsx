import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await forgotPassword(trimmed);
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand__title">
            SKILLS<span>BET</span>
          </div>
          <div className="login-brand__sub">MOT DE PASSE OUBLIÉ</div>
        </div>

        <div className="login-divider">RÉINITIALISATION</div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📧</div>
            <p style={{
              color: "var(--clr-text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}>
              Email envoyé
            </p>
            <p style={{ color: "var(--clr-text-dim)", fontSize: "0.88rem", marginBottom: 24 }}>
              Si un compte existe pour <strong style={{ color: "var(--clr-text)" }}>{email}</strong>,
              vous recevrez un lien de réinitialisation sous peu. Vérifiez vos spams.
            </p>
            <button className="btn-ghost btn-lg" style={{ width: "100%" }} onClick={() => navigate("/login")}>
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="fp-email">Adresse email</label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>

            <div className="login-actions" style={{ flexDirection: "column" }}>
              <button type="submit" className="btn-lg" disabled={loading}>
                {loading ? "Envoi…" : "Envoyer le lien"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate("/login")}
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                Retour
              </button>
            </div>

            {error && <div className="login-status" style={{ borderColor: "rgba(239,68,68,0.4)", color: "#f87171" }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
