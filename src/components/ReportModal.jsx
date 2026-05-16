import { useState } from "react";
import { submitReport } from "../api/skillsbetApi";

const REASONS = [
  "Triche",
  "Langage abusif",
  "Spam",
  "Comportement toxique",
  "Autre",
];

export default function ReportModal({ targetId, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!reason) {
      setError("Choisissez une raison.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await submitReport({ reported_id: targetId, reason, details: details || undefined });
      setDone(true);
    } catch (e) {
      setError(e.message || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--clr-surface, #0f172a)",
          border: "1px solid rgba(255,107,0,0.3)",
          borderRadius: "var(--radius-lg, 12px)",
          padding: "28px 24px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>✅</div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
                color: "#22c55e",
                margin: "0 0 8px",
              }}
            >
              Signalement envoyé
            </h3>
            <p style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem", margin: "0 0 20px" }}>
              Notre équipe examinera votre signalement dans les plus brefs délais.
            </p>
            <button className="btn-primary btn-sm" onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                  textTransform: "uppercase",
                  fontSize: "1rem",
                  color: "#f87171",
                }}
              >
                🚩 Signaler {targetId}
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--clr-text-dim)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  padding: "2px 6px",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--clr-text-dim)", margin: "0 0 16px" }}>
              Raison du signalement
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {REASONS.map((r) => (
                <label
                  key={r}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${reason === r ? "rgba(255,107,0,0.5)" : "rgba(255,255,255,0.08)"}`,
                    background: reason === r ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ accentColor: "var(--clr-orange)" }}
                  />
                  <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{r}</span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 300))}
              placeholder="Détails supplémentaires (optionnel)…"
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.84rem",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                marginBottom: 6,
              }}
            />
            <p style={{ margin: "0 0 16px", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
              {details.length}/300
            </p>

            {error && (
              <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#f87171", fontWeight: 600 }}>
                ⚠ {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-ghost btn-sm" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                style={{
                  padding: "8px 18px",
                  background: loading || !reason ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.15)",
                  border: "1px solid rgba(248,113,113,0.5)",
                  borderRadius: 8,
                  color: loading || !reason ? "#888" : "#f87171",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: loading || !reason ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-heading)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  transition: "opacity 0.15s",
                  opacity: loading || !reason ? 0.6 : 1,
                }}
              >
                {loading ? "Envoi…" : "Envoyer le signalement"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
