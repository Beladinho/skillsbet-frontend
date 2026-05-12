import { useEffect, useState } from "react";
import { getMyTier } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";

function getBenefits(tier) {
  if (tier === "platinum") {
    return {
      depositBonus: "10%",
      rakeDiscount: "50%",
      premiumAccess: "Yes",
    };
  }

  if (tier === "gold") {
    return {
      depositBonus: "5%",
      rakeDiscount: "25%",
      premiumAccess: "Yes",
    };
  }

  if (tier === "silver") {
    return {
      depositBonus: "2%",
      rakeDiscount: "10%",
      premiumAccess: "No",
    };
  }

  return {
    depositBonus: "0%",
    rakeDiscount: "0%",
    premiumAccess: "No",
  };
}

export default function VipBenefitsPanel() {
  const { notifyError } = useNotifications();
  const [tier, setTier] = useState("bronze");

  useEffect(() => {
    loadTier();
  }, []);

  async function loadTier() {
    try {
      const data = await getMyTier();
      setTier(data?.tier || "bronze");
    } catch (error) {
      console.error(error);
      notifyError("VIP", error.message || "Impossible de charger les avantages VIP.");
    }
  }

  const benefits = getBenefits(tier);

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>VIP Benefits</h3>

      <p><strong>Tier :</strong> {tier}</p>
      <p><strong>Deposit Bonus :</strong> {benefits.depositBonus}</p>
      <p><strong>Duel Rake Discount :</strong> {benefits.rakeDiscount}</p>
      <p><strong>Premium Tournaments :</strong> {benefits.premiumAccess}</p>
    </div>
  );
}