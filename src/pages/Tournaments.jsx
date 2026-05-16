import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { gameLabel } from "../i18n";
import Skeleton from "../components/Skeleton";
import {
  getTournaments,
  getScheduledTournaments,
  createTournament,
  joinTournament,
  startTournament,
  getTournamentBracket,
  reportTournamentMatch,
} from "../api/skillsbetApi";

function formatCountdown(scheduledAt) {
  const diff = new Date(scheduledAt) - new Date();
  if (diff <= 0) return "00:00:00:00";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function Tournaments() {
  const { playerId, role } = useContext(PlayerContext);
  const { tr, settings } = useAppSettings();
  const { notifyError, notifySuccess, notifyInfo } = useNotifications();
  const { playClick } = useSounds();

  const [activeTab, setActiveTab] = useState("actifs");
  const [tournaments, setTournaments] = useState([]);
  const [scheduledTournaments, setScheduledTournaments] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [bracket, setBracket] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTournamentName, setNewTournamentName] = useState("Weekly Snake Cup");
  const [newTournamentGame, setNewTournamentGame] = useState("snake");
  const [newTournamentEntryFee, setNewTournamentEntryFee] = useState(10);
  const [newTournamentPremiumOnly, setNewTournamentPremiumOnly] = useState(false);

  const refreshRef = useRef(null);
  const countdownRef = useRef(null);
  const notifiedRef = useRef(new Set());

  const loadTournaments = useCallback(async () => {
    try {
      const data = await getTournaments();
      const safeData = Array.isArray(data) ? data : [];
      setTournaments(safeData);

      if (!selectedTournamentId && safeData.length > 0) {
        setSelectedTournamentId(safeData[0].id);
      }
    } catch (error) {
      console.error("Erreur chargement tournois :", error);
      setStatus("Erreur de chargement des tournois.");
    }
  }, [selectedTournamentId]);

  const loadScheduledTournaments = useCallback(async () => {
    try {
      const data = await getScheduledTournaments();
      setScheduledTournaments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement tournois planifiés :", error);
    }
  }, []);

  const loadBracket = useCallback(async (tournamentId) => {
    if (!tournamentId) {
      setBracket([]);
      return;
    }
    try {
      const data = await getTournamentBracket(tournamentId);
      setBracket(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement bracket :", error);
      setBracket([]);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
    loadScheduledTournaments();
  }, [loadTournaments, loadScheduledTournaments]);

  useEffect(() => {
    if (!selectedTournamentId) {
      setBracket([]);
      return;
    }
    loadBracket(selectedTournamentId);
  }, [selectedTournamentId, loadBracket]);

  useEffect(() => {
    if (refreshRef.current) window.clearInterval(refreshRef.current);
    refreshRef.current = window.setInterval(async () => {
      await loadTournaments();
      await loadScheduledTournaments();
      if (selectedTournamentId) await loadBracket(selectedTournamentId);
    }, 7000);
    return () => { if (refreshRef.current) window.clearInterval(refreshRef.current); };
  }, [loadTournaments, loadScheduledTournaments, loadBracket, selectedTournamentId]);

  // Countdown tick + 30-min notifications
  useEffect(() => {
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    countdownRef.current = window.setInterval(() => {
      const now = new Date();
      const updated = {};
      scheduledTournaments.forEach((t) => {
        updated[t.id] = formatCountdown(t.scheduled_at);
        const diffMins = (new Date(t.scheduled_at) - now) / 60000;
        if (diffMins >= 28 && diffMins <= 32 && !notifiedRef.current.has(t.id)) {
          notifiedRef.current.add(t.id);
          notifyInfo("Tournoi dans 30 min", `"${t.name}" commence dans 30 minutes !`);
        }
      });
      setCountdowns(updated);
    }, 1000);
    return () => { if (countdownRef.current) window.clearInterval(countdownRef.current); };
  }, [scheduledTournaments, notifyInfo]);

  async function handleCreateTournament() {
    try {
      playClick();
      setLoading(true);
      setStatus("Création du tournoi...");
      const created = await createTournament(
        newTournamentName,
        newTournamentGame,
        newTournamentEntryFee,
        newTournamentPremiumOnly
      );
      await loadTournaments();
      if (created?.id) {
        setSelectedTournamentId(created.id);
        await loadBracket(created.id);
      }
      setStatus("Tournoi créé avec succès.");
      notifySuccess("Tournoi", "Tournoi créé avec succès.");
    } catch (error) {
      console.error(error);
      const msg = `Erreur création tournoi : ${error.message}`;
      setStatus(msg);
      notifyError("Tournoi", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinTournament(tournamentId) {
    try {
      playClick();
      setLoading(true);
      setStatus("Rejoindre le tournoi...");
      await joinTournament(tournamentId, playerId);
      await loadTournaments();
      await loadScheduledTournaments();
      if (selectedTournamentId === tournamentId) await loadBracket(tournamentId);
      setStatus("Tournoi rejoint avec succès.");
      notifySuccess("Tournoi", "Tournoi rejoint avec succès.");
    } catch (error) {
      console.error(error);
      const msg = `Erreur rejoindre tournoi : ${error.message}`;
      setStatus(msg);
      notifyError("Tournoi", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTournament(tournamentId) {
    try {
      playClick();
      setLoading(true);
      setStatus("Démarrage du tournoi...");
      await startTournament(tournamentId);
      await loadTournaments();
      if (selectedTournamentId === tournamentId) await loadBracket(tournamentId);
      setStatus("Tournoi démarré.");
      notifyInfo("Tournoi", "Tournoi démarré.");
    } catch (error) {
      console.error(error);
      const msg = `Erreur démarrage tournoi : ${error.message}`;
      setStatus(msg);
      notifyError("Tournoi", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTournament(tournamentId) {
    playClick();
    setSelectedTournamentId(tournamentId);
    await loadBracket(tournamentId);
  }

  async function handleReportMatch(matchId, winner) {
    try {
      playClick();
      if (!selectedTournamentId) {
        setStatus("Aucun tournoi sélectionné.");
        return;
      }
      setLoading(true);
      setStatus("Validation du match...");
      const result = await reportTournamentMatch(selectedTournamentId, matchId, winner);
      setBracket(Array.isArray(result?.bracket) ? result.bracket : []);
      await loadTournaments();
      if (result?.tournament_winner) {
        setStatus(
          result?.prize_paid
            ? `Tournoi terminé. Gagnant : ${result.tournament_winner}. Prize pool versé.`
            : `Tournoi terminé. Gagnant : ${result.tournament_winner}`
        );
      } else {
        setStatus("Résultat de match enregistré.");
      }
      notifySuccess("Tournoi", "Résultat enregistré.");
    } catch (error) {
      console.error(error);
      const msg = `Erreur report match : ${error.message}`;
      setStatus(msg);
      notifyError("Tournoi", msg);
    } finally {
      setLoading(false);
    }
  }

  function groupBracketByRound(matches) {
    const grouped = {};
    for (const match of matches) {
      if (!grouped[match.round]) grouped[match.round] = [];
      grouped[match.round].push(match);
    }
    return grouped;
  }

  const bracketByRound = groupBracketByRound(bracket);
  const selectedTournament =
    tournaments.find((t) => t.id === selectedTournamentId) || null;

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>{tr("tournaments")}</h3>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => { playClick(); setActiveTab("actifs"); }}
          style={{
            padding: "8px 20px",
            background: activeTab === "actifs" ? "var(--clr-orange)" : "transparent",
            color: activeTab === "actifs" ? "#000" : "#aaa",
            border: `1px solid ${activeTab === "actifs" ? "var(--clr-orange)" : "#333"}`,
            fontFamily: "var(--font-heading)",
            textTransform: "uppercase",
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          Actifs
        </button>
        <button
          onClick={() => { playClick(); setActiveTab("planifies"); }}
          style={{
            padding: "8px 20px",
            background: activeTab === "planifies" ? "var(--clr-orange)" : "transparent",
            color: activeTab === "planifies" ? "#000" : "#aaa",
            border: `1px solid ${activeTab === "planifies" ? "var(--clr-orange)" : "#333"}`,
            fontFamily: "var(--font-heading)",
            textTransform: "uppercase",
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          Planifiés
        </button>
      </div>

      {/* === ONGLET ACTIFS === */}
      {activeTab === "actifs" && (
        <>
          {role === "admin" && (
            <div className="section-card" style={{ padding: "16px", marginBottom: "20px" }}>
              <h4 style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase", color: "var(--clr-orange)", marginBottom: 12 }}>
                {tr("createTournament")}
              </h4>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ color: "#aaa", fontSize: "0.85rem" }}>{tr("tournamentName")}</label>
                <br />
                <input
                  type="text"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ color: "#aaa", fontSize: "0.85rem" }}>{tr("matchmakingGame")}</label>
                <br />
                <select
                  value={newTournamentGame}
                  onChange={(e) => setNewTournamentGame(e.target.value)}
                >
                  <option value="snake">{tr("snake")}</option>
                  <option value="reflex">{tr("reflex")}</option>
                  <option value="memory">{tr("memory")}</option>
                  <option value="tetris">{tr("tetris")}</option>
                  <option value="checkers">{tr("checkers")}</option>
                  <option value="chess">{tr("chess")}</option>
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ color: "#aaa", fontSize: "0.85rem" }}>{tr("entryFee")}</label>
                <br />
                <input
                  type="number"
                  value={newTournamentEntryFee}
                  onChange={(e) => setNewTournamentEntryFee(Number(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={newTournamentPremiumOnly}
                    onChange={(e) => setNewTournamentPremiumOnly(e.target.checked)}
                  />
                  {" "}Premium only
                </label>
              </div>

              <button onClick={handleCreateTournament} disabled={loading}>
                {tr("createTournament")}
              </button>
            </div>
          )}

          {tournaments.length === 0 && loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...Array(3)].map((_, i) => <Skeleton key={i} height={56} />)}
            </div>
          ) : tournaments.length === 0 ? (
            <p>Aucun tournoi disponible</p>
          ) : (
            <div className="section-card" style={{ padding: "16px" }}>
              <table border="1" cellPadding="8" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>{tr("tournamentName")}</th>
                    <th>{tr("matchmakingGame")}</th>
                    <th>{tr("entryFee")}</th>
                    <th>{tr("players")}</th>
                    <th>{tr("status")}</th>
                    <th>{tr("winner")}</th>
                    <th>{tr("prizePaid") || "Prize payé"}</th>
                    <th>Premium</th>
                    <th>{tr("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id}>
                      <td>{tournament.name}</td>
                      <td>{gameLabel(settings.language, tournament.game)}</td>
                      <td>{tournament.entry_fee}</td>
                      <td>{tournament.players?.join(", ") || tr("empty")}</td>
                      <td>{tournament.started ? "Démarré" : tr("notStarted")}</td>
                      <td>{tournament.winner || "-"}</td>
                      <td>{tournament.prize_paid ? tr("yes") : tr("no")}</td>
                      <td>{tournament.premium_only ? "Yes" : "No"}</td>
                      <td>
                        {!tournament.started && (
                          <button
                            onClick={() => handleJoinTournament(tournament.id)}
                            style={{ marginRight: "8px" }}
                            disabled={loading}
                          >
                            {tr("join")}
                          </button>
                        )}
                        {!tournament.started && role === "admin" && (
                          <button
                            onClick={() => handleStartTournament(tournament.id)}
                            style={{ marginRight: "8px" }}
                            disabled={loading}
                          >
                            {tr("start")}
                          </button>
                        )}
                        <button
                          onClick={() => handleSelectTournament(tournament.id)}
                          disabled={loading}
                        >
                          {tr("viewBracket")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedTournamentId && (
            <div className="section-card" style={{ marginTop: "20px", padding: "16px" }}>
              <h4>{tr("bracket")}</h4>
              <p><strong>{tr("tournamentId")} :</strong> {selectedTournamentId}</p>

              {selectedTournament && (
                <div style={{ marginBottom: "16px" }}>
                  <p><strong>{tr("tournamentName")} :</strong> {selectedTournament.name}</p>
                  <p><strong>{tr("matchmakingGame")} :</strong> {gameLabel(settings.language, selectedTournament.game)}</p>
                  <p><strong>{tr("winner")} :</strong> {selectedTournament.winner || "-"}</p>
                  <p><strong>{tr("prizePaid") || "Prize payé"} :</strong> {selectedTournament.prize_paid ? tr("yes") : tr("no")}</p>
                  <p><strong>Premium :</strong> {selectedTournament.premium_only ? "Yes" : "No"}</p>
                </div>
              )}

              {bracket.length === 0 ? (
                <p>{tr("bracketNotGenerated")}</p>
              ) : (
                <div>
                  {Object.keys(bracketByRound)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((roundKey) => (
                      <div key={roundKey} style={{ marginBottom: "20px" }}>
                        <h5>Round {roundKey}</h5>
                        {bracketByRound[roundKey].map((match) => (
                          <div
                            key={match.id}
                            style={{
                              border: "1px solid #333",
                              padding: "12px",
                              marginBottom: "10px",
                              background:
                                match.winner && selectedTournament?.winner === match.winner
                                  ? "#1a2a1a"
                                  : "#1a1a1a",
                            }}
                          >
                            <p><strong>Match #{match.match_number}</strong></p>
                            <p>Player 1 : {match.player1 || "-"}</p>
                            <p>Player 2 : {match.player2 || "-"}</p>
                            <p>Winner : {match.winner || "-"}</p>

                            {!match.winner && match.player1 && match.player2 && (
                              <div style={{ marginTop: "10px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                {match.duel_id && (
                                  <Link
                                    to={`/spectate/${match.duel_id}`}
                                    style={{
                                      padding: "5px 12px",
                                      background: "rgba(255,107,0,0.08)",
                                      border: "1px solid rgba(255,107,0,0.3)",
                                      color: "var(--clr-orange)",
                                      borderRadius: 5,
                                      textDecoration: "none",
                                      fontFamily: "var(--font-heading)",
                                      fontWeight: 800,
                                      fontSize: "0.75rem",
                                      textTransform: "uppercase",
                                      letterSpacing: 1,
                                    }}
                                  >
                                    👁 Regarder
                                  </Link>
                                )}
                                {role === "admin" && (
                                  <>
                                    <button
                                      onClick={() => handleReportMatch(match.id, match.player1)}
                                      style={{ marginRight: "8px" }}
                                      disabled={loading}
                                    >
                                      Gagnant : {match.player1}
                                    </button>
                                    <button
                                      onClick={() => handleReportMatch(match.id, match.player2)}
                                      disabled={loading}
                                    >
                                      Gagnant : {match.player2}
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* === ONGLET PLANIFIÉS === */}
      {activeTab === "planifies" && (
        <div>
          {scheduledTournaments.length === 0 ? (
            <div className="section-card" style={{ padding: 32, textAlign: "center" }}>
              <p style={{ color: "#666", fontSize: "1rem" }}>Aucun tournoi planifié à venir.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scheduledTournaments.map((t) => {
                const recurrenceBadge =
                  t.recurrence === "daily"
                    ? { label: "QUOTIDIEN", cls: "badge-info" }
                    : t.recurrence === "weekly"
                    ? { label: "HEBDOMADAIRE", cls: "badge-success" }
                    : null;

                const alreadyJoined = t.players?.includes(playerId);

                return (
                  <div
                    key={t.id}
                    className="simple-list-item"
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", textTransform: "uppercase", color: "#fff" }}>
                          {t.name}
                        </span>
                        {recurrenceBadge && (
                          <span className={`badge ${recurrenceBadge.cls}`} style={{ fontSize: "0.7rem" }}>
                            {recurrenceBadge.label}
                          </span>
                        )}
                      </div>
                      <div style={{ color: "#aaa", fontSize: "0.85rem", display: "flex", gap: 16 }}>
                        <span>{gameLabel(settings.language, t.game)}</span>
                        <span>Frais : {t.entry_fee} pts</span>
                        <span>{t.players?.length || 0} inscrits</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", minWidth: 140 }}>
                      <div style={{ color: "#666", fontSize: "0.7rem", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                        Début dans
                      </div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--clr-orange)", letterSpacing: 2 }}>
                        {countdowns[t.id] || formatCountdown(t.scheduled_at)}
                      </div>
                    </div>

                    <div>
                      {alreadyJoined ? (
                        <span className="badge badge-success" style={{ fontSize: "0.8rem" }}>Inscrit</span>
                      ) : (
                        <button
                          onClick={() => handleJoinTournament(t.id)}
                          disabled={loading}
                          style={{
                            background: "var(--clr-orange)",
                            color: "#000",
                            border: "none",
                            padding: "8px 18px",
                            fontFamily: "var(--font-heading)",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            cursor: "pointer",
                          }}
                        >
                          S&apos;inscrire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {status && (
        <p style={{ marginTop: "15px", color: "#aaa" }}>
          {status}
        </p>
      )}
    </div>
  );
}
