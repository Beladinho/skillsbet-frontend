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
    if (playerId) {
      loadTransactions(txType, txPeriod);
    }
  }, [txType, txPeriod]);

  async function loadBalance(showToast = false) {
    if (!playerId) return;

    try {
      const data = await getBalance(playerId);
      setBalance(data.balance);

      if (showToast) {
        notifyInfo(
          "Wallet",
          `${tr("currentBalance")} ${data.balance} ${tr("tokens")}`
        );
      }
    } catch (error) {
      console.error("Erreur chargement balance :", error);
      notifyError("Wallet", error.message || "Erreur balance");
    }
  }

  async function loadWithdrawals() {
    if (!playerId) return;

    try {
      const data = await getMyWithdrawals();
      setWithdrawals(data || []);
    } catch (error) {
      console.error("Erreur chargement withdrawals :", error);
    }
  }

  async function loadTransactions(selectedType = "all", selectedPeriod = "all") {
    if (!playerId) return;

    try {
      const data = await getWalletTransactions(selectedType, selectedPeriod);
      setTransactions(data.rows || []);
      setTransactionsSummary(data.summary || null);
    } catch (error) {
      console.error("Erreur chargement transactions :", error);
    }
  }

  async function addTokens() {
    if (!playerId) return;

    try {
      await deposit(playerId, Number(amount));
      await loadBalance();
      await loadTransactions(txType, txPeriod);
      notifySuccess("Wallet", "Dépôt effectué.");
    } catch (error) {
      console.error("Erreur dépôt :", error);
      notifyError("Wallet", error.message || "Erreur dépôt");
    }
  }

  async function handleStripeDeposit() {
    if (!playerId) return;

    try {
      const data = await createStripeCheckout(Number(amount));

      if (!data?.checkout_url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Erreur Stripe :", error);
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
      console.error("Erreur retrait :", error);
      notifyError("Retrait", error.message || "Erreur retrait");
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <h2>💰 {tr("wallet")}</h2>

      {playerId ? (
        <p>
          {tr("email")} : {playerId}
        </p>
      ) : (
        <p>{tr("empty")}</p>
      )}

      <button
        onClick={() => {
          playClick();
          loadBalance(true);
        }}
      >
        {tr("checkBalance")}
      </button>

      <p>
        {tr("balance")} : {balance} {tr("tokens")}
      </p>

      <div style={{ marginTop: "12px" }}>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button
          style={{ marginLeft: "8px" }}
          onClick={() => {
            playClick();
            addTokens();
          }}
        >
          {tr("deposit")}
        </button>

        <button
          style={{ marginLeft: "8px" }}
          onClick={() => {
            playClick();
            handleStripeDeposit();
          }}
        >
          Pay with Stripe
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <h3>{tr("withdraw")}</h3>

        <input
          type="number"
          min="0"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
        />

        <button
          style={{ marginLeft: "8px" }}
          onClick={() => {
            playClick();
            handleWithdrawRequest();
          }}
        >
          {tr("withdraw")}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Withdrawal requests</h3>

        {withdrawals.length === 0 ? (
          <p>{tr("empty")}</p>
        ) : (
          withdrawals.map((row) => (
            <div key={row.id} className="simple-list-item">
              #{row.id} — {row.amount} {tr("tokens")} — {row.status}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Transaction history</h3>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          <select value={txType} onChange={(e) => setTxType(e.target.value)}>
            <option value="all">All types</option>
            <option value="deposit">Deposit</option>
            <option value="stripe">Stripe</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="reward">Reward</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="refund">Refund</option>
          </select>

          <select value={txPeriod} onChange={(e) => setTxPeriod(e.target.value)}>
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() => {
              playClick();
              exportWalletTransactions(txType, txPeriod);
            }}
          >
            Export CSV
          </button>
        </div>

        {transactionsSummary && (
          <div className="stats-grid" style={{ marginBottom: "16px" }}>
            <div className="stat-box">
              <strong>Count :</strong> {transactionsSummary.count}
            </div>
            <div className="stat-box">
              <strong>Total In :</strong> {transactionsSummary.total_in}
            </div>
            <div className="stat-box">
              <strong>Total Out :</strong> {transactionsSummary.total_out}
            </div>
            <div className="stat-box">
              <strong>Net :</strong> {transactionsSummary.net}
            </div>
          </div>
        )}

        {transactions.length === 0 ? (
          <p>{tr("empty")}</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="simple-list-item">
              #{tx.id} — {tx.type} — {tx.amount} — balance: {tx.balance_after}
              {tx.reference ? ` — ref: ${tx.reference}` : ""}
            </div>
          ))
        )}
      </div>
    </div>
  );
}