import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { createScheduledTournament } from "../api/skillsbetApi";

export default function AdminScheduledTournamentsPanel() {
  const { notifySuccess, notifyError } = useNotifications();
  const [name, setName] = useState("Tournoi Viper");
  const [game, setGame] = useState("snake");
  const [entryFee, setEntryFee] = useState(10);
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!scheduledAt) {
      notifyError("Tournoi planifié", "Veuillez définir une date et une heure.");
      return;
    }
    try {
      setLoading(true);
      const isoDate = new Date(scheduledAt).toISOString();
      await createScheduledTournament(name, game, entryFee, false, isoDate, recurrence);
      notifySuccess("Tournoi planifié", `Tournoi "${name}" planifié avec succès.`);
    } catch (e) {
      notifyError("Tournoi planifié", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          textTransform: "uppercase",
          color: "var(--clr-orange)",
          marginBottom: 16,
          letterSpacing: 2,
        }}
      >
        Tournois Planifiés
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <label style={{ color: "#aaa", fontSize: "0.85rem", display: "block", marginBottom: 4 }}>
            Nom du tournoi
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ color: "#aaa", fontSize: "0.85rem", display: "block", marginBottom: 4 }}>
            Jeu
          </label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="snake">Snake</option>
            <option value="reflex">Reflex</option>
            <option value="memory">Memory</option>
            <option value="tetris">Tetris</option>
            <option value="checkers">Dames</option>
            <option value="chess">Échecs</option>
          </select>
        </div>

        <div>
          <label style={{ color: "#aaa", fontSize: "0.85rem", display: "block", marginBottom: 4 }}>
            Frais d&apos;entrée (pts)
          </label>
          <input
            type="number"
            value={entryFee}
            onChange={(e) => setEntryFee(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ color: "#aaa", fontSize: "0.85rem", display: "block", marginBottom: 4 }}>
            Récurrence
          </label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="none">Aucune (unique)</option>
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ color: "#aaa", fontSize: "0.85rem", display: "block", marginBottom: 4 }}>
            Date et heure de début
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div style={{ color: "#666", fontSize: "0.8rem", marginBottom: 12 }}>
        Exemples : tournoi Viper quotidien à 20h, tournoi KingSlayer hebdomadaire le samedi.
        Le tournoi démarrera automatiquement si au moins 2 joueurs sont inscrits.
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          background: loading ? "#333" : "var(--clr-orange)",
          color: loading ? "#666" : "#000",
          border: "none",
          padding: "10px 24px",
          fontFamily: "var(--font-heading)",
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Planification..." : "Planifier le tournoi"}
      </button>
    </div>
  );
}
