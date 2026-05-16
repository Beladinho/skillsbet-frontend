import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { getLeaderboard } from "../api/skillsbetApi";
import { t } from "../i18n";
import { openChat } from "../hooks/useCrisp";
import "../styles/landing.css";

const browserLang = navigator.language?.startsWith("en") ? "en" : "fr";
const tr = (key) => t(browserLang, key);

const GAMES_DATA = {
  fr: [
    { key: "snake",    label: "Viper",      emoji: "🐍", desc: "Mange, grandis, domine",  isNew: false },
    { key: "reflex",   label: "QuickShot",  emoji: "⚡", desc: "Réflexes d'élite",         isNew: false },
    { key: "lineup4",  label: "LineUp4",    emoji: "🟡", desc: "4 en ligne, victoire",      isNew: true  },
    { key: "xobattle", label: "XO Battle",  emoji: "❌", desc: "Morpion stratégique",       isNew: true  },
    { key: "memory",   label: "FlipMatch",  emoji: "🧠", desc: "Mémoire parfaite",          isNew: false },
    { key: "tetris",   label: "BlockDrop",  emoji: "🧱", desc: "Empile et écrase",          isNew: false },
    { key: "checkers", label: "DraughtWar", emoji: "⚔️", desc: "Tactique de guerre",       isNew: false },
    { key: "chess",    label: "KingSlayer", emoji: "♟️", desc: "Le roi doit tomber",       isNew: false },
    { key: "uno",      label: "ColorBlitz", emoji: "🃏", desc: "Couleurs explosives",       isNew: false },
    { key: "2048",     label: "GridBlitz",  emoji: "🔢", desc: "Fusionne jusqu'à 2048",    isNew: true  },
  ],
  en: [
    { key: "snake",    label: "Viper",      emoji: "🐍", desc: "Eat, grow, dominate",       isNew: false },
    { key: "reflex",   label: "QuickShot",  emoji: "⚡", desc: "Elite reflexes",            isNew: false },
    { key: "lineup4",  label: "LineUp4",    emoji: "🟡", desc: "4 in a row, victory",       isNew: true  },
    { key: "xobattle", label: "XO Battle",  emoji: "❌", desc: "Strategic tic-tac-toe",     isNew: true  },
    { key: "memory",   label: "FlipMatch",  emoji: "🧠", desc: "Perfect memory",            isNew: false },
    { key: "tetris",   label: "BlockDrop",  emoji: "🧱", desc: "Stack and crush",           isNew: false },
    { key: "checkers", label: "DraughtWar", emoji: "⚔️", desc: "War tactics",              isNew: false },
    { key: "chess",    label: "KingSlayer", emoji: "♟️", desc: "The king must fall",       isNew: false },
    { key: "uno",      label: "ColorBlitz", emoji: "🃏", desc: "Explosive colors",          isNew: false },
    { key: "2048",     label: "GridBlitz",  emoji: "🔢", desc: "Merge up to 2048",          isNew: true  },
  ],
};
const GAMES = GAMES_DATA[browserLang] || GAMES_DATA.fr;

const FEATURES_DATA = {
  fr: [
    { icon: "🎮", title: "10 JEUX UNIQUES",       desc: "Du snake au chess, 10 mini-jeux conçus pour des duels intenses." },
    { icon: "🤖", title: "MODE SOLO IA",           desc: "Entraîne-toi contre notre IA adaptative avant d'affronter de vrais joueurs." },
    { icon: "⚔️", title: "DUELS EN TEMPS RÉEL",   desc: "Lance un défi et joue contre ton adversaire en temps réel." },
    { icon: "🌍", title: "CLASSEMENT MONDIAL",     desc: "Grimpe dans le classement ELO et représente ton pays." },
    { icon: "🎨", title: "6 THÈMES VISUELS",       desc: "Personnalise l'interface avec 6 thèmes de couleurs exclusifs." },
    { icon: "💬", title: "CHAT EN DUEL",           desc: "Communique avec ton adversaire pendant la partie." },
  ],
  en: [
    { icon: "🎮", title: "10 UNIQUE GAMES",        desc: "From snake to chess, 10 mini-games built for intense duels." },
    { icon: "🤖", title: "SOLO AI MODE",           desc: "Train against our adaptive AI before facing real players." },
    { icon: "⚔️", title: "REAL-TIME DUELS",       desc: "Challenge someone and play against your opponent in real time." },
    { icon: "🌍", title: "WORLD RANKINGS",         desc: "Climb the ELO leaderboard and represent your country." },
    { icon: "🎨", title: "6 VISUAL THEMES",        desc: "Customize the interface with 6 exclusive color themes." },
    { icon: "💬", title: "IN-DUEL CHAT",           desc: "Communicate with your opponent during the game." },
  ],
};
const FEATURES = FEATURES_DATA[browserLang] || FEATURES_DATA.fr;

const HOW_IT_WORKS_DATA = {
  fr: [
    {
      step: "01",
      icon: "👤",
      title: "CRÉE TON COMPTE",
      desc: "Inscription gratuite en 30 secondes. Choisis ton avatar et ton pseudo de légende.",
    },
    {
      step: "02",
      icon: "🎮",
      title: "CHOISIS TON JEU",
      desc: "10 jeux t'attendent. Entraîne-toi contre l'IA avant d'entrer dans l'arène.",
    },
    {
      step: "03",
      icon: "⚔️",
      title: "DÉFIE ET GAGNE",
      desc: "Lance un défi, mise tes jetons et prouve que tu es le meilleur. Grimpe dans les classements.",
    },
  ],
  en: [
    {
      step: "01",
      icon: "👤",
      title: "CREATE YOUR ACCOUNT",
      desc: "Free sign-up in 30 seconds. Pick your avatar and legendary username.",
    },
    {
      step: "02",
      icon: "🎮",
      title: "CHOOSE YOUR GAME",
      desc: "10 games await. Train against AI before entering the arena.",
    },
    {
      step: "03",
      icon: "⚔️",
      title: "CHALLENGE AND WIN",
      desc: "Start a duel, stake your tokens and prove you're the best. Climb the rankings.",
    },
  ],
};
const HOW_IT_WORKS = HOW_IT_WORKS_DATA[browserLang] || HOW_IT_WORKS_DATA.fr;

const TESTIMONIALS = [
  {
    avatar: "🎯",
    name: "SnipeKing_FR",
    country: "🇫🇷",
    rating: 5,
    text: "Incroyable plateforme ! J'ai passé des heures sur QuickShot. L'IA est vraiment redoutable, parfait pour progresser.",
  },
  {
    avatar: "⚡",
    name: "xX_L1ghtn1ng_Xx",
    country: "🇧🇪",
    rating: 5,
    text: "Les duels en temps réel sont ultra addictifs. J'ai grimpé top 50 en 2 semaines, je reviens chaque soir !",
  },
  {
    avatar: "🐍",
    name: "ViperMaster99",
    country: "🇨🇭",
    rating: 5,
    text: "Le système ELO est top. Ça motive vraiment à s'améliorer. Meilleur site de duels que j'ai testé.",
  },
  {
    avatar: "♟️",
    name: "ChessSlayer2026",
    country: "🇫🇷",
    rating: 5,
    text: "KingSlayer m'a totalement accroché. Les tournois planifiés c'est la cerise sur le gâteau !",
  },
];

const PLATFORM_STATS_DATA = {
  fr: [
    { icon: "👥", target: 1247,  label: "Joueurs inscrits",  suffix: "+" },
    { icon: "🎮", target: 38920, label: "Parties jouées",    suffix: "" },
    { icon: "🌍", target: 42,    label: "Pays représentés",  suffix: "" },
  ],
  en: [
    { icon: "👥", target: 1247,  label: "Registered players", suffix: "+" },
    { icon: "🎮", target: 38920, label: "Games played",        suffix: "" },
    { icon: "🌍", target: 42,    label: "Countries represented", suffix: "" },
  ],
};
const PLATFORM_STATS = PLATFORM_STATS_DATA[browserLang] || PLATFORM_STATS_DATA.fr;

const JOIN_STATS_DATA = {
  fr: [
    { num: "1 247", suffix: "+", label: "JOUEURS INSCRITS" },
    { num: "38 920", suffix: "", label: "PARTIES JOUÉES" },
    { num: "42", suffix: "", label: "PAYS REPRÉSENTÉS" },
    { num: "100", suffix: "%", label: "GRATUIT" },
  ],
  en: [
    { num: "1 247", suffix: "+", label: "REGISTERED PLAYERS" },
    { num: "38 920", suffix: "", label: "GAMES PLAYED" },
    { num: "42", suffix: "", label: "COUNTRIES REPRESENTED" },
    { num: "100", suffix: "%", label: "FREE" },
  ],
};
const JOIN_STATS = JOIN_STATS_DATA[browserLang] || JOIN_STATS_DATA.fr;

/* ── Improved canvas background with 3D perspective grid ── */
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let offset = 0;

    const particles = Array.from({ length: 65 }, () => ({
      x:     Math.random() * width,
      y:     Math.random() * height,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      size:  Math.random() * 2.2 + 0.4,
      alpha: Math.random() * 0.55 + 0.08,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      offset += 0.4;

      const vanishX = width / 2;
      const horizon = height * 0.38;
      const cols = 12;

      // Vertical perspective lines
      for (let i = 0; i <= cols; i++) {
        const x = (i / cols) * width;
        const alpha = 0.025 + 0.03 * Math.sin((i / cols) * Math.PI);
        ctx.strokeStyle = `rgba(255,107,0,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizon);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal perspective lines (animated scroll)
      for (let j = 1; j <= 10; j++) {
        const t = ((j / 10 + offset / 900) % 1);
        const perspT = t * t;
        const y = horizon + (height - horizon) * perspT;
        const xSpread = perspT;
        const xLeft  = vanishX - vanishX * xSpread;
        const xRight = vanishX + (width - vanishX) * xSpread;
        const alpha = 0.015 + 0.055 * perspT;
        ctx.strokeStyle = `rgba(255,107,0,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xLeft, y);
        ctx.lineTo(xRight, y);
        ctx.stroke();
      }

      // Particles
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

      // Connect nearby particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;
          if (dist < 12000) {
            const alpha = 0.045 * (1 - dist / 12000);
            ctx.strokeStyle = `rgba(255,107,0,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
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

/* ── Typewriter text ── */
function TypewriterText({ text, startDelay = 0 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let outer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 55);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(outer);
  }, [text, startDelay]);

  return (
    <span aria-label={text}>
      {displayed}
      {!done && <span className="typewriter-cursor">|</span>}
    </span>
  );
}

/* ── Online players counter ── */
function OnlineCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const base = 43 + Math.floor(Math.random() * 74);
    setCount(base);
    const id = setInterval(() => {
      setCount((prev) => Math.max(28, prev + Math.floor(Math.random() * 7) - 3));
    }, 4500);
    return () => clearInterval(id);
  }, []);

  if (count === null) return null;

  return (
    <div className="online-counter">
      <span className="online-counter__dot" />
      <span className="online-counter__num">{count}</span>
      <span className="online-counter__label">joueurs en ligne maintenant</span>
    </div>
  );
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
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Parallax on scroll ── */
function useParallax() {
  useEffect(() => {
    const heroParallax = document.querySelector(".hero-parallax");
    const handleScroll = () => {
      if (!heroParallax) return;
      const scrolled = window.scrollY;
      heroParallax.style.transform = `translateY(${scrolled * 0.28}px)`;
      heroParallax.style.opacity   = String(Math.max(0, 1 - scrolled / 520));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

/* ── Star rating ── */
function Stars({ rating }) {
  return (
    <div className="stars" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "star star--on" : "star"}>★</span>
      ))}
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
          player: row.player,
          elo:    row.elo     ?? row.display_elo  ?? 0,
          wins:   row.wins    ?? row.display_wins ?? 0,
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
  useParallax();

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
            {tr("landingCta2")}
          </Link>
          <Link to="/login" className="hero-btn hero-btn--primary" style={{ padding: "10px 22px", fontSize: "0.88rem" }}>
            {tr("landingJoinCta1")}
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-parallax">
          <div className="hero-badge">
            <span className="hero-badge__dot" />
            {tr("landingBadgeText")}
          </div>

          <h1 className="hero-logo">SKILLS<span>BET</span></h1>

          <p className="hero-tagline">
            <TypewriterText text="COMPETE · WIN · DOMINATE" startDelay={600} />
          </p>

          <p className="hero-subtitle">
            {tr("landingSubtitle")}
          </p>

          <OnlineCounter />

          <div className="hero-cta">
            <Link to="/login" className="hero-btn hero-btn--primary">
              ⚡ {tr("landingCta1")}
            </Link>
            <Link to="/login" className="hero-btn hero-btn--ghost">
              {tr("landingJoinCta1")}
            </Link>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>{tr("landingScrollHint")}</span>
          <span className="hero-scroll-hint__arrow" />
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── How it works ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Simple &amp; rapide</span>
          <h2 className="section-title">{tr("landingHowItWorks")}</h2>
          <p className="section-desc">Rejoins l'arène en 3 étapes. Aucune carte bancaire requise.</p>
        </div>

        <div className="how-grid">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className={`how-step reveal reveal-delay-${i + 1}`}>
              <div className="how-step__connector" />
              <div className="how-step__num">{step.step}</div>
              <div className="how-step__icon">{step.icon}</div>
              <div className="how-step__title">{step.title}</div>
              <div className="how-step__desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Games ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Mini-jeux</span>
          <h2 className="section-title">{tr("landingGames")}</h2>
          <p className="section-desc">{tr("landingGamesDesc")}</p>
        </div>

        <div className="games-grid">
          {GAMES.map((g, i) => (
            <div
              key={g.key}
              className={`game-card reveal reveal-delay-${Math.min(i % 5 + 1, 5)}`}
            >
              {g.isNew && <span className="game-badge game-badge--new">NOUVEAU</span>}
              <span className="game-card__emoji">{g.emoji}</span>
              <span className="game-card__name">{g.label}</span>
              <span className="game-card__desc">{g.desc}</span>
              <span className="game-badge game-badge--solo">SOLO IA</span>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Features ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Fonctionnalités</span>
          <h2 className="section-title">{tr("landingFeatures")}</h2>
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

      {/* ── Testimonials ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Communauté</span>
          <h2 className="section-title">{tr("landingTestimonials")}</h2>
          <p className="section-desc">Des milliers de joueurs nous font confiance. Rejoins-les.</p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`testimonial-card reveal reveal-delay-${i + 1}`}>
              <div className="testimonial-card__header">
                <span className="testimonial-card__avatar">{t.avatar}</span>
                <div className="testimonial-card__meta">
                  <span className="testimonial-card__name">{t.name} {t.country}</span>
                  <Stars rating={t.rating} />
                </div>
              </div>
              <p className="testimonial-card__text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-divider" />

      {/* ── Leaderboard ── */}
      <section className="landing-section">
        <div className="section-header reveal">
          <span className="section-label">Classement</span>
          <h2 className="section-title">{tr("landingTopPlayers")}</h2>
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

      {/* ── Join competition CTA ── */}
      <section className="join-section reveal">
        <div className="join-section__bg" aria-hidden="true" />
        <div className="join-section__inner">
          <span className="section-label" style={{ color: "rgba(255,255,255,0.7)" }}>Rejoins l'arène</span>
          <h2 className="join-section__title">{tr("landingJoinTitle")}</h2>
          <p className="join-section__sub">
            {tr("landingJoinSubtitle")}
          </p>

          <div className="join-stats">
            {JOIN_STATS.map((s) => (
              <div key={s.label} className="join-stat">
                <span className="join-stat__num">{s.num}<span className="join-stat__suffix">{s.suffix}</span></span>
                <span className="join-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-cta" style={{ justifyContent: "center", marginTop: 40 }}>
            <Link to="/login" className="hero-btn hero-btn--white">
              ⚡ {tr("landingJoinCta1")}
            </Link>
            <Link to="/login" className="hero-btn hero-btn--outline-white">
              {tr("landingJoinCta2")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__logo">SKILLS<span>BET</span></div>

          <nav className="landing-footer__links" aria-label="Liens légaux">
            <a href="/legal/cgu">Conditions générales d'utilisation</a>
            <a href="/legal/privacy">Politique de confidentialité</a>
            <a href="/legal/responsible-gaming">Jeu responsable</a>
            <a href="/legal/contact">Contact</a>
            <button
              onClick={openChat}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }}
            >
              💬 Support
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openCookieSettings"))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }}
            >
              Gérer mes cookies
            </button>
          </nav>

          <p className="landing-footer__copy">
            © 2026 SkillsBets — Tous droits réservés. Paris en jetons virtuels uniquement.
          </p>
        </div>
      </footer>
    </div>
  );
}
