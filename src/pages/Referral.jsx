import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyReferralData } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

const MILESTONES = [
  { count: 5,  label: "Badge Recruteur",     icon: "🏅", desc: "Badge exclusif 'Recruteur' débloqué" },
  { count: 10, label: "Premium 1 mois",      icon: "⭐", desc: "1 mois de Premium offert" },
  { count: 25, label: "Statut VIP",          icon: "👑", desc: "Accès VIP à vie débloqué" },
];

export default function Referral() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getMyReferralData();
      setData(res);
    } catch (err) {
      notifyError("Parrainage", err.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }

  const refLink = data ? `https://skillsbets.net/join?ref=${data.my_code}` : "";

  async function handleCopyLink() {
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      notifySuccess("Parrainage", "Lien copié !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notifyError("Parrainage", "Impossible de copier.");
    }
  }

  async function handleCopyCode() {
    if (!data?.my_code) return;
    try {
      await navigator.clipboard.writeText(data.my_code);
      notifySuccess("Parrainage", `Code "${data.my_code}" copié !`);
    } catch {
      notifyError("Parrainage", "Impossible de copier.");
    }
  }

  const total = data?.total_referrals ?? 0;
  const nextMilestone = MILESTONES.find((m) => m.count > total);
  const toNext = nextMilestone ? nextMilestone.count - total : 0;

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.loadingMsg}>Chargement…</div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Retour</button>
        <div>
          <h1 style={styles.pageTitle}>PROGRAMME DE PARRAINAGE</h1>
          <p style={styles.pageSubtitle}>Invitez vos amis et gagnez des récompenses exclusives</p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Stats row */}
        <div style={styles.statsRow}>
          <StatCard label="Filleuls" value={data?.total_referrals ?? 0} color="#FF6B00" />
          <StatCard label="Jetons gagnés" value={`${data?.total_earned ?? 0}`} suffix=" ⚡" color="#f59e0b" />
          <StatCard label="Prochain bonus" value={nextMilestone ? `${toNext} restants` : "Complété !"} color="#22c55e" />
        </div>

        {/* Referral link card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardDiamond}>◆</span>
            <h2 style={styles.cardTitle}>VOTRE LIEN DE PARRAINAGE</h2>
          </div>

          <p style={styles.cardDesc}>
            Partagez ce lien. Votre ami reçoit un bonus à l'inscription, et vous recevez{" "}
            <strong style={{ color: "#FF6B00" }}>50 jetons</strong> à sa première connexion.
          </p>

          <div style={styles.linkRow}>
            <div style={styles.linkBox}>
              <span style={styles.linkText}>{refLink || "Chargement…"}</span>
            </div>
            <button
              style={{ ...styles.copyBtn, background: copied ? "#22c55e" : "#FF6B00" }}
              onClick={handleCopyLink}
            >
              {copied ? "✓ Copié" : "Copier"}
            </button>
          </div>

          <div style={styles.codeRow}>
            <span style={styles.codeLabel}>Code uniquement :</span>
            <span style={styles.codeValue}>{data?.my_code ?? "—"}</span>
            <button style={styles.codeCopyBtn} onClick={handleCopyCode}>Copier</button>
          </div>
        </div>

        {/* Milestones */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardDiamond}>◆</span>
            <h2 style={styles.cardTitle}>RÉCOMPENSES DE PROGRESSION</h2>
          </div>

          <div style={styles.milestoneList}>
            {MILESTONES.map((m) => {
              const reached = total >= m.count;
              const progress = Math.min(100, Math.round((total / m.count) * 100));
              return (
                <div key={m.count} style={{ ...styles.milestoneItem, border: `1px solid ${reached ? "#22c55e" : "#282828"}` }}>
                  <div style={styles.milestoneLeft}>
                    <span style={styles.milestoneIcon}>{m.icon}</span>
                    <div>
                      <div style={{ ...styles.milestoneName, color: reached ? "#22c55e" : "#FFFFFF" }}>
                        {m.label}
                        {reached && <span style={styles.reachedBadge}>✓ DÉBLOQUÉ</span>}
                      </div>
                      <div style={styles.milestoneDesc}>{m.desc}</div>
                    </div>
                  </div>
                  <div style={styles.milestoneRight}>
                    <div style={styles.milestoneTarget}>{m.count} filleuls</div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${progress}%`,
                          background: reached ? "#22c55e" : "#FF6B00",
                        }}
                      />
                    </div>
                    <div style={styles.progressLabel}>{Math.min(total, m.count)}/{m.count}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardDiamond}>◆</span>
            <h2 style={styles.cardTitle}>HISTORIQUE DES PARRAINAGES</h2>
          </div>

          {!data?.rows?.length ? (
            <p style={styles.emptyText}>Aucun filleul pour l'instant. Partagez votre lien !</p>
          ) : (
            <div style={styles.historyList}>
              <div style={styles.historyHeader}>
                <span>Filleul</span>
                <span>Date</span>
                <span>Bonus reçu</span>
              </div>
              {data.rows.map((row) => (
                <div key={row.id} style={styles.historyRow}>
                  <span style={styles.historyEmail}>{row.referred_player_id}</span>
                  <span style={styles.historyDate}>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <span style={styles.historyBonus}>+{row.referrer_reward} ⚡</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, suffix = "", color }) {
  return (
    <div style={{ ...styles.statCard, borderTopColor: color }}>
      <div style={{ ...styles.statValue, color }}>{value}{suffix}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0A0A0A",
    padding: "24px 16px 48px",
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    maxWidth: 900,
    margin: "0 auto",
  },
  loadingMsg: {
    color: "#666",
    textAlign: "center",
    padding: 60,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 28,
    animation: "fadeInUp 0.4s ease both",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #282828",
    color: "#AAAAAA",
    borderRadius: 6,
    padding: "8px 14px",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    marginTop: 4,
    transition: "all 0.15s",
  },
  pageTitle: {
    fontSize: "clamp(1.4rem,4vw,2rem)",
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#FFFFFF",
    textTransform: "uppercase",
    margin: 0,
  },
  pageSubtitle: {
    color: "#666666",
    fontSize: "0.9rem",
    marginTop: 4,
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    animation: "fadeInUp 0.4s ease 0.05s both",
  },
  statCard: {
    background: "#111111",
    border: "1px solid #282828",
    borderTop: "3px solid",
    borderRadius: 8,
    padding: "18px 16px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 6,
  },
  statLabel: {
    color: "#666666",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  card: {
    background: "#111111",
    border: "1px solid #282828",
    borderLeft: "3px solid #FF6B00",
    borderRadius: 8,
    padding: "22px 20px",
    animation: "fadeInUp 0.4s ease 0.1s both",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardDiamond: {
    color: "#FF6B00",
    fontSize: "0.7rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    margin: 0,
  },
  cardDesc: {
    color: "#888888",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    marginBottom: 16,
  },
  linkRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  linkBox: {
    flex: 1,
    background: "#1A1A1A",
    border: "1px solid #383838",
    borderRadius: 6,
    padding: "10px 12px",
    overflow: "hidden",
  },
  linkText: {
    color: "#FF6B00",
    fontSize: "0.85rem",
    wordBreak: "break-all",
    fontFamily: "monospace",
  },
  copyBtn: {
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 18px",
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  codeRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#0A0A0A",
    border: "1px solid #282828",
    borderRadius: 6,
    padding: "8px 12px",
  },
  codeLabel: {
    color: "#666666",
    fontSize: "0.8rem",
  },
  codeValue: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.1em",
    fontFamily: "monospace",
  },
  codeCopyBtn: {
    background: "transparent",
    border: "1px solid #383838",
    color: "#AAAAAA",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: "0.75rem",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
  },
  milestoneList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  milestoneItem: {
    background: "#0A0A0A",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    transition: "border-color 0.2s",
  },
  milestoneLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  milestoneIcon: {
    fontSize: "1.6rem",
  },
  milestoneName: {
    fontWeight: 700,
    fontSize: "0.95rem",
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  reachedBadge: {
    background: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    fontSize: "0.65rem",
    padding: "2px 6px",
    borderRadius: 999,
    fontWeight: 700,
    letterSpacing: "0.06em",
  },
  milestoneDesc: {
    color: "#666666",
    fontSize: "0.78rem",
    marginTop: 2,
  },
  milestoneRight: {
    textAlign: "right",
    minWidth: 120,
  },
  milestoneTarget: {
    color: "#AAAAAA",
    fontSize: "0.78rem",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  progressBar: {
    height: 6,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.6s ease",
  },
  progressLabel: {
    color: "#666666",
    fontSize: "0.7rem",
  },
  emptyText: {
    color: "#555555",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "20px 0",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    fontSize: "0.88rem",
  },
  historyHeader: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 12,
    padding: "8px 12px",
    color: "#555555",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #1A1A1A",
    marginBottom: 4,
  },
  historyRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 12,
    padding: "10px 12px",
    borderBottom: "1px solid #141414",
    alignItems: "center",
  },
  historyEmail: {
    color: "#CCCCCC",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  historyDate: {
    color: "#666666",
    whiteSpace: "nowrap",
    fontSize: "0.82rem",
  },
  historyBonus: {
    color: "#f59e0b",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};
