import { useState } from "react";
import { redeemPromoCode } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function PromoCodePanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();
  const [code, setCode] = useState("");

  async function handleRedeem() {
    try {
      const result = await redeemPromoCode(code);
      notifySuccess(
        "Promo Code",
        `Code ${result.code} redeemed. Reward: ${result.reward_amount} tokens.`
      );
      setCode("");
    } catch (error) {
      console.error(error);
      notifyError("Promo Code", error.message || "Impossible to redeem promo code.");
    }
  }

  return (
    <div className="card" style={{ marginTop: 20, padding: 16 }}>
      <h3>Promo Code</h3>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
        />

        <button
          onClick={() => {
            playClick();
            handleRedeem();
          }}
        >
          Redeem
        </button>
      </div>
    </div>
  );
}