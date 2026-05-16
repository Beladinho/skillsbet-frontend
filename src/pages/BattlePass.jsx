import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBattlePass,
  claimBattlePassReward,
  createBattlePassCheckout,
  getBattlePassMissions,
  claimBattlePassMission,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

const REWARD_ICONS = {
  tokens: "⚡",
  badge: "🏅",
  avatar: "🎭",
  premium: "⭐",
  vip: "👑",
  xp: "✨",
  chest: "🎁",
};

function rewardIcon(type) {
  return REWARD_ICONS[type?.toLowerCase()] ?? "🎁";
}

export default function BattlePass() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();
  const [data, setData] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingPremium, setBuyingPremium] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [bp, ms] = await Promise.all([getBattlePass(), getBattlePassMissions().catch(() => [])]);
      setData(bp);
      setMissions(Array.isArray(ms) ? ms : ms?.missions ?? []);
    } catch (err) {
      notifyError("Battle Pass", err.message || "Impossible de charger le Battle Pass.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyPremium() {
    setBuyingPremium(true);
    try {
      const result = await createBattlePassCheckout();
      if (!result?.checkout_url) throw new Error("Missing checkout URL");
      window.location.href = result.checkout_url;
    } catch (err) {
      notifyError("Battle Pass", err.message || "Impossible de lancer le paiement.");
    } finally {
      setBuyingPremium(false);
    }
  }

  async function handleClaimReward(rewardId) {
    playClick();
    try {
      await claimBattlePassReward(rewardId);
      await loadAll();
      notifySuccess("Battle Pass", "Récompense réclamée !");
    } catch (err) {
      notifyError("Battle Pass", err.message || "Impossible de réclamer.");
    }
  }

  async function handleClaimMission(missionId) {
    playClick();
    try {
      await claimBattlePassMission(missionId);
      await loadAll();
      notifySuccess("Battle Pass", "Mission complétée !");
    } catch (err) {
      notifyError("Battle Pass", err.message || "Impossible de réclamer la mission.");
    }
  }

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.loadingMsg}>Chargement du Battle Pass…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.root}>
        <div style={styles.loadingMsg}>Données indisponibles.</div>
      </div>
    );
  }

  const xpInLevel = data.xp % 100;
  const xpPercent = Math.min(100, xpInLevel);
  const currentLevel = data.level ?? 1;

  const freeRewards = (data.rewards ?? []).filter((r) => !r.premium_only);
  const premiumRewards = (data.rewards ?? []).filter((r) => r.premium_only);
  const allLevels = [...new Set([...freeRewards, ...premiumRewards].map((r) => r.level))].sort((a, b) => a - b);

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Retour</button>
        <div style={{ flex: 1 }}>
          <div style={styles.titleRow}>
            <h1 style={styles.pageTitle}>BATTLE PASS</h1>
            <span style={{ ...styles.tier, background: data.premium ? "#16a34a" : "#374151" }}>
              {data.premium ? "★ PREMIUM" : "FREE PASS"}
            </span>
          </div>
          <p style={styles.pageSubtitle}>Progressez, débloquez des récompenses exclusives</p>
        </div>
      </div>

      {/* XP Progress */}
      <div style={styles.xpCard}>
        <div style={styles.xpRow}>
          <div style={styles.xpLevel}>
            <span style={styles.xpLevelNum}>{currentLevel}</span>
            <span style={styles.xpLevelLabel}>Niveau</span>
          </div>
          <div style={styles.xpBarWrap}>
            <div style={styles.xpBarBg}>
              <div
                style={{
                  ...styles.xpBarFill,
                  width: `${xpPercent}%`,
                }}
              />
            </div>
            <div style={styles.xpBarLabels}>
              <span style={styles.xpVal}>{data.xp} XP total</span>
              <span style={styles.xpNext}>{xpInLevel}/100 XP vers niveau {currentLevel + 1}</span>
            </div>
          </div>
          <div style={styles.xpLevelNext}>
            <span style={styles.xpLevelNum}>{currentLevel + 1}</span>
            <span style={styles.xpLevelLabel}>Suivant</span>
          </div>
        </div>

        {!data.premium && (
          <button
            style={styles.premiumBtn}
            onClick={() => { playClick(); handleBuyPremium(); }}
            disabled={buyingPremium}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#CC8800"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#d97706"; }}
          >
            {buyingPremium ? "Redirection…" : "⭐ Acheter le Premium Pass — 9,99 €"}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardDiamond}>◆</span>
          <h2 style={styles.cardTitle}>TIMELINE DES RÉCOMPENSES</h2>
        </div>

        <div style={styles.timeline}>
          {allLevels.map((lvl, idx) => {
            const freeR  = freeRewards.find((r) => r.level === lvl);
            const premR  = premiumRewards.find((r) => r.level === lvl);
            const unlocked = currentLevel >= lvl;

            return (
              <div key={lvl} style={styles.timelineRow}>
                {/* Level marker */}
                <div style={styles.levelMarkerWrap}>
                  <div style={{
                    ...styles.levelMarker,
                    background: unlocked ? "#FF6B00" : "#1A1A1A",
                    borderColor: unlocked ? "#FF6B00" : "#282828",
                    boxShadow: unlocked ? "0 0 12px rgba(255,107,0,0.4)" : "none",
                  }}>
                    <span style={{ ...styles.levelNum, color: unlocked ? "#fff" : "#555" }}>{lvl}</span>
                  </div>
                  {idx < allLevels.length - 1 && (
                    <div style={{ ...styles.timelineLine, background: unlocked ? "#FF6B00" : "#1A1A1A" }} />
                  )}
                </div>

                {/* Reward boxes */}
                <div style={styles.rewardBoxes}>
                  {freeR && (
                    <RewardBox
                      reward={freeR}
                      isPremium={false}
                      unlocked={unlocked}
                      userHasPremium={data.premium}
                      onClaim={handleClaimReward}
                    />
                  )}
                  {premR && (
                    <RewardBox
                      reward={premR}
                      isPremium={true}
                      unlocked={unlocked}
                      userHasPremium={data.premium}
                      onClaim={handleClaimReward}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missions */}
      {missions.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardDiamond}>◆</span>
            <h2 style={styles.cardTitle}>MISSIONS DE LA SAISON</h2>
          </div>

          <div style={styles.missionList}>
            {missions.map((m) => (
              <div key={m.id} style={styles.missionRow}>
                <div style={styles.missionInfo}>
                  <span style={styles.missionName}>{m.name || m.description || `Mission #${m.id}`}</span>
                  <span style={styles.missionReward}>+{m.xp_reward ?? m.reward ?? 0} XP</span>
                </div>
                {m.claimed ? (
                  <span style={styles.claimedBadge}>✓ Fait</span>
                ) : m.completed || m.claimable ? (
                  <button style={styles.claimBtn} onClick={() => handleClaimMission(m.id)}>
                    Réclamer
                  </button>
                ) : (
                  <span style={styles.lockedText}>En cours…</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes xpGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(255,107,0,0.3); }
          50%       { box-shadow: 0 0 18px rgba(255,107,0,0.6); }
        }
      `}</style>
    </div>
  );
}

function RewardBox({ reward, isPremium, unlocked, userHasPremium, onClaim }) {
  const accessible = unlocked && (!isPremium || userHasPremium);
  const claimable  = accessible && reward.claimable && !reward.claimed;

  return (
    <div style={{
      ...styles.rewardBox,
      border: `1px solid ${isPremium ? (userHasPremium ? "#d97706" : "#2a2000") : "#282828"}`,
      background: isPremium ? (userHasPremium ? "rgba(217,119,6,0.06)" : "rgba(0,0,0,0.4)") : "#0A0A0A",
      opacity: unlocked ? 1 : 0.5,
    }}>
      <div style={styles.rewardIcon}>{rewardIcon(reward.type)}</div>
      <div style={styles.rewardType}>{reward.type}</div>
      <div style={styles.rewardValue}>{reward.value}</div>
      {isPremium && (
        <div style={styles.premiumTag}>Premium</div>
      )}
      {reward.claimed ? (
        <div style={styles.claimedTag}>✓</div>
      ) : claimable ? (
        <button style={styles.miniClaimBtn} onClick={() => onClaim(reward.id)}>
          Claim
        </button>
      ) : !accessible && isPremium ? (
        <div style={styles.lockTag}>🔒</div>
      ) : null}
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
    marginBottom: 20,
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
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  pageTitle: {
    fontSize: "clamp(1.4rem,4vw,2rem)",
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#FFFFFF",
    textTransform: "uppercase",
    margin: 0,
  },
  tier: {
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  pageSubtitle: {
    color: "#666666",
    fontSize: "0.9rem",
    marginTop: 4,
  },
  xpCard: {
    background: "#111111",
    border: "1px solid #282828",
    borderLeft: "3px solid #FF6B00",
    borderRadius: 8,
    padding: "20px",
    marginBottom: 16,
    animation: "fadeInUp 0.4s ease 0.05s both",
  },
  xpRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  xpLevel: {
    textAlign: "center",
    minWidth: 52,
  },
  xpLevelNum: {
    display: "block",
    fontSize: "2rem",
    fontWeight: 900,
    color: "#FF6B00",
    lineHeight: 1,
  },
  xpLevelLabel: {
    display: "block",
    color: "#555",
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: 2,
  },
  xpBarWrap: {
    flex: 1,
  },
  xpBarBg: {
    height: 14,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
    border: "1px solid #282828",
  },
  xpBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #FF6B00, #FF8C40)",
    borderRadius: 999,
    transition: "width 0.8s ease",
    animation: "xpGlow 2s ease-in-out infinite",
  },
  xpBarLabels: {
    display: "flex",
    justifyContent: "space-between",
  },
  xpVal: {
    color: "#FF6B00",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  xpNext: {
    color: "#666",
    fontSize: "0.72rem",
  },
  xpLevelNext: {
    textAlign: "center",
    minWidth: 52,
    opacity: 0.4,
  },
  premiumBtn: {
    background: "#d97706",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    width: "100%",
    fontFamily: "inherit",
    transition: "background 0.2s",
    boxShadow: "0 4px 20px rgba(217,119,6,0.3)",
  },
  card: {
    background: "#111111",
    border: "1px solid #282828",
    borderLeft: "3px solid #FF6B00",
    borderRadius: 8,
    padding: "22px 20px",
    marginBottom: 16,
    animation: "fadeInUp 0.4s ease 0.1s both",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
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
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  timelineRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
  },
  levelMarkerWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 44,
  },
  levelMarker: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    flexShrink: 0,
    zIndex: 1,
  },
  levelNum: {
    fontSize: "0.85rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    transition: "background 0.3s ease",
  },
  rewardBoxes: {
    display: "flex",
    gap: 8,
    padding: "8px 0 16px",
    flexWrap: "wrap",
    flex: 1,
  },
  rewardBox: {
    borderRadius: 8,
    padding: "10px 14px",
    minWidth: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    position: "relative",
    transition: "opacity 0.2s",
  },
  rewardIcon: {
    fontSize: "1.5rem",
  },
  rewardType: {
    color: "#888",
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  rewardValue: {
    color: "#FFFFFF",
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  premiumTag: {
    background: "rgba(217,119,6,0.2)",
    color: "#d97706",
    fontSize: "0.55rem",
    padding: "1px 5px",
    borderRadius: 999,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },
  claimedTag: {
    color: "#22c55e",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  lockTag: {
    fontSize: "0.8rem",
    opacity: 0.5,
  },
  miniClaimBtn: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 2,
  },
  missionList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  missionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #141414",
    gap: 12,
  },
  missionInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  missionName: {
    color: "#DDDDDD",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  missionReward: {
    color: "#FF6B00",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  claimedBadge: {
    color: "#22c55e",
    fontSize: "0.8rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  claimBtn: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    padding: "7px 14px",
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  lockedText: {
    color: "#444444",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
  },
};
