import { useEffect, useState } from "react";
import {
  claimBattlePassReward,
  createBattlePassCheckout,
  getBattlePass,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function BattlePassPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getBattlePass();
      setData(res);
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass", error.message || "Impossible de charger le Battle Pass.");
    }
  }

  async function handleBuyPremium() {
    try {
      const result = await createBattlePassCheckout();

      if (!result?.checkout_url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = result.checkout_url;
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass", error.message || "Impossible de lancer le paiement premium.");
    }
  }

  async function handleClaimReward(rewardId) {
    try {
      await claimBattlePassReward(rewardId);
      await load();
      notifySuccess("Battle Pass", "Reward claimed successfully.");
    } catch (error) {
      console.error(error);
      notifyError("Battle Pass", error.message || "Impossible de claim la reward.");
    }
  }

  if (!data) {
    return null;
  }

  const progressPercent = Math.min(100, Math.round((data.xp % 100) * 100 / 100));

  return (
    <div className="card" style={{ marginTop: 20, padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>Battle Pass</h3>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background: data.premium ? "#16a34a" : "#475569",
            color: "white",
            fontWeight: 700,
          }}
        >
          {data.premium ? "Premium Active" : "Free Pass"}
        </div>
      </div>

      <p style={{ marginTop: "12px" }}>
        <strong>Level :</strong> {data.level}
      </p>

      <p>
        <strong>XP :</strong> {data.xp}
      </p>

      <div
        style={{
          width: "100%",
          height: "12px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #3b82f6, #22c55e)",
          }}
        />
      </div>

      {!data.premium && (
        <button
          onClick={() => {
            playClick();
            handleBuyPremium();
          }}
          style={{ marginBottom: "16px" }}
        >
          Buy Premium Pass (€9.99)
        </button>
      )}

      <div>
        {data.rewards.map((r) => (
          <div key={r.id} className="simple-list-item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>Level {r.level}</strong> — {r.type} {r.value}{" "}
                {r.premium_only ? "(Premium)" : "(Free)"}
              </div>

              <div>
                {r.claimed ? (
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>Claimed</span>
                ) : r.claimable ? (
                  <button
                    onClick={() => {
                      playClick();
                      handleClaimReward(r.id);
                    }}
                  >
                    Claim
                  </button>
                ) : (
                  <span style={{ opacity: 0.7 }}>Locked</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}