import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useNotifications } from "../context/NotificationContext";
import {
  getAdminReports,
  adminIgnoreReport,
  adminWarnReport,
  adminSuspendReport,
  adminBanReport,
} from "../api/skillsbetApi";

const STATUS_LABELS = {
  en_attente: { label: "En attente", color: "#f59e0b" },
  traité: { label: "Traité", color: "#22c55e" },
  ignoré: { label: "Ignoré", color: "#64748b" },
};

export default function AdminReportsPanel() {
  const { role } = useContext(PlayerContext);
  const { notifySuccess, notifyError } = useNotifications();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("en_attente");
  const [suspendDays, setSuspendDays] = useState({});

  async function load() {
    try {
      setLoading(true);
      const data = await getAdminReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      notifyError("Signalements", e.message || "Impossible de charger les signalements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role === "admin" && open) load();
  }, [role, open]);

  async function act(fn, id, label) {
    try {
      const res = await fn(id);
      notifySuccess("Signalements", res.detail || label);
      await load();
    } catch (e) {
      notifyError("Signalements", e.message || "Erreur.");
    }
  }

  if (role !== "admin") return null;

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);

  const btnStyle = (color) => ({
    padding: "4px 10px",
    fontSize: "0.75rem",
    fontWeight: 700,
    border: `1px solid ${color}40`,
    borderRadius: 6,
    background: `${color}15`,
    color,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    transition: "opacity 0.12s",
  });

  return (
    <div className="section-card" style={{ marginTop: 20 }}>
      <button
        className="btn-ghost"
        style={{ width: "100%", textAlign: "left", fontWeight: 800 }}
        onClick={() => setOpen((o) => !o)}
      >
        🚩 Signalements {open ? "▲" : "▼"}
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[["en_attente", "En attente"], ["traité", "Traités"], ["ignoré", "Ignorés"], ["all", "Tous"]].map(
              ([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: `1px solid ${filter === val ? "var(--clr-orange)" : "rgba(255,255,255,0.1)"}`,
                    background: filter === val ? "rgba(255,107,0,0.12)" : "rgba(255,255,255,0.04)",
                    color: filter === val ? "var(--clr-orange)" : "var(--clr-text-dim)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {lbl}
                </button>
              )
            )}
            <button className="btn-ghost btn-sm" onClick={load} disabled={loading} style={{ marginLeft: "auto" }}>
              {loading ? "…" : "↺ Actualiser"}
            </button>
          </div>

          {filtered.length === 0 && (
            <p style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem" }}>Aucun signalement.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((r) => {
              const st = STATUS_LABELS[r.status] || { label: r.status, color: "#94a3b8" };
              const days = suspendDays[r.id] ?? 7;
              return (
                <div
                  key={r.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: `${st.color}20`,
                            color: st.color,
                            fontFamily: "var(--font-heading)",
                            textTransform: "uppercase",
                          }}
                        >
                          {st.label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: "rgba(255,107,0,0.1)",
                            color: "var(--clr-orange)",
                            fontFamily: "var(--font-heading)",
                            textTransform: "uppercase",
                          }}
                        >
                          {r.reason}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--clr-text-dim)" }}>
                          #{r.id} · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.85rem", marginBottom: 4 }}>
                        <span style={{ color: "var(--clr-text-dim)" }}>Signaleur : </span>
                        <strong>{r.reporter_id}</strong>
                      </div>
                      <div style={{ fontSize: "0.85rem", marginBottom: r.details ? 6 : 0 }}>
                        <span style={{ color: "var(--clr-text-dim)" }}>Signalé : </span>
                        <strong style={{ color: "#f87171" }}>{r.reported_id}</strong>
                      </div>
                      {r.details && (
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "0.82rem",
                            color: "var(--clr-text-dim)",
                            fontStyle: "italic",
                            borderLeft: "2px solid rgba(255,255,255,0.1)",
                            paddingLeft: 8,
                          }}
                        >
                          {r.details}
                        </p>
                      )}
                      {r.handled_by && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "var(--clr-text-dim)" }}>
                          Traité par {r.handled_by} · {new Date(r.handled_at).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>

                    {r.status === "en_attente" && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <button style={btnStyle("#64748b")} onClick={() => act(adminIgnoreReport, r.id, "Ignoré.")}>
                          Ignorer
                        </button>
                        <button style={btnStyle("#f59e0b")} onClick={() => act(adminWarnReport, r.id, "Averti.")}>
                          Avertir
                        </button>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <input
                            type="number"
                            min={1}
                            max={90}
                            value={days}
                            onChange={(e) =>
                              setSuspendDays((prev) => ({ ...prev, [r.id]: Number(e.target.value) }))
                            }
                            style={{
                              width: 44,
                              padding: "3px 6px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 6,
                              color: "#f8fafc",
                              fontSize: "0.78rem",
                              textAlign: "center",
                            }}
                          />
                          <button
                            style={btnStyle("#f97316")}
                            onClick={() => act((id) => adminSuspendReport(id, days), r.id, `Suspendu ${days}j.`)}
                          >
                            Suspendre
                          </button>
                        </div>
                        <button style={btnStyle("#ef4444")} onClick={() => act(adminBanReport, r.id, "Banni.")}>
                          Bannir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
