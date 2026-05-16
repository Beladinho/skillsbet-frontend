import { useState } from "react";
import LegalLayout from "./LegalLayout";
import { openChat } from "../../hooks/useCrisp";

const SUBJECTS = [
  "Question générale",
  "Problème technique",
  "Signalement de triche",
  "Jeu responsable / auto-exclusion",
  "Données personnelles (RGPD)",
  "Partenariat / presse",
  "Autre",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setSending(true);
    /* Fallback mailto — remplacer par un appel API backend quand disponible */
    const mailto = `mailto:support@skillsbets.net?subject=${encodeURIComponent(`[${form.subject}] - ${form.name}`)}&body=${encodeURIComponent(`Nom : ${form.name}\nEmail : ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  }

  return (
    <LegalLayout title="Nous Contacter" icon="✉️">

      <div className="legal-info">
        <span>⏱️</span>
        <span>
          Délai de réponse : <strong>48 heures ouvrées maximum</strong>. Pour les urgences liées
          au jeu responsable, mentionnez-le en objet.
        </span>
      </div>

      <div className="legal-section">
        <h2>Informations de contact</h2>
        <p>
          📧 Email principal :{" "}
          <a href="mailto:support@skillsbets.net">support@skillsbets.net</a>
        </p>
        <p>
          🔒 Données & confidentialité :{" "}
          <a href="mailto:privacy@skillsbets.net">privacy@skillsbets.net</a>
        </p>
        <p>
          📮 Adresse postale :<br />
          SkillsBets Ltd<br />
          Nicosie, Chypre
        </p>
        <p>
          🕐 Horaires de support : Lundi–Vendredi, 9h–18h (heure de Chypre / EET)
        </p>
      </div>

      <div className="legal-section">
        <h2>Support en direct</h2>
        <p>Besoin d'une réponse immédiate ? Notre équipe est disponible via le chat en direct.</p>
        <button
          onClick={openChat}
          className="legal-form__submit"
          style={{ marginBottom: 0, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span>💬</span>
          <span>Ouvrir le chat support</span>
        </button>
      </div>

      <div className="legal-section">
        <h2>Formulaire de contact</h2>

        {sent ? (
          <div className="legal-form__success">
            <span>✅</span>
            <span>
              Votre message a été transmis. Nous vous répondrons à <strong>{form.email}</strong>{" "}
              dans les 48 heures ouvrées.
            </span>
          </div>
        ) : (
          <form className="legal-form" onSubmit={handleSubmit} noValidate>
            <div className="legal-form__row">
              <div className="legal-form__field">
                <label className="legal-form__label" htmlFor="contact-name">
                  Nom / Pseudo *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className="legal-form__input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Votre nom ou pseudo"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="legal-form__field">
                <label className="legal-form__label" htmlFor="contact-email">
                  Email *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="legal-form__input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="legal-form__field">
              <label className="legal-form__label" htmlFor="contact-subject">
                Sujet
              </label>
              <select
                id="contact-subject"
                name="subject"
                className="legal-form__select"
                value={form.subject}
                onChange={handleChange}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="legal-form__field">
              <label className="legal-form__label" htmlFor="contact-message">
                Message *
              </label>
              <textarea
                id="contact-message"
                name="message"
                className="legal-form__textarea"
                value={form.message}
                onChange={handleChange}
                placeholder="Décrivez votre demande en détail…"
                required
              />
            </div>

            {error && (
              <div className="legal-warning">
                <span className="legal-warning__icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="legal-form__submit"
              disabled={sending}
            >
              {sending ? "Envoi…" : "Envoyer le message"}
            </button>

            <p style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", marginTop: -4 }}>
              * Champs obligatoires. En envoyant ce formulaire, vous acceptez que vos données
              soient traitées conformément à notre{" "}
              <a href="/legal/privacy" style={{ color: "var(--clr-orange)" }}>
                politique de confidentialité
              </a>.
            </p>
          </form>
        )}
      </div>

      <div className="legal-section">
        <h2>Questions fréquentes</h2>
        <p>Avant de nous contacter, consultez nos ressources :</p>
        <ul>
          <li>
            <a href="/legal/cgu">Conditions Générales d'Utilisation</a> — règles de la plateforme
          </li>
          <li>
            <a href="/legal/privacy">Politique de confidentialité</a> — gestion de vos données
          </li>
          <li>
            <a href="/legal/responsible-gaming">Jeu responsable</a> — auto-exclusion et ressources d'aide
          </li>
        </ul>
      </div>

      <p className="legal-meta">
        SkillsBets Ltd — Nicosie, Chypre — support@skillsbets.net
      </p>
    </LegalLayout>
  );
}
