import LegalLayout from "./LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Politique de Confidentialité" icon="🔒">

      <div className="legal-info">
        <span>🇪🇺</span>
        <span>
          SkillsBets est conforme au <strong>Règlement Général sur la Protection des Données (RGPD)</strong>{" "}
          — Règlement UE 2016/679. Dernière mise à jour : <strong>Mai 2026</strong>.
        </span>
      </div>

      <div className="legal-section">
        <h2>Article 1 — Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles est :<br />
          <strong>SkillsBets Ltd</strong><br />
          Nicosie, Chypre<br />
          Email DPO : <a href="mailto:privacy@skillsbets.net">privacy@skillsbets.net</a>
        </p>
      </div>

      <div className="legal-section">
        <h2>Article 2 — Données collectées</h2>
        <p>Lors de votre utilisation de SkillsBets, nous collectons les données suivantes :</p>

        <p><strong>Données d'inscription :</strong></p>
        <ul>
          <li>Adresse email (identifiant principal)</li>
          <li>Pseudo / nom d'utilisateur</li>
          <li>Pays de résidence</li>
          <li>Mot de passe (stocké sous forme hachée — jamais en clair)</li>
        </ul>

        <p><strong>Données de jeu :</strong></p>
        <ul>
          <li>Statistiques de jeu (victoires, défaites, ELO, jetons)</li>
          <li>Historique des parties et tournois</li>
          <li>Missions accomplies et récompenses obtenues</li>
          <li>Niveau XP et progression</li>
        </ul>

        <p><strong>Données techniques :</strong></p>
        <ul>
          <li>Adresse IP (utilisée pour la sécurité et la détection de fraude)</li>
          <li>Navigateur et système d'exploitation (analytics)</li>
          <li>Journaux de connexion et d'activité</li>
        </ul>

        <div className="legal-highlight">🚫 Nous ne collectons jamais vos données bancaires ni informations de paiement</div>
      </div>

      <div className="legal-section">
        <h2>Article 3 — Finalités du traitement</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li><strong>Exécution du contrat</strong> : gestion de votre compte, participation aux duels et tournois</li>
          <li><strong>Sécurité</strong> : détection de fraude, protection contre la triche et les abus</li>
          <li><strong>Amélioration du service</strong> : analyse statistique anonymisée de l'utilisation</li>
          <li><strong>Communication</strong> : notifications de résultats, alertes de tournois, mises à jour importantes</li>
          <li><strong>Obligations légales</strong> : conservation des données requises par la réglementation chypriote</li>
        </ul>
        <p>
          Nous ne vendons pas vos données à des tiers. Nous ne les utilisons pas à des fins publicitaires
          sans votre consentement explicite.
        </p>
      </div>

      <div className="legal-section">
        <h2>Article 4 — Durée de conservation</h2>
        <ul>
          <li><strong>Données de compte actif</strong> : conservées pendant toute la durée de l'utilisation du service</li>
          <li><strong>Après suppression du compte</strong> : effacement définitif sous 30 jours (sauf obligation légale)</li>
          <li><strong>Journaux de sécurité</strong> : conservés 12 mois maximum</li>
          <li><strong>Données de jeu agrégées/anonymisées</strong> : peuvent être conservées indéfiniment</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>Article 5 — Vos droits (RGPD)</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>
            <strong>Droit d'accès</strong> : obtenir une copie de toutes les données vous concernant
          </li>
          <li>
            <strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes
          </li>
          <li>
            <strong>Droit à l'effacement</strong> (« droit à l'oubli ») : demander la suppression de vos données
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible
          </li>
          <li>
            <strong>Droit d'opposition</strong> : vous opposer à certains traitements (notamment marketing)
          </li>
          <li>
            <strong>Droit à la limitation</strong> : restreindre temporairement le traitement de vos données
          </li>
        </ul>
        <p>
          Pour exercer ces droits, envoyez votre demande à{" "}
          <a href="mailto:privacy@skillsbets.net">privacy@skillsbets.net</a>. Nous répondons sous{" "}
          <strong>30 jours maximum</strong>.
        </p>
        <p>
          En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de l'autorité
          de protection des données compétente (CNIL en France, Commissaire à la protection des données à Chypre).
        </p>
      </div>

      <div className="legal-section">
        <h2>Article 6 — Cookies et traceurs</h2>
        <p>SkillsBets utilise un minimum de cookies, strictement nécessaires au fonctionnement du service :</p>
        <ul>
          <li><strong>Cookie de session</strong> : maintient votre connexion active (durée : session)</li>
          <li><strong>Préférences utilisateur</strong> : langue, thème, paramètres (durée : 1 an)</li>
        </ul>
        <p>
          Nous n'utilisons pas de cookies publicitaires ou de tracking tiers. Aucun pixel Facebook,
          Google Analytics ou outil de marketing tiers n'est actif sans votre consentement.
        </p>
        <div className="legal-highlight">🍪 Cookies essentiels uniquement — pas de tracking publicitaire</div>
      </div>

      <div className="legal-section">
        <h2>Article 7 — Sécurité des données</h2>
        <p>Nous mettons en œuvre les mesures techniques et organisationnelles suivantes :</p>
        <ul>
          <li>Chiffrement des communications via HTTPS/TLS</li>
          <li>Hachage des mots de passe (bcrypt)</li>
          <li>Accès aux données restreint au personnel autorisé</li>
          <li>Journaux d'audit et détection d'intrusion</li>
          <li>Sauvegardes régulières chiffrées</li>
        </ul>
        <p>
          En cas de violation de données susceptible d'affecter vos droits, nous vous en informerons
          dans les 72 heures conformément à l'article 33 du RGPD.
        </p>
      </div>

      <div className="legal-section">
        <h2>Article 8 — Transferts hors UE</h2>
        <p>
          Vos données sont principalement stockées au sein de l'Union Européenne. Si un transfert
          hors UE s'avère nécessaire (infrastructure cloud), il est encadré par des clauses contractuelles
          types approuvées par la Commission européenne.
        </p>
      </div>

      <div className="legal-section">
        <h2>Article 9 — Contact DPO</h2>
        <p>Notre Délégué à la Protection des Données (DPO) est joignable à :</p>
        <p>
          📧 <a href="mailto:privacy@skillsbets.net">privacy@skillsbets.net</a><br />
          📮 SkillsBets Ltd — DPO — Nicosie, Chypre
        </p>
        <p>
          Pour toute question générale : <a href="mailto:support@skillsbets.net">support@skillsbets.net</a>
        </p>
      </div>

      <p className="legal-meta">
        SkillsBets Ltd — Nicosie, Chypre — Version 1.0 — Mai 2026 — Conforme RGPD (UE) 2016/679
      </p>
    </LegalLayout>
  );
}
