import { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import "./legal.css";

const lang = navigator.language?.startsWith("en") ? "en" : "fr";

const NAV_LABELS = {
  fr: {
    cgu: "CGU",
    privacy: "Confidentialité",
    responsible: "Jeu responsable",
    contact: "Contact",
    home: "Retour à l'accueil",
    rights: "© 2026 SkillsBets — Tous droits réservés.",
  },
  en: {
    cgu: "Terms",
    privacy: "Privacy",
    responsible: "Responsible Gaming",
    contact: "Contact",
    home: "Back to home",
    rights: "© 2026 SkillsBets — All rights reserved.",
  },
};

const LegalContext = createContext({ lang: "fr" });

export function useLegalLang() {
  return useContext(LegalContext);
}

export default function LegalLayout({ title, icon, children }) {
  const labels = NAV_LABELS[lang] || NAV_LABELS.fr;

  return (
    <LegalContext.Provider value={{ lang }}>
      <div className="legal-page">
        <header className="legal-header">
          <div className="legal-header__inner">
            <Link to="/" className="legal-logo">
              SKILLS<span>BET</span>
            </Link>
            <nav className="legal-nav">
              <Link to="/legal/cgu">{labels.cgu}</Link>
              <Link to="/legal/privacy">{labels.privacy}</Link>
              <Link to="/legal/responsible-gaming">{labels.responsible}</Link>
              <Link to="/legal/contact">{labels.contact}</Link>
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
            <span>{labels.rights}</span>
            <nav>
              <Link to="/legal/cgu">{labels.cgu}</Link>
              <Link to="/legal/privacy">{labels.privacy}</Link>
              <Link to="/legal/responsible-gaming">{labels.responsible}</Link>
              <Link to="/legal/contact">{labels.contact}</Link>
              <Link to="/">{labels.home}</Link>
            </nav>
          </div>
        </footer>
      </div>
    </LegalContext.Provider>
  );
}
