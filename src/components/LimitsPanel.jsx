import { useEffect, useState } from "react";
import { getMyLimits } from "../api/skillsbetApi";

export default function LimitsPanel() {
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    loadLimits();
  }, []);

  async function loadLimits() {
    try {
      const data = await getMyLimits();
      setLimits(data);
    } catch (error) {
      console.error(error);
    }
  }

  if (!limits) return null;

  return (
    <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
      <h3>Account Limits</h3>

      <p>
        <strong>Daily deposit limit :</strong> {limits.daily_deposit_limit}
      </p>

      <p>
        <strong>Daily withdrawal limit :</strong> {limits.daily_withdrawal_limit}
      </p>
    </div>
  );
}