import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/authApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Lien invalide. Demandez un nouveau lien de réinitialisation.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Token invalide ou expiré.");
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
          <div className="login-brand__sub">NOUVEAU MOT DE PASSE</div>
        </div>

        <div className="login-divider">RÉINITIALISATION</div>

        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
            <p style={{
              color: "var(--clr-text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}>
              Mot de passe mis à jour
            </p>
            <p style={{ color: "var(--clr-text-dim)", fontSize: "0.88rem", marginBottom: 24 }}>
              Votre mot de passe a été changé avec succès.
            </p>
            <button className="btn-lg" style={{ width: "100%" }} onClick={() => navigate("/login")}>
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="rp-password">Nouveau mot de passe</label>
              <input
                id="rp-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="rp-confirm">Confirmer le mot de passe</label>
              <input
                id="rp-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="login-actions">
              <button type="submit" className="btn-lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Enregistrement…" : "Confirmer"}
              </button>
            </div>

            {error && (
              <div className="login-status" style={{ borderColor: "rgba(239,68,68,0.4)", color: "#f87171" }}>
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
