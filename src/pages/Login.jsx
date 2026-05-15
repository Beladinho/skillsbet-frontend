import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { registerUser, loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();
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
    if (!String(email || "").trim()) throw new Error(tr("enterIdentifier"));
    if (!String(password || "").trim()) throw new Error(tr("enterPassword"));
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand__title">
            SKILLS<span>BET</span>
          </div>
          <div className="login-brand__sub">COMPETE · WIN · DOMINATE</div>
        </div>

        <div className="login-divider">ACCÈS JOUEUR</div>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="sb-email">{tr("emailOrPlayerId")}</label>
            <input
              id="sb-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="Identifiant ou email"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="sb-password">{tr("password")}</label>
            <input
              id="sb-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="sb-referral">Code Referral (optionnel)</label>
            <input
              id="sb-referral"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
            />
          </div>

          <div className="login-actions">
            <button
              type="button"
              className="btn-ghost btn-lg"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "..." : tr("registerButton")}
            </button>

            <button type="submit" className="btn-lg" disabled={loading}>
              {loading ? "..." : tr("loginButton")}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                background: "none",
                border: "none",
                color: "var(--clr-text-muted)",
                fontSize: "0.82rem",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--clr-orange)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--clr-text-muted)")}
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>

        {status && <div className="login-status">{status}</div>}
      </div>
    </div>
  );
}
