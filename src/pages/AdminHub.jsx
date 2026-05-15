import { Link } from "react-router-dom";
import SessionBar from "../components/SessionBar";
import CheatLogs from "./CheatLogs";
import AdminAnalyticsPanel from "../components/AdminAnalyticsPanel";
import AdminGrowthCrmPanel from "../components/AdminGrowthCrmPanel";
import AdminGrowthRecommendationsPanel from "../components/AdminGrowthRecommendationsPanel";
import AdminGrowthCohortsPanel from "../components/AdminGrowthCohortsPanel";
import AdminGrowthChurnPanel from "../components/AdminGrowthChurnPanel";
import AdminAntiChurnRoiPanel from "../components/AdminAntiChurnRoiPanel";
import AdminGrowthExportsPanel from "../components/AdminGrowthExportsPanel";
import AdminMarketingSegmentsPanel from "../components/AdminMarketingSegmentsPanel";
import AdminCrmCampaignPanel from "../components/AdminCrmCampaignPanel";
import AdminCrmAbTestingPanel from "../components/AdminCrmAbTestingPanel";
import AdminChartsPanel from "../components/AdminChartsPanel";
import AdminFinancialAuditPanel from "../components/AdminFinancialAuditPanel";
import AdminBattlePassLiveOpsPanel from "../components/AdminBattlePassLiveOpsPanel";
import AdminBattlePassSeasonsPanel from "../components/AdminBattlePassSeasonsPanel";
import AdminBattlePassFinalGrantsPanel from "../components/AdminBattlePassFinalGrantsPanel";
import AdminPromoCodesPanel from "../components/AdminPromoCodesPanel";
import AdminReferralsPanel from "../components/AdminReferralsPanel";
import AdminRevenuePanel from "../components/AdminRevenuePanel";
import AdminStripePaymentsPanel from "../components/AdminStripePaymentsPanel";
import AdminWithdrawalsPanel from "../components/AdminWithdrawalsPanel";
import AdminKycPanel from "../components/AdminKycPanel";
import AdminTiersPanel from "../components/AdminTiersPanel";
import AdminAntiCheatPanel from "../components/AdminAntiCheatPanel";
import AdminUsersPanel from "../components/AdminUsersPanel";
import AdminDevPanel from "../components/AdminDevPanel";
import AdminCreatorPanel from "../components/AdminCreatorPanel";
import AdminScheduledTournamentsPanel from "../components/AdminScheduledTournamentsPanel";

export default function AdminHub() {
  return (
    <div className="app-shell">
      <SessionBar />

      <div style={{ padding: "8px 0 16px" }}>
        <Link
          to="/lobby"
          style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600 }}
        >
          ← Retour au lobby
        </Link>
      </div>

      <h2 style={{ marginBottom: 16 }}>Panel Admin</h2>

      <CheatLogs />
      <AdminAnalyticsPanel />
      <AdminGrowthCrmPanel />
      <AdminGrowthRecommendationsPanel />
      <AdminGrowthCohortsPanel />
      <AdminGrowthChurnPanel />
      <AdminAntiChurnRoiPanel />
      <AdminGrowthExportsPanel />
      <AdminMarketingSegmentsPanel />
      <AdminCrmCampaignPanel />
      <AdminCrmAbTestingPanel />
      <AdminChartsPanel />
      <AdminFinancialAuditPanel />
      <AdminBattlePassLiveOpsPanel />
      <AdminBattlePassSeasonsPanel />
      <AdminBattlePassFinalGrantsPanel />
      <AdminPromoCodesPanel />
      <AdminReferralsPanel />
      <AdminRevenuePanel />
      <AdminStripePaymentsPanel />
      <AdminWithdrawalsPanel />
      <AdminKycPanel />
      <AdminTiersPanel />
      <AdminAntiCheatPanel />
      <AdminUsersPanel />
      <AdminDevPanel />
      <AdminScheduledTournamentsPanel />
      <AdminCreatorPanel />
    </div>
  );
}
