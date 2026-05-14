import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { getGameById, incrementPlays } from "../api/creatorApi";
import SessionBar from "../components/SessionBar";
import CreatorGameSandbox from "../components/CreatorGameSandbox";

const CATEGORY_LABELS = {
  action: "Action", puzzle: "Puzzle", board: "Jeu de plateau",
  card: "Cartes", platformer: "Platformer", casual: "Casual", other: "Autre",
};

export default function CreatorGamePage() {
  const { id } = useParams();
  const { playerId } = useContext(PlayerContext);

  const [game, setGame]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const g = getGameById(id);
    setGame(g?.status === "approved" ? g : null);
    setLoading(false);
  }, [id]);

  function handlePlay() {
    incrementPlays(id);
    setGame((prev) => prev ? { ...prev, plays: (prev.plays || 0) + 1 } : prev);
    setPlaying(true);
  }

  if (loading) {
    return (
      <div className="app-shell">
        <SessionBar />
        <p style={{ padding: 24 }}>Chargement…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="app-shell">
        <SessionBar />
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px", fontFamily: "var(--font-heading)", fontWeight: 900, color: "var(--clr-orange)" }}>404</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "12px" }}>
            Jeu introuvable
          </div>
          <p style={{ color: "var(--clr-text-muted)", marginBottom: "24px" }}>
            Ce jeu n'existe pas ou n'est pas encore approuvé.
          </p>
          <Link to="/" style={{ padding: "12px 28px", background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.4)", borderRadius: "8px", color: "var(--clr-orange)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Retour au lobby
          </Link>
        </div>
      </div>
    );
  }

  const freeUntil = game.free_until ? new Date(game.free_until) : null;
  const isFree    = freeUntil && freeUntil > new Date();

  return (
    <div className="app-shell">
      <SessionBar />

      <div style={{ padding: "8px 0 20px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600 }}>← Retour au lobby</Link>
        <Link to="/creator" style={{ color: "var(--clr-orange)", textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}>Espace Créateur →</Link>
      </div>

      {/* Header */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "28px", flexWrap: "wrap", alignItems: "flex-start" }}>
        {game.screenshot && (
          <img
            src={game.screenshot}
            alt={game.name}
            style={{ width: "160px", height: "120px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--clr-border)", flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
            <span style={{ padding: "3px 10px", background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 800, color: "var(--clr-orange)", textTransform: "uppercase" }}>
              {CATEGORY_LABELS[game.category] || game.category}
            </span>
            {isFree ? (
              <span style={{ padding: "3px 10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 800, color: "#22c55e", textTransform: "uppercase" }}>
                Gratuit
              </span>
            ) : (
              <span style={{ padding: "3px 10px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 800, color: "#a855f7", textTransform: "uppercase" }}>
                Premium
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
            {game.name}
          </h1>
          {game.description && (
            <p style={{ color: "var(--clr-text-muted)", marginBottom: "12px", fontSize: "0.9rem", lineHeight: 1.6 }}>{game.description}</p>
          )}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
              Créateur : <strong style={{ color: "var(--clr-text)" }}>{game.creator_id}</strong>
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
              Parties : <strong style={{ color: "var(--clr-orange)" }}>{game.plays || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Game area */}
      {playing ? (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.85rem", color: "var(--clr-orange)" }}>
              En jeu — Sandboxé
            </span>
            <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.75rem" }} onClick={() => setPlaying(false)}>
              Quitter
            </button>
          </div>
          <CreatorGameSandbox code={game.code} height="560px" />
        </div>
      ) : (
        <div style={{
          background: "var(--clr-surface-1)", border: "1px solid var(--clr-border)", borderRadius: "12px",
          padding: "48px 24px", textAlign: "center", marginBottom: "24px",
        }}>
          {!isFree && (
            <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", padding: "12px 20px", marginBottom: "24px", fontSize: "0.82rem", color: "#a855f7" }}>
              Ce jeu nécessite un abonnement Premium pour être joué.
            </div>
          )}
          {game.screenshot && (
            <img src={game.screenshot} alt={game.name} style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain", borderRadius: "8px", marginBottom: "24px", opacity: 0.6 }} />
          )}
          <button onClick={handlePlay} disabled={!isFree} style={{ padding: "14px 40px", fontSize: "1rem" }}>
            {isFree ? "▶ Jouer maintenant" : "🔒 Premium requis"}
          </button>
          {!isFree && (
            <div style={{ marginTop: "16px" }}>
              <Link to="/creator" style={{ color: "var(--clr-orange)", fontSize: "0.82rem", textDecoration: "none" }}>
                Devenir créateur Premium →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div style={{ background: "var(--clr-surface-1)", border: "1px solid var(--clr-border)", borderRadius: "10px", padding: "16px 20px" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-muted)", marginBottom: "12px" }}>
          Informations
        </div>
        <div className="stats-grid">
          {[
            { label: "Créateur",       value: game.creator_id },
            { label: "Catégorie",      value: CATEGORY_LABELS[game.category] || game.category },
            { label: "Parties jouées", value: game.plays || 0,  color: "var(--clr-orange)" },
            { label: "Publié le",      value: game.approved_at ? new Date(game.approved_at).toLocaleDateString("fr-FR") : "—" },
          ].map((s) => (
            <div key={s.label} className="stat-box" style={{ padding: "12px" }}>
              <strong style={{ fontSize: "0.72rem" }}>{s.label}</strong>
              <div style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
