import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/authApi";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: "center" }}>
        <div className="login-brand">
          <div className="login-brand__title">
            SKILLS<span>BET</span>
          </div>
          <div className="login-brand__sub">VÉRIFICATION EMAIL</div>
        </div>

        {status === "loading" && (
          <div style={{ padding: "24px 0", color: "var(--clr-text-dim)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            <p style={{ margin: 0 }}>Vérification en cours…</p>
          </div>
        )}

        {status === "success" && (
          <div style={{ padding: "24px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
            <p style={{
              color: "var(--clr-text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}>
              Email vérifié avec succès
            </p>
            <p style={{ color: "var(--clr-text-dim)", fontSize: "0.9rem", marginBottom: 24 }}>
              Votre compte est maintenant actif.
            </p>
            <button className="btn-lg" style={{ width: "100%" }} onClick={() => navigate("/login")}>
              Se connecter
            </button>
          </div>
        )}

        {status === "error" && (
          <div style={{ padding: "24px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>❌</div>
            <p style={{
              color: "var(--clr-text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}>
              Lien invalide ou expiré
            </p>
            <p style={{ color: "var(--clr-text-dim)", fontSize: "0.9rem", marginBottom: 24 }}>
              Ce lien de vérification est invalide ou a expiré. Inscrivez-vous à nouveau ou contactez le support.
            </p>
            <button className="btn-lg" style={{ width: "100%" }} onClick={() => navigate("/login")}>
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
