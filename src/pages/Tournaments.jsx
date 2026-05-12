import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { gameLabel } from "../i18n";
import {
  getTournaments,
  createTournament,
  joinTournament,
  startTournament,
  getTournamentBracket,
  reportTournamentMatch,
} from "../api/skillsbetApi";

export default function Tournaments() {
  const { playerId, role } = useContext(PlayerContext);
  const { tr, settings } = useAppSettings();
  const { notifyError, notifySuccess, notifyInfo } = useNotifications();
  const { playClick } = useSounds();

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [bracket, setBracket] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTournamentName, setNewTournamentName] = useState("Weekly Snake Cup");
  const [newTournamentGame, setNewTournamentGame] = useState("snake");
  const [newTournamentEntryFee, setNewTournamentEntryFee] = useState(10);
  const [newTournamentPremiumOnly, setNewTournamentPremiumOnly] = useState(false);

  const refreshRef = useRef(null);

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
  }, [loadTournaments]);

  useEffect(() => {
    if (!selectedTournamentId) {
      setBracket([]);
      return;
    }

    loadBracket(selectedTournamentId);
  }, [selectedTournamentId, loadBracket]);

  useEffect(() => {
    if (refreshRef.current) {
      window.clearInterval(refreshRef.current);
    }

    refreshRef.current = window.setInterval(async () => {
      await loadTournaments();

      if (selectedTournamentId) {
        await loadBracket(selectedTournamentId);
      }
    }, 7000);

    return () => {
      if (refreshRef.current) {
        window.clearInterval(refreshRef.current);
      }
    };
  }, [loadTournaments, loadBracket, selectedTournamentId]);

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

      if (selectedTournamentId === tournamentId) {
        await loadBracket(tournamentId);
      }

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

      if (selectedTournamentId === tournamentId) {
        await loadBracket(tournamentId);
      }

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

      const result = await reportTournamentMatch(
        selectedTournamentId,
        matchId,
        winner
      );

      setBracket(Array.isArray(result?.bracket) ? result.bracket : []);
      await loadTournaments();

      if (result?.tournament_winner) {
        if (result?.prize_paid) {
          setStatus(
            `Tournoi terminé. Gagnant final : ${result.tournament_winner}. Prize pool versé.`
          );
        } else {
          setStatus(`Tournoi terminé. Gagnant final : ${result.tournament_winner}`);
        }
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
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    }

    return grouped;
  }

  const bracketByRound = groupBracketByRound(bracket);

  const selectedTournament =
    tournaments.find((tournament) => tournament.id === selectedTournamentId) || null;

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>{tr("tournaments")}</h3>

      <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
        <h4>{tr("createTournament")}</h4>

        <div style={{ marginBottom: "10px" }}>
          <label>{tr("tournamentName")}</label>
          <br />
          <input
            type="text"
            value={newTournamentName}
            onChange={(e) => setNewTournamentName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>{tr("matchmakingGame")}</label>
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
          <label>{tr("entryFee")}</label>
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

      {tournaments.length === 0 ? (
        <p>Aucun tournoi disponible</p>
      ) : (
        <div className="card" style={{ padding: "16px" }}>
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
        <div
          className="card"
          style={{
            marginTop: "20px",
            padding: "16px",
          }}
        >
          <h4>{tr("bracket")}</h4>

          <p>
            <strong>{tr("tournamentId")} :</strong> {selectedTournamentId}
          </p>

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
                          border: "1px solid #999",
                          padding: "12px",
                          marginBottom: "10px",
                          background:
                            match.winner && selectedTournament?.winner === match.winner
                              ? "#eef9ee"
                              : "transparent",
                        }}
                      >
                        <p>
                          <strong>Match #{match.match_number}</strong>
                        </p>
                        <p>Player 1 : {match.player1 || "-"}</p>
                        <p>Player 2 : {match.player2 || "-"}</p>
                        <p>Winner : {match.winner || "-"}</p>

                        {!match.winner && match.player1 && match.player2 && role === "admin" && (
                          <div style={{ marginTop: "10px" }}>
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

      {status && (
        <p style={{ marginTop: "15px" }}>
          {status}
        </p>
      )}
    </div>
  );
}