import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSocial } from "../context/SocialContext";
import PlayerAvatar from "../components/PlayerAvatar";
import SessionBar from "../components/SessionBar";

const GAMES = [
  { key: "snake", label: "Viper" },
  { key: "reflex", label: "QuickShot" },
  { key: "memory", label: "FlipMatch" },
  { key: "tetris", label: "BlockDrop" },
  { key: "checkers", label: "DraughtWar" },
  { key: "chess", label: "KingSlayer" },
  { key: "uno", label: "ColorBlitz" },
];

export default function Friends() {
  const { tr } = useAppSettings();
  const { notifySuccess, notifyError } = useNotifications();
  const navigate = useNavigate();

  const {
    friends, requests, sent, pendingCount, loading,
    loadFriends, loadRequests, loadSent,
    sendRequest, acceptRequest, rejectRequest, removeFriend,
    searchPlayers, challenge,
  } = useSocial();

  const [tab, setTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [challengeGame, setChallengeGame] = useState("snake");
  const [challengeStake, setChallengeStake] = useState(0);

  useEffect(() => {
    if (tab === "friends") loadFriends();
    else if (tab === "requests") { loadRequests(); loadSent(); }
  }, [tab]);

  async function handleSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const results = await searchPlayers(q);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {}
    setSearchLoading(false);
  }

  async function handleSendRequest(addresseeId) {
    try {
      await sendRequest(addresseeId);
      notifySuccess("Demande envoyée", `Demande d'ami envoyée`);
      if (searchQuery.length >= 2) {
        const results = await searchPlayers(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
      }
    } catch (err) {
      notifyError("Erreur", err.message);
    }
  }

  async function handleAccept(id) {
    try {
      await acceptRequest(id);
      notifySuccess("Ami ajouté", "Demande acceptée !");
    } catch (err) {
      notifyError("Erreur", err.message);
    }
  }

  async function handleReject(id) {
    try {
      await rejectRequest(id);
    } catch (err) {
      notifyError("Erreur", err.message);
    }
  }

  async function handleRemove(id) {
    try {
      await removeFriend(id);
      notifySuccess("Ami supprimé", "Ami retiré de votre liste");
    } catch (err) {
      notifyError("Erreur", err.message);
    }
  }

  async function handleChallengeSend() {
    if (!challengeTarget) return;
    try {
      await challenge(challengeTarget.id, challengeGame, challengeStake);
      notifySuccess("Défi envoyé !", `${challengeTarget.display_name} a reçu votre défi`);
      setChallengeTarget(null);
    } catch (err) {
      notifyError("Erreur", err.message);
    }
  }

  return (
    <div className="app-shell">
      <SessionBar />
      <div style={{ paddingTop: 72 }}>
        <h2 className="friends-page-title">AMIS &amp; SOCIAL</h2>

        {/* Tabs */}
        <div className="friends-tabs">
          {[
            { id: "friends", label: `Mes amis (${friends.length})` },
            { id: "requests", label: "Demandes", badge: pendingCount },
            { id: "search", label: "Rechercher" },
          ].map((t) => (
            <button
              key={t.id}
              className={`friends-tab${tab === t.id ? " friends-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.badge > 0 && <span className="friends-tab-badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Mes amis ── */}
        {tab === "friends" && (
          <div className="friends-list">
            {loading ? (
              <p style={{ color: "var(--clr-text-dim)" }}>Chargement...</p>
            ) : friends.length === 0 ? (
              <div className="section-card friends-empty">
                <span style={{ color: "var(--clr-text-dim)" }}>
                  Vous n'avez pas encore d'amis.
                </span>
                <button className="btn-ghost btn-sm" onClick={() => setTab("search")}>
                  + Rechercher des joueurs
                </button>
              </div>
            ) : (
              friends.map((f) => (
                <div key={f.friendship_id} className="friend-card">
                  <PlayerAvatar playerId={f.id} avatarUrl={f.avatar_url} size={44} />
                  <div className="friend-card__info">
                    <span className="friend-card__name">{f.display_name}</span>
                    <span className="friend-card__elo">ELO {f.elo}</span>
                  </div>
                  <span className={`friend-card__status${f.is_online ? " friend-card__status--online" : ""}`}>
                    {f.is_online ? "EN LIGNE" : "HORS LIGNE"}
                  </span>
                  {f.is_online && (
                    <button
                      className="btn-sm"
                      onClick={() => setChallengeTarget(f)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      ⚔ DÉFIER
                    </button>
                  )}
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => handleRemove(f.friendship_id)}
                    title="Supprimer l'ami"
                    style={{ color: "var(--clr-error)", fontSize: "1rem", padding: "4px 8px" }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Demandes ── */}
        {tab === "requests" && (
          <div>
            <h3 className="friends-section-title">Demandes reçues</h3>
            {requests.length === 0 ? (
              <p style={{ color: "var(--clr-text-dim)", marginBottom: 24 }}>Aucune demande en attente.</p>
            ) : (
              <div className="friends-list">
                {requests.map((r) => (
                  <div key={r.friendship_id} className="friend-card">
                    <PlayerAvatar playerId={r.id} avatarUrl={r.avatar_url} size={44} />
                    <div className="friend-card__info">
                      <span className="friend-card__name">{r.display_name}</span>
                      <span className="friend-card__elo" style={{ fontSize: "0.75rem" }}>{r.id}</span>
                    </div>
                    <button
                      className="btn-sm"
                      onClick={() => handleAccept(r.friendship_id)}
                      style={{ marginLeft: "auto", fontSize: "0.8rem" }}
                    >
                      ✓ Accepter
                    </button>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => handleReject(r.friendship_id)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      ✕ Refuser
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h3 className="friends-section-title" style={{ marginTop: 28 }}>Demandes envoyées</h3>
            {sent.length === 0 ? (
              <p style={{ color: "var(--clr-text-dim)" }}>Aucune demande en cours.</p>
            ) : (
              <div className="friends-list">
                {sent.map((s) => (
                  <div key={s.friendship_id} className="friend-card">
                    <PlayerAvatar playerId={s.id} avatarUrl={s.avatar_url} size={44} />
                    <div className="friend-card__info">
                      <span className="friend-card__name">{s.display_name}</span>
                      <span className="friend-card__elo" style={{ fontSize: "0.75rem" }}>{s.id}</span>
                    </div>
                    <span className="badge-muted" style={{ marginLeft: "auto" }}>En attente</span>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => handleRemove(s.friendship_id)}
                      style={{ fontSize: "0.8rem", color: "var(--clr-error)" }}
                    >
                      Annuler
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Rechercher ── */}
        {tab === "search" && (
          <div>
            <input
              type="text"
              placeholder="Rechercher par email ou pseudo..."
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: "100%", marginBottom: 16, fontSize: "0.95rem" }}
            />
            {searchLoading && <p style={{ color: "var(--clr-text-dim)" }}>Recherche...</p>}
            {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p style={{ color: "var(--clr-text-dim)" }}>Aucun joueur trouvé.</p>
            )}
            <div className="friends-list">
              {searchResults.map((r) => (
                <div key={r.id} className="friend-card">
                  <PlayerAvatar playerId={r.id} avatarUrl={r.avatar_url} size={44} />
                  <div className="friend-card__info">
                    <span className="friend-card__name">{r.display_name}</span>
                    <span className="friend-card__elo">ELO {r.elo}</span>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    {!r.friendship_status && (
                      <button className="btn-sm" onClick={() => handleSendRequest(r.id)} style={{ fontSize: "0.8rem" }}>
                        + Ajouter
                      </button>
                    )}
                    {r.friendship_status === "pending" && (
                      <span className="badge-muted">En attente</span>
                    )}
                    {r.friendship_status === "accepted" && (
                      <span className="badge-success">Ami ✓</span>
                    )}
                    {r.friendship_status === "rejected" && (
                      <button className="btn-sm" onClick={() => handleSendRequest(r.id)} style={{ fontSize: "0.8rem" }}>
                        + Ajouter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Challenge Modal ── */}
      {challengeTarget && (
        <div className="challenge-overlay" onClick={() => setChallengeTarget(null)}>
          <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>DÉFIER {challengeTarget.display_name.toUpperCase()}</h3>

            <label style={{ display: "block", marginBottom: 6, color: "var(--clr-text-dim)", fontSize: "0.8rem", textTransform: "uppercase" }}>
              Jeu
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {GAMES.map((g) => (
                <button
                  key={g.key}
                  className={challengeGame === g.key ? "" : "btn-ghost"}
                  onClick={() => setChallengeGame(g.key)}
                  style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <label style={{ display: "block", marginBottom: 6, color: "var(--clr-text-dim)", fontSize: "0.8rem", textTransform: "uppercase" }}>
              Mise (jetons)
            </label>
            <input
              type="number"
              min={0}
              value={challengeStake}
              onChange={(e) => setChallengeStake(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 20 }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleChallengeSend} style={{ flex: 1 }}>
                ⚔ Envoyer le défi
              </button>
              <button className="btn-ghost" onClick={() => setChallengeTarget(null)} style={{ flex: 1 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
