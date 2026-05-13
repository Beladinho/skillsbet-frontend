import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import {
  deposit,
  getBalance,
  createWithdrawalRequest,
  getMyWithdrawals,
  createStripeCheckout,
  getWalletTransactions,
  exportWalletTransactions,
} from "../api/skillsbetApi";

export default function Wallet() {
  const { playerId, balance, setBalance } = useContext(PlayerContext);
  const { tr } = useAppSettings();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  const { playClick } = useSounds();

  const [amount, setAmount] = useState(10);
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsSummary, setTransactionsSummary] = useState(null);
  const [txType, setTxType] = useState("all");
  const [txPeriod, setTxPeriod] = useState("all");

  useEffect(() => {
    if (playerId) {
      loadBalance();
      loadWithdrawals();
      loadTransactions(txType, txPeriod);
    }
  }, [playerId]);

  useEffect(() => {
    if (playerId) loadTransactions(txType, txPeriod);
  }, [txType, txPeriod]);

  async function loadBalance(showToast = false) {
    if (!playerId) return;
    try {
      const data = await getBalance(playerId);
      setBalance(data.balance);
      if (showToast) notifyInfo("Wallet", `${tr("currentBalance")} ${data.balance} ${tr("tokens")}`);
    } catch (error) {
      notifyError("Wallet", error.message || "Erreur balance");
    }
  }

  async function loadWithdrawals() {
    if (!playerId) return;
    try {
      const data = await getMyWithdrawals();
      setWithdrawals(data || []);
    } catch {}
  }

  async function loadTransactions(selectedType = "all", selectedPeriod = "all") {
    if (!playerId) return;
    try {
      const data = await getWalletTransactions(selectedType, selectedPeriod);
      setTransactions(data.rows || []);
      setTransactionsSummary(data.summary || null);
    } catch {}
  }

  async function addTokens() {
    if (!playerId) return;
    try {
      await deposit(playerId, Number(amount));
      await loadBalance();
      await loadTransactions(txType, txPeriod);
      notifySuccess("Wallet", "Dépôt effectué.");
    } catch (error) {
      notifyError("Wallet", error.message || "Erreur dépôt");
    }
  }

  async function handleStripeDeposit() {
    if (!playerId) return;
    try {
      const data = await createStripeCheckout(Number(amount));
      if (!data?.checkout_url) throw new Error("Missing checkout URL");
      window.location.href = data.checkout_url;
    } catch (error) {
      notifyError("Stripe", error.message || "Impossible de créer le paiement.");
    }
  }

  async function handleWithdrawRequest() {
    if (!playerId) return;
    try {
      await createWithdrawalRequest(Number(withdrawAmount), "manual", "");
      await loadBalance();
      await loadWithdrawals();
      await loadTransactions(txType, txPeriod);
      notifySuccess("Retrait", "Demande de retrait créée.");
    } catch (error) {
      notifyError("Retrait", error.message || "Erreur retrait");
    }
  }

  return (
    <div className="section-card">
      <div className="section-card__header">
        <h3 className="section-card__title">{tr("wallet")}</h3>
        <div style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.6rem",
          fontWeight: 900,
          color: "var(--clr-orange)",
          letterSpacing: "0.04em",
        }}>
          {balance} <span style={{ fontSize: "0.9rem", color: "var(--clr-text-muted)" }}>{tr("tokens")}</span>
        </div>
      </div>

      {/* Deposit */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--clr-text-muted)",
          marginBottom: "10px",
        }}>
          DÉPÔT
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ width: "120px", flex: "none" }}
          />
          <button onClick={() => { playClick(); addTokens(); }}>
            {tr("deposit")}
          </button>
          <button className="btn-ghost" onClick={() => { playClick(); handleStripeDeposit(); }}>
            STRIPE
          </button>
          <button
            className="btn-ghost btn-sm"
            onClick={() => { playClick(); loadBalance(true); }}
            style={{ marginLeft: "auto" }}
          >
            {tr("checkBalance")}
          </button>
        </div>
      </div>

      {/* Withdraw */}
      <div style={{ marginBottom: "24px", paddingTop: "20px", borderTop: "1px solid var(--clr-border)" }}>
        <div style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--clr-text-muted)",
          marginBottom: "10px",
        }}>
          {tr("withdraw")}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            min="0"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            style={{ width: "120px", flex: "none" }}
          />
          <button onClick={() => { playClick(); handleWithdrawRequest(); }}>
            {tr("withdraw")}
          </button>
        </div>

        {withdrawals.length > 0 && (
          <div className="simple-list" style={{ marginTop: "12px" }}>
            {withdrawals.map((row) => (
              <div key={row.id} className="simple-list-item" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>#{row.id} — {row.amount} {tr("tokens")}</span>
                <span className={`badge ${row.status === "approved" ? "badge-success" : row.status === "rejected" ? "badge-error" : "badge-muted"}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div style={{ paddingTop: "20px", borderTop: "1px solid var(--clr-border)" }}>
        <div style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--clr-text-muted)",
          marginBottom: "10px",
        }}>
          HISTORIQUE DES TRANSACTIONS
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
          <select value={txType} onChange={(e) => setTxType(e.target.value)} style={{ width: "auto" }}>
            <option value="all">Tous les types</option>
            <option value="deposit">Dépôt</option>
            <option value="stripe">Stripe</option>
            <option value="win">Gain</option>
            <option value="loss">Perte</option>
            <option value="reward">Récompense</option>
            <option value="withdrawal">Retrait</option>
            <option value="refund">Remboursement</option>
          </select>

          <select value={txPeriod} onChange={(e) => setTxPeriod(e.target.value)} style={{ width: "auto" }}>
            <option value="today">Aujourd'hui</option>
            <option value="7d">7 Jours</option>
            <option value="30d">30 Jours</option>
            <option value="all">Tout</option>
          </select>

          <button
            className="btn-ghost btn-sm"
            onClick={() => { playClick(); exportWalletTransactions(txType, txPeriod); }}
          >
            EXPORT CSV
          </button>
        </div>

        {transactionsSummary && (
          <div className="stats-grid" style={{ marginBottom: "14px" }}>
            {[
              ["TOTAL", transactionsSummary.count],
              ["ENTRANT", `+${transactionsSummary.total_in}`],
              ["SORTANT", `-${transactionsSummary.total_out}`],
              ["NET", transactionsSummary.net],
            ].map(([label, value]) => (
              <div key={label} className="stat-box">
                <strong>{label}</strong>
                <div style={{
                  color: label === "ENTRANT" ? "var(--clr-success)" : label === "SORTANT" ? "var(--clr-error)" : "var(--clr-text)"
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length === 0 ? (
          <p>{tr("empty")}</p>
        ) : (
          <div className="simple-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="simple-list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--clr-text-muted)" }}>#{tx.id}</span>
                  {"  "}
                  <span className={`badge ${tx.type === "win" || tx.type === "deposit" ? "badge-success" : tx.type === "loss" ? "badge-error" : "badge-muted"}`}>
                    {tx.type}
                  </span>
                  {tx.reference ? `  ·  ${tx.reference}` : ""}
                </span>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: tx.amount > 0 ? "var(--clr-success)" : "var(--clr-error)" }}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>
                    Bal: {tx.balance_after}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
