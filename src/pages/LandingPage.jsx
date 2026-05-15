import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { getLeaderboard } from "../api/skillsbetApi";
import "../styles/landing.css";

const GAMES = [
  { key: "snake",    label: "Viper",      emoji: "🐍", desc: "Mange, grandis, domine" },
  { key: "reflex",   label: "QuickShot",  emoji: "⚡", desc: "Réflexes d'élite" },
  { key: "lineup4",  label: "LineUp4",    emoji: "🟡", desc: "4 en ligne, victoire" },
  { key: "xobattle", label: "XO Battle",  emoji: "❌", desc: "Morpion stratégique" },
  { key: "memory",   label: "FlipMatch",  emoji: "🧠", desc: "Mémoire parfaite" },
  { key: "tetris",   label: "BlockDrop",  emoji: "🧱", desc: "Empile et écrase" },
  { key: "checkers", label: "DraughtWar", emoji: "⚔️", desc: "Tactique de guerre" },
  { key: "chess",    label: "KingSlayer", emoji: "♟️", desc: "Le roi doit tomber" },
  { key: "uno",      label: "ColorBlitz", emoji: "🃏", desc: "Couleurs explosives" },
  { key: "2048",     label: "GridBlitz",  emoji: "🔢", desc: "Fusionne jusqu'à 2048" },
];

const FEATURES = [
  { icon: "🎮", title: "10 JEUX UNIQUES",       desc: "Du snake au chess, 10 mini-jeux conçus pour des duels intenses." },
  { icon: "🤖", title: "MODE SOLO IA",           desc: "Entraîne-toi contre notre IA adaptative avant d'affronter de vrais joueurs." },
  { icon: "⚔️", title: "DUELS EN TEMPS RÉEL",   desc: "Lance un défi et joue contre ton adversaire en temps réel." },
  { icon: "🌍", title: "CLASSEMENT MONDIAL",     desc: "Grimpe dans le classement ELO et représente ton pays." },
  { icon: "🎨", title: "6 THÈMES VISUELS",       desc: "Personnalise l'interface avec 6 thèmes de couleurs exclusifs." },
  { icon: "💬", title: "CHAT EN DUEL",           desc: "Communique avec ton adversaire pendant la partie." },
];

const PLATFORM_STATS = [
  { icon: "👥", target: 1247,  label: "Joueurs inscrits",  suffix: "+" },
  { icon: "🎮", target: 38920, label: "Parties jouées",    suffix: "" },
  { icon: "🌍", target: 42,    label: "Pays représentés",  suffix: "" },
];

/* ── Animated canvas background ── */
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const GRID = 70;

    const particles = Array.from({ length: 55 }, () => ({
      x:     Math.random() * width,
      y:     Math.random() * height,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      size:  Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255,107,0,0.045)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += GRID) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y <= height; y += GRID) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)      p.x = width;
        if (p.x > width)  p.x = 0;
        if (p.y < 0)      p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,107,0,${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="landing-canvas" aria-hidden="true" />;
}

/* ── Intersection observer hook ── */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Count-up hook ── */
function useCountUp(ref, target, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          el.closest(".stat-item")?.classList.add("counted");
          let startTime = null;
          const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, target, duration]);

  return count;
}

/* ── Single stat item ── */
function StatItem({ icon, target, label, suffix }) {
  const ref = useRef(null);
  const count = useCountUp(ref, target);

  return (
    <div className="stat-item">
      <span className="stat-item__icon">{icon}</span>
      <span ref={ref} className="stat-item__num">
        {count.toLocaleString("fr-FR")}{suffix}
      </span>
      <span className="stat-item__label">{label}</span>
    </div>
  );
}

/* ── Leaderboard section ── */
function PublicLeaderboard() {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    getLeaderboard()
      .then((data) => {
        const normalized = (data || []).map((row) => ({
          player:  row.player,
          elo:     row.elo     ?? row.display_elo  ?? 0,
          wins:    row.wins    ?? row.display_wins ?? 0,
        }));
        setPlayers(normalized.slice(0, 5));
      })
      .catch(() => setPlayers([]));
  }, []);

  const medalClass = (i) => {
    if (i === 0) return "lb-item lb-item--gold";
    if (i === 1) return "lb-item lb-item--silver";
    if (i === 2) return "lb-item lb-item--bronze";
    return "lb-item";
  };

  const rankDisplay = (i) => {
    if (i === 0) return { text: "🥇", cls: "lb-rank lb-rank--1" };
    if (i === 1) return { text: "🥈", cls: "lb-rank lb-rank--2" };
    if (i === 2) return { text: "🥉", cls: "lb-rank lb-rank--3" };
    return { text: `#${i + 1}`, cls: "lb-rank lb-rank--other" };
  };

  if (players === null)
    return <p className="lb-loading">Chargement du classement</p>;

  if (players.length === 0)
    return <p className="lb-empty">Classement indisponible pour le moment.</p>;

  return (
    <div className="landing-leaderboard">
      {players.map((p, i) => {
        const { text, cls } = rankDisplay(i);
        return (
          <div key={p.player} className={medalClass(i)}>
            <span className={cls}>{text}</span>
            <span className="lb-player">{p.player}</span>
            <div className="lb-stats">
              <div className="lb-stat">
                <div className="lb-stat__label">ELO</div>
                <div className="lb-stat__val lb-stat__val--elo">{p.elo}</div>
              </div>
              <div className="lb-stat">
                <div className="lb-stat__label">Victoires</div>
                <div className="lb-stat__val">{p.wins}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ── */
export default function LandingPage() {
  const { playerId } = useContext(PlayerContext);
  const navigate = useNavigate();

  useReveal();

  useEffect(() => {
    if (playerId) navigate("/lobby", { replace: true });
  }, [playerId, navigate]);

  return (
    <div className="landing-page">
      <AnimatedBackground />

      {/* Navbar */}
      <nav className="landing-nav">
        <span className="landing-nav__logo">SKILLS<span>BET</span></span>
        <div className="landing-nav__actions">
          <Link to="/login" className="hero-btn hero-btn--ghost" style={{ padding: "10px 22px", fontSize: "0.88rem" }}>
            CONNEXION
          </Link>
          <Link to="/login" className="hero-btn hero-btn--primary" style={{ padding: "10px 22px", fontSize: "0.88rem" }}>
            S'INSCRIRE
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span className="hero-badge__dot" />
          Plateforme de duels &amp; paris virtuels
        </div>

        <h1 className="hero-logo">SKILLS<span>BET</span></h1>
        <p className="hero-tagline">COMPETE · WIN · DOMINATE</p>
        <p className="hero-subtitle">
          La plateforme de duels de mini-jeux avec paris en jetons virtuels.<br />
          10 jeux, une IA redoutable, un classement mondial.
        </p>

        <div className="hero-cta">
          <Link to="/login" className="hero-btn hero-btn--primary">
            ⚡ JOUER MAINTENANT
          </Link>
          <Link to="/login" className="hero-btn hero-btn--ghost">
            CRÉER UN COMPTE
          </Link>
        </div>

        <div className="hero-scroll-hint">
          <span>Découvrir</span>
          <span className="hero-scroll-hint__arrow" />
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Games ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Mini-jeux</span>
          <h2 className="section-title">10 JEUX <span>UNIQUES</span></h2>
          <p className="section-desc">Chaque jeu est optimisé pour des duels 1v1 intenses et des sessions solo contre l'IA.</p>
        </div>

        <div className="games-grid">
          {GAMES.map((g, i) => (
            <div
              key={g.key}
              className={`game-card reveal reveal-delay-${Math.min(i % 5 + 1, 5)}`}
            >
              <span className="game-card__emoji">{g.emoji}</span>
              <span className="game-card__name">{g.label}</span>
              <span className="game-card__desc">{g.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Features ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Fonctionnalités</span>
          <h2 className="section-title">TOUT POUR <span>GAGNER</span></h2>
          <p className="section-desc">Une plateforme complète conçue pour les compétiteurs sérieux.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`feature-card reveal reveal-delay-${Math.min(i + 1, 5)}`}
            >
              <span className="feature-card__icon">{f.icon}</span>
              <span className="feature-card__title">{f.title}</span>
              <span className="feature-card__desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Leaderboard ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Classement</span>
          <h2 className="section-title">TOP <span>JOUEURS</span></h2>
          <p className="section-desc">Les meilleurs joueurs de la plateforme en temps réel.</p>
        </div>

        <div className="reveal">
          <PublicLeaderboard />
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/login" className="hero-btn hero-btn--ghost" style={{ display: "inline-flex" }}>
            REJOINDRE LE CLASSEMENT →
          </Link>
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Platform stats ── */}
      <div className="landing-stats-bg">
        <section className="landing-section" style={{ paddingTop: 64, paddingBottom: 64 }}>
          <div className="section-header reveal">
            <span className="section-label">En chiffres</span>
            <h2 className="section-title">LA PLATEFORME <span>EN LIVE</span></h2>
          </div>

          <div className="stats-grid">
            {PLATFORM_STATS.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </section>
      </div>

      <div className="landing-divider" />

      {/* ── CTA Banner ── */}
      <section className="landing-section" style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}>
        <div className="reveal">
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            PRÊT À <span>DOMINER</span> ?
          </h2>
          <p className="section-desc" style={{ marginBottom: 36 }}>
            Rejoins des milliers de joueurs et prouve ta valeur dans l'arène.
          </p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <Link to="/login" className="hero-btn hero-btn--primary">
              ⚡ COMMENCER GRATUITEMENT
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__logo">SKILLS<span>BET</span></div>

          <nav className="landing-footer__links" aria-label="Liens légaux">
            <a href="/cgu">Conditions générales d'utilisation</a>
            <a href="/privacy">Politique de confidentialité</a>
            <a href="/contact">Contact</a>
            <a href="/responsible-gaming">Jeu responsable</a>
          </nav>

          <p className="landing-footer__copy">
            © 2026 SkillsBets — Tous droits réservés. Paris en jetons virtuels uniquement.
          </p>
        </div>
      </footer>
    </div>
  );
}
