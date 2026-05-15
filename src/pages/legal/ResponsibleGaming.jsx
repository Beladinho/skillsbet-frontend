import { useState } from "react";
import LegalLayout from "./LegalLayout";

const DURATIONS = [
  { label: "24 heures", days: 1 },
  { label: "3 jours",   days: 3 },
  { label: "7 jours",   days: 7 },
  { label: "30 jours",  days: 30 },
];

const RESOURCES = [
  {
    icon: "📞",
    name: "Joueurs Info Service",
    desc: "Ligne d'écoute nationale pour les joueurs excessifs — anonyme et gratuit",
    phone: "09 74 75 13 13",
    url:  "https://www.joueurs-info-service.fr",
  },
  {
    icon: "🏥",
    name: "SOS Joueurs",
    desc: "Association d'aide aux joueurs pathologiques et à leurs proches",
    phone: "01 40 91 94 94",
    url:  "https://www.sosjoueurs.org",
  },
  {
    icon: "🧠",
    name: "Addictologie.com",
    desc: "Ressources et professionnels spécialisés dans les addictions comportementales",
    url:  "https://www.addictologie.org",
  },
  {
    icon: "🌐",
    name: "Gambling Therapy",
    desc: "Support international en ligne (anglais) — chat et forum",
    url:  "https://www.gamblingtherapy.org",
  },
];

export default function ResponsibleGaming() {
  const [selectedDays, setSelectedDays] = useState(null);
  const [excluded, setExcluded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleExclude() {
    if (!selectedDays) return;
    setConfirming(true);
  }

  function handleConfirm() {
    setExcluded(true);
    setConfirming(false);
  }

  return (
    <LegalLayout title="Jeu Responsable" icon="🛡️">

      <div className="legal-warning">
        <span className="legal-warning__icon">⚠️</span>
        <span>
          <strong>Avertissement :</strong> SkillsBets utilise des jetons virtuels sans valeur monétaire réelle.
          Cependant, les comportements compulsifs liés au jeu peuvent survenir même sans argent réel.
          Si vous pensez avoir un problème, <strong>n'hésitez pas à demander de l'aide</strong>.
        </span>
      </div>

      <div className="legal-section">
        <h2>Le jeu doit rester un plaisir</h2>
        <p>
          SkillsBets est une plateforme de compétitions d'adresse basée sur les jeux vidéo. Nous
          prenons le jeu responsable très au sérieux, même si aucun argent réel n'est en jeu.
        </p>
        <p>
          Les jetons SkillsBets sont une monnaie virtuelle <strong>sans valeur marchande</strong>.
          Ils ne peuvent pas être convertis en argent réel, retirés ou échangés. Jouer sur SkillsBets
          ne constitue pas un jeu d'argent au sens légal.
        </p>
        <div className="legal-highlight">🎮 Jetons virtuels uniquement — aucun argent réel impliqué</div>
      </div>

      <div className="legal-section">
        <h2>Accès interdit aux mineurs</h2>
        <div className="legal-warning">
          <span className="legal-warning__icon">🔞</span>
          <span>
            L'accès à SkillsBets est <strong>strictement interdit aux personnes de moins de 18 ans</strong>.
            Si vous avez connaissance qu'un mineur utilise la plateforme, signalez-le immédiatement à{" "}
            <a href="mailto:support@skillsbets.net">support@skillsbets.net</a>.
          </span>
        </div>
        <p>
          Les parents et tuteurs sont encouragés à utiliser des logiciels de contrôle parental pour
          empêcher l'accès des mineurs à des plateformes de jeu compétitif en ligne.
        </p>
      </div>

      <div className="legal-section">
        <h2>Signes d'un jeu problématique</h2>
        <p>Le jeu devient problématique quand il :</p>
        <ul>
          <li>Occupe une place démesurée dans votre quotidien</li>
          <li>Vous empêche de dormir, de travailler ou d'entretenir vos relations sociales</li>
          <li>Génère de l'irritabilité ou de l'anxiété quand vous ne jouez pas</li>
          <li>Vous pousse à jouer pour "récupérer" après une défaite</li>
          <li>Vous fait négliger vos responsabilités</li>
        </ul>
        <p>
          Si vous vous reconnaissez dans plusieurs de ces situations, nous vous encourageons vivement
          à consulter un professionnel de santé ou à contacter l'une des ressources ci-dessous.
        </p>
      </div>

      <div className="legal-section">
        <h2>Auto-exclusion temporaire</h2>
        <p>
          Vous pouvez bloquer temporairement l'accès à votre compte. Pendant cette période, vous
          ne pourrez ni vous connecter ni participer à des duels. Cette action est immédiate.
        </p>

        {excluded ? (
          <div className="legal-form__success">
            <span>✅</span>
            <span>
              Votre compte sera bloqué pendant <strong>{selectedDays} jour{selectedDays > 1 ? "s" : ""}</strong>.
              Prenez soin de vous. Pour toute urgence, contactez{" "}
              <a href="mailto:support@skillsbets.net">support@skillsbets.net</a>.
            </span>
          </div>
        ) : (
          <div className="rg-exclusion-block">
            <h3>Choisissez une durée d'exclusion</h3>
            <p>La suspension prend effet immédiatement et ne peut pas être annulée avant la fin de la période.</p>

            <div className="rg-duration-options">
              {DURATIONS.map((d) => (
                <button
                  key={d.days}
                  className={`rg-duration-btn${selectedDays === d.days ? " selected" : ""}`}
                  onClick={() => { setSelectedDays(d.days); setConfirming(false); }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {confirming ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="legal-warning">
                  <span className="legal-warning__icon">⚠️</span>
                  <span>
                    Vous êtes sur le point de bloquer votre compte pendant{" "}
                    <strong>{DURATIONS.find(d => d.days === selectedDays)?.label}</strong>.
                    Cette action est irréversible avant la fin de la période. Confirmez-vous ?
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="rg-confirm-btn" onClick={handleConfirm}>
                    ✓ Confirmer l'exclusion
                  </button>
                  <button
                    className="rg-duration-btn"
                    onClick={() => setConfirming(false)}
                    style={{ marginBottom: 0 }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="rg-confirm-btn"
                onClick={handleExclude}
                disabled={!selectedDays}
                style={{ opacity: selectedDays ? 1 : 0.4 }}
              >
                🔒 S'auto-exclure temporairement
              </button>
            )}
          </div>
        )}
      </div>

      <div className="legal-section">
        <h2>Limites de mise</h2>
        <p>
          SkillsBets propose des limites configurables pour contrôler votre activité sur la plateforme :
        </p>
        <ul>
          <li>Limites de jetons misés par partie</li>
          <li>Limites de sessions quotidiennes</li>
          <li>Notifications de temps de jeu</li>
        </ul>
        <p>
          Ces paramètres sont disponibles dans <strong>Paramètres → Jeu responsable</strong> depuis
          votre profil.
        </p>
      </div>

      <div className="legal-section">
        <h2>Ressources d'aide</h2>
        <p>
          Si vous ou un proche avez besoin d'aide, ces organisations proposent un soutien gratuit
          et confidentiel :
        </p>
        {RESOURCES.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rg-resource-card"
          >
            <span className="rg-resource-card__icon">{r.icon}</span>
            <div>
              <div className="rg-resource-card__name">{r.name}</div>
              <div className="rg-resource-card__desc">{r.desc}</div>
              {r.phone && (
                <div className="rg-resource-card__phone">📞 {r.phone}</div>
              )}
            </div>
          </a>
        ))}
      </div>

      <div className="legal-section">
        <h2>Nous contacter</h2>
        <p>
          Pour toute question relative au jeu responsable ou pour signaler un comportement problématique :
        </p>
        <p>
          📧 <a href="mailto:support@skillsbets.net">support@skillsbets.net</a>
        </p>
        <p>Objet recommandé : <em>"Jeu responsable — [votre demande]"</em></p>
      </div>

      <p className="legal-meta">
        SkillsBets Ltd — Nicosie, Chypre — Version 1.0 — Mai 2026
      </p>
    </LegalLayout>
  );
}
