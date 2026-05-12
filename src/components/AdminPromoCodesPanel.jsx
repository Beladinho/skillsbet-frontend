import { useEffect, useState } from "react";
import { createPromoCodeAdmin, getPromoCodesAdmin } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminPromoCodesPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [rows, setRows] = useState([]);
  const [code, setCode] = useState("WELCOME10");
  const [promoType, setPromoType] = useState("fixed_tokens");
  const [value, setValue] = useState(10);
  const [maxUses, setMaxUses] = useState(100);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getPromoCodesAdmin();
      setRows(data || []);
    } catch (error) {
      console.error(error);
      notifyError("Promo Codes", error.message || "Impossible de charger les promo codes.");
    }
  }

  async function handleCreate() {
    try {
      await createPromoCodeAdmin({
        code,
        promoType,
        value,
        maxUses,
      });

      await load();

      notifySuccess("Promo Codes", "Promo code created successfully.");
    } catch (error) {
      console.error(error);
      notifyError("Promo Codes", error.message || "Impossible de créer le promo code.");
    }
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Promo Codes</h3>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label>Code</label>
          <br />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Promo Type</label>
          <br />
          <select
            value={promoType}
            onChange={(e) => setPromoType(e.target.value)}
          >
            <option value="fixed_tokens">Fixed Tokens</option>
          </select>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Value</label>
          <br />
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Max Uses (0 = unlimited)</label>
          <br />
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
          />
        </div>

        <button
          onClick={() => {
            playClick();
            handleCreate();
          }}
        >
          Create Promo Code
        </button>
      </div>

      {rows.length === 0 ? (
        <p>No promo codes yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="simple-list-item">
            <div>
              <strong>{row.code}</strong> — {row.promo_type} — value: {row.value}
            </div>
            <div>
              uses: {row.used_count} / {row.max_uses === 0 ? "∞" : row.max_uses}
            </div>
            <div>
              active: {row.is_active ? "Yes" : "No"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}