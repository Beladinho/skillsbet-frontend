import { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { registerUser, loginUser } from "../api/authApi";

export default function Login() {
  const { loginPlayer } = useContext(PlayerContext);
  const { tr } = useAppSettings();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  const { playClick } = useSounds();

  const [email, setEmail] = useState("Player 1");
  const [password, setPassword] = useState("1234");
  const [referralCode, setReferralCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function validateForm() {
    if (!String(email || "").trim()) {
      throw new Error(tr("enterIdentifier"));
    }

    if (!String(password || "").trim()) {
      throw new Error(tr("enterPassword"));
    }
  }

  async function handleRegister() {
    try {
      playClick();
      validateForm();

      setLoading(true);
      setStatus(tr("creatingAccount"));

      const data = await registerUser(email, password, referralCode);

      setStatus(`${tr("accountCreated")} : ${data.player_id} (${data.role})`);
      notifySuccess(tr("accountCreated"), `${data.player_id} (${data.role})`);

      setReferralCode("");
    } catch (error) {
      console.error(error);
      setStatus(error.message);
      notifyError(tr("registerError"), error.message || tr("registerError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    try {
      playClick();
      validateForm();

      setLoading(true);
      setStatus(tr("connecting"));

      const data = await loginUser(email, password);

      loginPlayer(data.player_id, data.access_token, data.role);

      setStatus(`${tr("loginSuccess")} : ${data.player_id} (${data.role})`);
      notifyInfo(tr("loginSuccess"), `${data.player_id} (${data.role})`);
    } catch (error) {
      console.error(error);
      setStatus(error.message);
      notifyError(tr("loginError"), error.message || tr("loginError"));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleLogin();
  }

  return (
    <div style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
      <div className="card" style={{ padding: "20px" }}>
        <h1>{tr("appName")}</h1>
        <h2>{tr("loginTitle")}</h2>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div style={{ marginBottom: "12px" }}>
            <label>{tr("emailOrPlayerId")}</label>
            <br />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
              autoComplete="username"
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "12px" }}>
            <label>{tr("password")}</label>
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
              autoComplete="current-password"
            />
          </div>

          {/* 🔴 NOUVEAU CHAMP REFERRAL */}
          <div style={{ marginBottom: "12px" }}>
            <label>Referral code (optional)</label>
            <br />
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              style={{ width: "100%" }}
              placeholder="Enter referral code"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="button" onClick={handleRegister} disabled={loading}>
              {loading ? tr("loading") : tr("registerButton")}
            </button>

            <button type="submit" disabled={loading}>
              {loading ? tr("loading") : tr("loginButton")}
            </button>
          </div>
        </form>

        {status ? <p style={{ marginTop: "16px" }}>{status}</p> : null}
      </div>
    </div>
  );
}