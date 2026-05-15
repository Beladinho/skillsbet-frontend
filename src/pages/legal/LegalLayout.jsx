import { Link } from "react-router-dom";
import "./legal.css";

export default function LegalLayout({ title, icon, children }) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="legal-header__inner">
          <Link to="/" className="legal-logo">
            SKILLS<span>BET</span>
          </Link>
          <nav className="legal-nav">
            <Link to="/legal/cgu">CGU</Link>
            <Link to="/legal/privacy">Confidentialité</Link>
            <Link to="/legal/responsible-gaming">Jeu responsable</Link>
            <Link to="/legal/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="legal-main">
        <div className="legal-container">
          <div className="legal-title-block">
            {icon && <span className="legal-title-icon">{icon}</span>}
            <h1 className="legal-title">{title}</h1>
          </div>
          <div className="legal-body">{children}</div>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="legal-footer__inner">
          <span>© 2026 SkillsBets — Tous droits réservés.</span>
          <nav>
            <Link to="/legal/cgu">CGU</Link>
            <Link to="/legal/privacy">Confidentialité</Link>
            <Link to="/legal/responsible-gaming">Jeu responsable</Link>
            <Link to="/legal/contact">Contact</Link>
            <Link to="/">Retour à l'accueil</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
