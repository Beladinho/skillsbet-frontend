import { downloadAdminCsvExport } from "../api/skillsbetApi";
import { useSounds } from "../context/SoundContext";

export default function AdminGrowthExportsPanel() {
  const { playClick } = useSounds();

  function exportFile(path, filename) {
    playClick();
    downloadAdminCsvExport(path, filename);
  }

  return (
    <div className="card" style={{ marginTop: 24, padding: 16 }}>
      <h3>Admin Growth Exports</h3>

      <p>
        Exporte les données marketing, CRM, referrals, promos et A/B tests en CSV.
      </p>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() =>
            exportFile("/admin/exports/crm-campaigns.csv", "crm_campaigns.csv")
          }
        >
          Export CRM Campaigns
        </button>

        <button
          onClick={() =>
            exportFile("/admin/exports/crm-ab-tests.csv", "crm_ab_tests.csv")
          }
        >
          Export CRM A/B Tests
        </button>

        <button
          onClick={() =>
            exportFile("/admin/exports/referrals.csv", "referrals.csv")
          }
        >
          Export Referrals
        </button>

        <button
          onClick={() =>
            exportFile("/admin/exports/promo-codes.csv", "promo_codes.csv")
          }
        >
          Export Promo Codes
        </button>

        <button
          onClick={() =>
            exportFile(
              "/admin/exports/marketing-segments.csv",
              "marketing_segments.csv"
            )
          }
        >
          Export Marketing Segments
        </button>
      </div>
    </div>
  );
}