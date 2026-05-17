import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSocial } from "../context/SocialContext";
import PlayerAvatar from "../components/PlayerAvatar";
import SessionBar from "../components/SessionBar";
import Skeleton from "../components/Skeleton";

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
      notifySuccess(tr("requestSent"), `Demande d'ami envoyée`);
      if (searchQuery.length >= 2) {
        const results = await searchPlayers(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
      }
    } catch (err) {
      notifyError(tr("erreur"), err.message);
    }
  }

  async function handleAccept(id) {
    try {
      await acceptRequest(id);
      notifySuccess(tr("friendAdded"), tr("friendAccepted"));
    } catch (err) {
      notifyError(tr("erreur"), err.message);
    }
  }

  async function handleReject(id) {
    try {
      await rejectRequest(id);
    } catch (err) {
      notifyError(tr("erreur"), err.message);
    }
  }

  async function handleRemove(id) {
    try {
      await removeFriend(id);
      notifySuccess(tr("friendRemoved"), tr("friendRemovedMsg"));
    } catch (err) {
      notifyError(tr("erreur"), err.message);
    }
  }

  async function handleChallengeSend() {
    if (!challengeTarget) return;
    try {
      await challenge(challengeTarget.id, challengeGame, challengeStake);
      notifySuccess(tr("challengeSent"), `${challengeTarget.display_name} a reçu votre défi`);
      setChallengeTarget(null);
    } catch (err) {
      notifyError(tr("erreur"), err.message);
    }
  }

  return (
    <div className="app-shell">
      <SessionBar />
      <div style={{ paddingTop: 72 }}>
        <h2 className="friends-page-title">{tr("friendsPageTitle")}</h2>

        {/* Tabs */}
        <div className="friends-tabs">
          {[
            { id: "friends", label: `${tr("myFriends")} (${friends.length})` },
            { id: "requests", label: tr("friendRequests"), badge: pendingCount },
            { id: "search", label: tr("searchPlayers") },
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
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--clr-surface-1)", border: "1px solid var(--clr-border)", borderRadius: 6 }}>
                    <Skeleton width={44} height={44} borderRadius={999} />
                    <div style={{ flex: 1 }}>
                      <Skeleton height={14} style={{ marginBottom: 6 }} />
                      <Skeleton width="60%" height={10} />
                    </div>
                  </div>
                ))}
              </>
            ) : friends.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state__icon">👥</span>
                <p className="empty-state__text">{tr("noFriends")}</p>
                <p className="empty-state__sub">Invite des joueurs pour jouer ensemble !</p>
                <button className="btn-ghost btn-sm" onClick={() => setTab("search")}>
                  {tr("searchPlayers2")}
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
                    {f.is_online ? tr("onlineStatus") : tr("offlineStatus")}
                  </span>
                  {f.is_online && (
                    <button
                      className="btn-sm"
                      onClick={() => setChallengeTarget(f)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {tr("challenge")}
                    </button>
                  )}
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => handleRemove(f.friendship_id)}
                    title={tr("removeBtn")}
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
            <h3 className="friends-section-title">{tr("receivedRequests")}</h3>
            {requests.length === 0 ? (
              <p style={{ color: "var(--clr-text-dim)", marginBottom: 24 }}>{tr("noPendingRequests")}</p>
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
                      {tr("acceptRequest")}
                    </button>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => handleReject(r.friendship_id)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {tr("rejectRequest")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h3 className="friends-section-title" style={{ marginTop: 28 }}>{tr("sentRequests")}</h3>
            {sent.length === 0 ? (
              <p style={{ color: "var(--clr-text-dim)" }}>{tr("noSentRequests")}</p>
            ) : (
              <div className="friends-list">
                {sent.map((s) => (
                  <div key={s.friendship_id} className="friend-card">
                    <PlayerAvatar playerId={s.id} avatarUrl={s.avatar_url} size={44} />
                    <div className="friend-card__info">
                      <span className="friend-card__name">{s.display_name}</span>
                      <span className="friend-card__elo" style={{ fontSize: "0.75rem" }}>{s.id}</span>
                    </div>
                    <span className="badge-muted" style={{ marginLeft: "auto" }}>{tr("pending")}</span>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => handleRemove(s.friendship_id)}
                      style={{ fontSize: "0.8rem", color: "var(--clr-error)" }}
                    >
                      {tr("cancelRequest")}
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
              placeholder={tr("searchPlaceholder")}
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: "100%", marginBottom: 16, fontSize: "0.95rem" }}
            />
            {searchLoading && <p style={{ color: "var(--clr-text-dim)" }}>{tr("searchLoading")}</p>}
            {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p style={{ color: "var(--clr-text-dim)" }}>{tr("noPlayerFound")}</p>
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
                        {tr("addFriend")}
                      </button>
                    )}
                    {r.friendship_status === "pending" && (
                      <span className="badge-muted">{tr("pending")}</span>
                    )}
                    {r.friendship_status === "accepted" && (
                      <span className="badge-success">{tr("alreadyFriend")}</span>
                    )}
                    {r.friendship_status === "rejected" && (
                      <button className="btn-sm" onClick={() => handleSendRequest(r.id)} style={{ fontSize: "0.8rem" }}>
                        {tr("addFriend")}
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
            <h3 style={{ marginBottom: 16 }}>{tr("challengeTitle")} {challengeTarget.display_name.toUpperCase()}</h3>

            <label style={{ display: "block", marginBottom: 6, color: "var(--clr-text-dim)", fontSize: "0.8rem", textTransform: "uppercase" }}>
              {tr("matchmakingGame")}
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
              {tr("stake")}
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
                {tr("sendChallenge")}
              </button>
              <button className="btn-ghost" onClick={() => setChallengeTarget(null)} style={{ flex: 1 }}>
                {tr("cancelRequest")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
