import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import PlayerAvatar from "../components/PlayerAvatar";
import AddFriendButton from "../components/AddFriendButton";
import ReportButton from "../components/ReportButton";
import SessionBar from "../components/SessionBar";

const API_URL = import.meta.env.VITE_API_URL;

export default function PublicProfile() {
  const { email } = useParams();
  const { playerId } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return;
    fetch(`${API_URL}/player/?player_id=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => setError("Joueur introuvable"));
  }, [email]);

  return (
    <div className="app-shell">
      <SessionBar />
      <div style={{ paddingTop: 72 }}>
        <button
          className="btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          ← Retour
        </button>

        {error && <p style={{ color: "var(--clr-error)" }}>{error}</p>}

        {profile && (
          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <PlayerAvatar
                playerId={email}
                avatarUrl={profile.avatar_url}
                size={64}
                style={{ border: "2px solid var(--clr-orange)", flexShrink: 0 }}
              />
              <div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>
                  {profile.display_name || email}
                </h2>
                <p style={{ color: "var(--clr-text-dim)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                  {email}
                </p>
              </div>
              {playerId && email !== playerId && (
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <AddFriendButton targetId={email} className="btn-sm" />
                  <ReportButton targetId={email} />
                </div>
              )}
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <strong>ELO Global</strong>
                {profile.elo ?? 1200}
              </div>
              <div className="stat-box">
                <strong>Victoires</strong>
                {profile.wins ?? 0}
              </div>
              <div className="stat-box">
                <strong>Défaites</strong>
                {profile.losses ?? 0}
              </div>
              <div className="stat-box">
                <strong>Parties</strong>
                {profile.games_played ?? 0}
              </div>
            </div>

            {profile.bio && (
              <p style={{ marginTop: 16, color: "var(--clr-text-dim)", fontStyle: "italic" }}>
                {profile.bio}
              </p>
            )}
          </div>
        )}

        {!profile && !error && (
          <p style={{ color: "var(--clr-text-dim)" }}>Chargement...</p>
        )}
      </div>
    </div>
  );
}
