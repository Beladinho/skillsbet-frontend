import { useEffect, useState } from "react";
import { useCreator } from "../context/CreatorContext";
import { useNotifications } from "../context/NotificationContext";
import CreatorGameSandbox from "./CreatorGameSandbox";
import SectionCard from "./SectionCard";

const STATUS_CFG = {
  pending:  { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)"  },
  approved: { label: "Approuvé",   color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   },
  rejected: { label: "Rejeté",     color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   },
};

export default function AdminCreatorPanel() {
  const { adminGames, loadAdminGames, handleApprove, handleReject } = useCreator();
  const { notifySuccess } = useNotifications();

  const [filter, setFilter]           = useState("pending");
  const [previewId, setPreviewId]     = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { loadAdminGames(); }, [loadAdminGames]);

  const counts = {
    pending:  adminGames.filter((g) => g.status === "pending").length,
    approved: adminGames.filter((g) => g.status === "approved").length,
    rejected: adminGames.filter((g) => g.status === "rejected").length,
    all:      adminGames.length,
  };

  const filtered = filter === "all" ? adminGames : adminGames.filter((g) => g.status === filter);

  function onApprove(id) {
    handleApprove(id);
    notifySuccess("Admin Créateur", "Jeu approuvé — 7 jours gratuits accordés.");
  }

  function confirmReject() {
    if (!rejectModal) return;
    handleReject(rejectModal, rejectReason.trim() || "Non conforme aux règles.");
    notifySuccess("Admin Créateur", "Jeu rejeté.");
    setRejectModal(null);
    setRejectReason("");
  }

  return (
    <SectionCard title="Jeux Créateurs — Modération">
      <div className="inline-button-group" style={{ marginBottom: "20px" }}>
        {[
          { key: "pending",  label: `En attente (${counts.pending})`  },
          { key: "approved", label: `Approuvés (${counts.approved})`  },
          { key: "rejected", label: `Rejetés (${counts.rejected})`    },
          { key: "all",      label: `Tous (${counts.all})`            },
        ].map((tab) => (
          <button
            key={tab.key}
            className={filter === tab.key ? "" : "btn-ghost"}
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px", color: "var(--clr-text-muted)" }}>
          Aucune soumission dans cette catégorie.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((game) => {
            const cfg        = STATUS_CFG[game.status] || STATUS_CFG.pending;
            const isPreview  = previewId === game.id;
            return (
              <div key={game.id} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--clr-border)",
                borderLeft: `3px solid ${cfg.color}`,
                borderRadius: "10px",
                padding: "18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{game.name}</h3>
                      <span style={{ padding: "3px 10px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "20px", fontSize: "0.68rem", fontWeight: 800, color: cfg.color, textTransform: "uppercase" }}>
                        {cfg.label}
                      </span>
                    </div>
                    {game.description && (
                      <p style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", marginBottom: "8px" }}>{game.description}</p>
                    )}
                    <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)" }}>
                      Créateur : <strong style={{ color: "var(--clr-text)" }}>{game.creator_id}</strong>
                      {" · "}Soumis le {new Date(game.submitted_at).toLocaleDateString("fr-FR")}
                      {" · "}Catégorie : {game.category}
                    </div>
                    {game.rejection_reason && (
                      <p style={{ fontSize: "0.74rem", color: "#ef4444", marginTop: "8px", padding: "6px 10px", background: "rgba(239,68,68,0.05)", borderRadius: "6px" }}>
                        Raison : {game.rejection_reason}
                      </p>
                    )}
                  </div>

                  {game.screenshot && (
                    <img src={game.screenshot} alt={game.name} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--clr-border)", flexShrink: 0 }} />
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                  <button
                    className="btn-ghost"
                    style={{ padding: "7px 16px", fontSize: "0.74rem", color: "#00b4d8", borderColor: "rgba(0,180,216,0.4)" }}
                    onClick={() => setPreviewId(isPreview ? null : game.id)}
                  >
                    {isPreview ? "Fermer aperçu" : "Prévisualiser"}
                  </button>

                  {game.status !== "approved" && (
                    <button
                      style={{ padding: "7px 16px", fontSize: "0.74rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e" }}
                      onClick={() => onApprove(game.id)}
                    >
                      ✓ Approuver
                    </button>
                  )}

                  {game.status !== "rejected" && (
                    <button
                      className="btn-ghost"
                      style={{ padding: "7px 16px", fontSize: "0.74rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.4)" }}
                      onClick={() => { setRejectModal(game.id); setRejectReason(""); }}
                    >
                      ✗ Rejeter
                    </button>
                  )}
                </div>

                {/* Inline preview */}
                {isPreview && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-muted)", marginBottom: "8px" }}>
                      Prévisualisation — Exécution sandboxée
                    </div>
                    <CreatorGameSandbox code={game.code} height="420px" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
          }}
        >
          <div style={{
            background: "var(--clr-surface-1)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "12px", padding: "28px 32px", width: "100%", maxWidth: "440px",
            boxShadow: "0 0 40px rgba(239,68,68,0.1)",
          }}>
            <h3 style={{ marginBottom: "16px", color: "#ef4444", fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "3px" }}>
              Rejeter le jeu
            </h3>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-muted)", marginBottom: "8px" }}>
              Raison du rejet
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Expliquez pourquoi ce jeu est rejeté…"
              rows={4}
              style={{ width: "100%", marginBottom: "20px", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={confirmReject}
                style={{ flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444" }}
              >
                Confirmer le rejet
              </button>
              <button className="btn-ghost" style={{ padding: "12px 20px" }} onClick={() => setRejectModal(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
