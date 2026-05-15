import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useCreator } from "../context/CreatorContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import SessionBar from "../components/SessionBar";
import SectionCard from "../components/SectionCard";

const CATEGORIES = [
  { value: "action",     label: "Action" },
  { value: "puzzle",     label: "Puzzle" },
  { value: "board",      label: "Jeu de plateau" },
  { value: "card",       label: "Cartes" },
  { value: "platformer", label: "Platformer" },
  { value: "casual",     label: "Casual" },
  { value: "other",      label: "Autre" },
];

const STATUS_CFG = {
  pending:  { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)"  },
  approved: { label: "Approuvé",   color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   },
  rejected: { label: "Rejeté",     color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   },
};

const LABEL_STYLE = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--clr-text-muted)",
  marginBottom: "8px",
};

export default function CreatorDashboard() {
  const { playerId } = useContext(PlayerContext);
  const { myGames, loadMyGames, submitGame } = useCreator();
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "casual", code: "", screenshot: null });
  const [codeFileName, setCodeFileName] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const codeInputRef = useRef();
  const screenshotInputRef = useRef();

  useEffect(() => {
    if (playerId) loadMyGames(playerId);
  }, [playerId, loadMyGames]);

  async function handleCodeFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCodeFileName(file.name);
    const text = await file.text();
    setForm((p) => ({ ...p, code: text }));
  }

  function handleScreenshot(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setScreenshotPreview(evt.target.result);
      setForm((p) => ({ ...p, screenshot: evt.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { notifyError("Soumission", "Le nom du jeu est requis."); return; }
    if (!form.code.trim()) { notifyError("Soumission", "Le fichier de jeu est requis."); return; }
    setSubmitting(true);
    playClick();
    try {
      submitGame({ creator_id: playerId, name: form.name.trim(), description: form.description.trim(), category: form.category, code: form.code, screenshot: form.screenshot });
      notifySuccess("Soumission envoyée", "Votre jeu est en attente de révision (délai : 48h).");
      setForm({ name: "", description: "", category: "casual", code: "", screenshot: null });
      setCodeFileName("");
      setScreenshotPreview(null);
      setActiveTab("games");
    } catch (err) {
      notifyError("Erreur", err.message || "Impossible de soumettre le jeu.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalPlays    = myGames.reduce((s, g) => s + (g.plays || 0), 0);
  const totalRevenue  = myGames.reduce((s, g) => s + (g.creator_revenue || 0), 0);
  const approvedCount = myGames.filter((g) => g.status === "approved").length;

  return (
    <div className="app-shell">
      <SessionBar />

      <div style={{ padding: "8px 0 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to="/lobby" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600 }}>
          ← Retour au lobby
        </Link>
        <span style={{
          padding: "3px 12px",
          background: "rgba(255,107,0,0.1)",
          border: "1px solid rgba(255,107,0,0.3)",
          borderRadius: "20px",
          fontSize: "0.7rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--clr-orange)",
        }}>
          Espace Créateur
        </span>
      </div>

      <div style={{ marginBottom: "28px" }}>
        <h1 className="hero-title" style={{ fontSize: "2rem" }}>Programme Créateur</h1>
        <p className="hero-subtitle">Soumettez vos mini-jeux React et monétisez votre talent.</p>
      </div>

      {/* Economic model banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,0,0.07), rgba(255,107,0,0.02))",
        border: "1px solid rgba(255,107,0,0.22)",
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "20px",
      }}>
        {[
          { icon: "🎮", title: "1 semaine gratuite", desc: "Après approbation de votre jeu" },
          { icon: "💎", title: "Abonnement Premium", desc: "Pour continuer à publier au-delà" },
          { icon: "💰", title: "70% des revenus",    desc: "Vous recevez 70% de chaque partie" },
          { icon: "⚡", title: "Révision sous 48h",  desc: "L'équipe examine votre soumission" },
        ].map((item) => (
          <div key={item.title}>
            <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{item.icon}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--clr-orange)", marginBottom: "4px" }}>
              {item.title}
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--clr-text-muted)" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="inline-button-group" style={{ marginBottom: "24px" }}>
        {[
          { key: "dashboard", label: "Tableau de bord" },
          { key: "submit",    label: "Soumettre un jeu" },
          { key: "games",     label: `Mes jeux (${myGames.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "" : "btn-ghost"}
            style={{ padding: "8px 18px", fontSize: "0.82rem" }}
            onClick={() => { setActiveTab(tab.key); playClick(); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {activeTab === "dashboard" && (
        <>
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            {[
              { label: "Jeux approuvés",   value: approvedCount },
              { label: "Parties jouées",   value: totalPlays.toLocaleString("fr-FR") },
              { label: "Vos revenus (70%)", value: `${totalRevenue.toFixed(2)} €` },
              { label: "Jeux soumis",      value: myGames.length },
            ].map((s) => (
              <div key={s.label} className="stat-box">
                <strong>{s.label}</strong>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--clr-orange)", marginTop: "4px" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <SectionCard title="Guide de démarrage">
            <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { step: "Créez votre mini-jeu en React/JS",   detail: "Votre composant principal doit s'appeler Game ou App." },
                { step: "Soumettez votre jeu",                detail: "Ajoutez un nom, une description et uploadez votre fichier .jsx/.js." },
                { step: "Attente de révision",                detail: "L'équipe SkillsBet examine votre soumission sous 48h." },
                { step: "Publication & monétisation",         detail: "1 semaine gratuite puis abonnement Premium. 70% des revenus vous reviennent." },
              ].map((item, i) => (
                <li key={i} style={{ paddingLeft: "8px" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.88rem", color: "var(--clr-orange)", textTransform: "uppercase" }}>{item.step}</span>
                  <div style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", marginTop: "2px" }}>{item.detail}</div>
                </li>
              ))}
            </ol>

            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--clr-border)",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              color: "#94a3b8",
              overflowX: "auto",
            }}>
              <div style={{ color: "var(--clr-orange)", marginBottom: "8px", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.74rem", textTransform: "uppercase" }}>
                Exemple minimal :
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{`function Game() {
  const [score, setScore] = React.useState(0);
  return (
    <div style={{textAlign:'center', padding:'40px'}}>
      <h1 style={{color:'#ff6b00'}}>Mon Jeu</h1>
      <p style={{fontSize:'2rem', margin:'20px 0'}}>{score}</p>
      <button onClick={() => setScore(s => s + 1)}>
        +1 Point
      </button>
    </div>
  );
}`}</pre>
            </div>

            <button
              onClick={() => { setActiveTab("submit"); playClick(); }}
              style={{ marginTop: "24px", width: "100%", padding: "14px", fontSize: "0.95rem" }}
            >
              Soumettre mon jeu
            </button>
          </SectionCard>
        </>
      )}

      {/* ── Submit ── */}
      {activeTab === "submit" && (
        <SectionCard title="Soumettre un mini-jeu">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={LABEL_STYLE}>Nom du jeu *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex : BrickBreaker 2084"
                maxLength={60}
                required
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Décrivez votre jeu en quelques phrases…"
                maxLength={500}
                rows={3}
                style={{ width: "100%", resize: "vertical", minHeight: "80px" }}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Catégorie</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={{ width: "100%" }}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Code upload */}
            <div>
              <label style={LABEL_STYLE}>Fichier du jeu (.jsx ou .js) *</label>
              <div
                onClick={() => codeInputRef.current?.click()}
                style={{
                  border: `2px dashed ${codeFileName ? "rgba(255,107,0,0.55)" : "rgba(255,107,0,0.25)"}`,
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: codeFileName ? "rgba(255,107,0,0.05)" : "transparent",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,0,0.6)"; e.currentTarget.style.background = "rgba(255,107,0,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = codeFileName ? "rgba(255,107,0,0.55)" : "rgba(255,107,0,0.25)"; e.currentTarget.style.background = codeFileName ? "rgba(255,107,0,0.05)" : "transparent"; }}
              >
                <input ref={codeInputRef} type="file" accept=".jsx,.js" onChange={handleCodeFile} style={{ display: "none" }} />
                {codeFileName ? (
                  <>
                    <div style={{ color: "var(--clr-orange)", fontWeight: 800, fontFamily: "var(--font-heading)", marginBottom: "4px" }}>✓ {codeFileName}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)" }}>Cliquez pour changer</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "1.6rem", marginBottom: "8px" }}>📁</div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, textTransform: "uppercase", fontSize: "0.88rem", marginBottom: "4px" }}>
                      Upload votre fichier
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)" }}>Formats acceptés : .jsx, .js</div>
                  </>
                )}
              </div>
            </div>

            {/* Screenshot upload */}
            <div>
              <label style={LABEL_STYLE}>Screenshot (optionnel)</label>
              <div
                onClick={() => screenshotInputRef.current?.click()}
                style={{
                  border: "2px dashed rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <input ref={screenshotInputRef} type="file" accept="image/*" onChange={handleScreenshot} style={{ display: "none" }} />
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Aperçu" style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "6px", objectFit: "contain" }} />
                ) : (
                  <>
                    <div style={{ fontSize: "1.6rem", marginBottom: "8px" }}>🖼️</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>Ajouter un screenshot</div>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px", fontSize: "0.76rem", color: "#22c55e" }}>
              En soumettant, vous acceptez les conditions créateurs SkillsBet. Votre code est examiné avant publication.
            </div>

            <button type="submit" disabled={submitting} style={{ padding: "14px", fontSize: "0.95rem" }}>
              {submitting ? "Envoi en cours…" : "Soumettre le jeu"}
            </button>
          </form>
        </SectionCard>
      )}

      {/* ── My Games ── */}
      {activeTab === "games" && (
        myGames.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "56px 24px",
            background: "var(--clr-surface-1)", border: "1px solid var(--clr-border)", borderRadius: "12px",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎮</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", marginBottom: "8px" }}>Aucun jeu soumis</div>
            <div style={{ color: "var(--clr-text-muted)", marginBottom: "20px" }}>Commencez par soumettre votre premier mini-jeu.</div>
            <button onClick={() => setActiveTab("submit")}>Soumettre un jeu</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {myGames.map((game) => {
              const cfg       = STATUS_CFG[game.status] || STATUS_CFG.pending;
              const isApproved = game.status === "approved";
              const freeUntil  = game.free_until ? new Date(game.free_until) : null;
              const isFree     = freeUntil && freeUntil > new Date();
              return (
                <div key={game.id} style={{
                  background: "var(--clr-surface-1)",
                  border: "1px solid var(--clr-border)",
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: "10px",
                  padding: "20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{game.name}</h3>
                        <span style={{ padding: "3px 10px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "20px", fontSize: "0.68rem", fontWeight: 800, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {cfg.label}
                        </span>
                        {isApproved && isFree && (
                          <span style={{ padding: "3px 10px", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, color: "#22c55e" }}>
                            Gratuit jusqu'au {freeUntil.toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {isApproved && !isFree && (
                          <span style={{ padding: "3px 10px", background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.25)", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, color: "var(--clr-orange)" }}>
                            Premium requis
                          </span>
                        )}
                      </div>
                      {game.description && (
                        <p style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", marginBottom: "8px" }}>{game.description}</p>
                      )}
                      {game.rejection_reason && (
                        <p style={{ fontSize: "0.76rem", color: "#ef4444", background: "rgba(239,68,68,0.05)", padding: "8px 12px", borderRadius: "6px", marginBottom: "8px" }}>
                          Raison : {game.rejection_reason}
                        </p>
                      )}
                      <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)" }}>
                        Soumis le {new Date(game.submitted_at).toLocaleDateString("fr-FR")} · Catégorie : {CATEGORIES.find((c) => c.value === game.category)?.label || game.category}
                      </div>
                    </div>

                    {isApproved && (
                      <Link
                        to={`/creator/game/${game.id}`}
                        style={{
                          padding: "8px 16px",
                          background: "rgba(255,107,0,0.1)",
                          border: "1px solid rgba(255,107,0,0.35)",
                          borderRadius: "8px",
                          color: "var(--clr-orange)",
                          textDecoration: "none",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 800,
                          fontSize: "0.76rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Voir le jeu →
                      </Link>
                    )}
                  </div>

                  {isApproved && (
                    <div className="stats-grid" style={{ marginTop: "16px" }}>
                      {[
                        { label: "Parties jouées",     value: game.plays || 0,                   color: "var(--clr-orange)" },
                        { label: "Vos revenus (70%)",  value: `${(game.creator_revenue||0).toFixed(2)} €`, color: "#22c55e" },
                        { label: "Revenus totaux",     value: `${(game.revenue||0).toFixed(2)} €`,         color: "var(--clr-text)" },
                      ].map((s) => (
                        <div key={s.label} className="stat-box" style={{ padding: "12px" }}>
                          <strong style={{ fontSize: "0.72rem" }}>{s.label}</strong>
                          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
