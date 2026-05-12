import { apiRequest } from "./http";

function buildApiUrl(path) {
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}${path}`;
}

function getStoredAuthToken() {
  return (
    localStorage.getItem("skillsbet_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

/* =========================
   PROFILE / SETTINGS
========================= */

/* =========================
   PROFILE / SETTINGS
========================= */

export async function getProfile() {
  return apiRequest("/profile");
}

export async function updateProfile(displayNameOrData, bio) {
  const body =
    typeof displayNameOrData === "object" && displayNameOrData !== null
      ? displayNameOrData
      : {
          display_name: displayNameOrData,
          bio,
        };

  return apiRequest("/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function getSettings() {
  return apiRequest("/settings");
}

export async function updateSettings(data) {
  return apiRequest("/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });
}

/* =========================
   NOTIFICATIONS
========================= */

export async function getMyNotifications() {
  return apiRequest("/notifications");
}

export async function markNotificationRead(notificationId) {
  return apiRequest("/notifications/read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      notification_id: Number(notificationId),
    },
  });
}

export async function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", {
    method: "POST",
  });
}

/* =========================
   PLAYER / STATS / HISTORY / MISSIONS
========================= */

export async function getPlayerStats(playerId, game = null) {
  const path = game
    ? `/player-stats?player_id=${encodeURIComponent(playerId)}&game=${encodeURIComponent(game)}`
    : `/player-stats?player_id=${encodeURIComponent(playerId)}`;

  return apiRequest(path, {
    useAuth: false,
  });
}

export async function getMatchHistory(playerId) {
  return apiRequest(`/match-history?player_id=${encodeURIComponent(playerId)}`, {
    useAuth: false,
  });
}

export async function getMissions(playerId) {
  return apiRequest(`/missions?player_id=${encodeURIComponent(playerId)}`, {
    useAuth: false,
  });
}

/* =========================
   LEADERBOARD
========================= */

export async function getLeaderboard(game = null) {
  const path = game
    ? `/leaderboard?game=${encodeURIComponent(game)}`
    : "/leaderboard";

  return apiRequest(path, {
    useAuth: false,
  });
}

/* =========================
   MATCHMAKING / DUELS
========================= */

export async function joinQueue(playerId, game = "snake", stake = 0) {
  return apiRequest("/join-queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      game,
      stake,
    },
  });
}

export async function leaveQueue(playerId, game = null) {
  return apiRequest("/leave-queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      game,
    },
  });
}

export async function fillQueueWithBot(playerId, game) {
  return apiRequest(
    `/fill-queue-with-bot?player_id=${encodeURIComponent(playerId)}&game=${encodeURIComponent(game)}`,
    {
      method: "POST",
    }
  );
}

export async function getQueue() {
  return apiRequest("/queue", {
    useAuth: false,
  });
}

export async function submitScore(duelId, playerIdOrScore, maybeScore) {
  const hasPlayerId = typeof maybeScore !== "undefined";

  const body = hasPlayerId
    ? {
        duel_id: duelId,
        player_id: playerIdOrScore,
        score: maybeScore,
      }
    : {
        duel_id: duelId,
        score: playerIdOrScore,
      };

  return apiRequest("/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function submitResult({
  duelId,
  winnerId = null,
  loserId = null,
  draw = false,
}) {
  return apiRequest("/submit-result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      duel_id: duelId,
      winner_id: winnerId,
      loser_id: loserId,
      draw,
    },
  });
}

export async function finishDuel(duelId) {
  return apiRequest("/finish-duel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      duel_id: duelId,
    },
  });
}

export async function getDuel(duelId) {
  return apiRequest(`/duel?duel_id=${encodeURIComponent(duelId)}`, {
    useAuth: false,
  });
}

/* =========================
   TOURNAMENTS
========================= */

export async function getTournaments() {
  return apiRequest("/tournaments", {
    useAuth: false,
  });
}

export async function createTournament(name, game, entryFee, premiumOnly = false) {
  return apiRequest("/tournament/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      name,
      game,
      entry_fee: Number(entryFee),
      premium_only: premiumOnly,
    },
  });
}

export async function joinTournament(tournamentId, playerId) {
  return apiRequest("/tournament/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      tournament_id: tournamentId,
      player_id: playerId,
    },
  });
}

export async function startTournament(tournamentId) {
  return apiRequest(
    `/tournament/start?tournament_id=${encodeURIComponent(tournamentId)}`,
    {
      method: "POST",
    }
  );
}

export async function getTournament(tournamentId) {
  return apiRequest(
    `/tournament/?tournament_id=${encodeURIComponent(tournamentId)}`,
    {
      useAuth: false,
    }
  );
}

export async function getTournamentBracket(tournamentId) {
  return apiRequest(
    `/tournament/bracket?tournament_id=${encodeURIComponent(tournamentId)}`,
    {
      useAuth: false,
    }
  );
}

export async function reportTournamentMatch(tournamentId, matchId, winner) {
  return apiRequest("/tournament/match/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      tournament_id: tournamentId,
      match_id: Number(matchId),
      winner,
    },
  });
}

export async function reportTournament(tournamentId, winner) {
  return apiRequest("/tournament/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      tournament_id: tournamentId,
      winner,
    },
  });
}

/* =========================
   WALLET / WITHDRAWALS / STRIPE / LEDGER
========================= */

export async function getBalance(playerId) {
  const path = playerId
    ? `/balance?player_id=${encodeURIComponent(playerId)}`
    : "/balance";

  return apiRequest(path);
}

export async function deposit(playerIdOrAmount, maybeAmount) {
  const hasPlayerId = typeof maybeAmount !== "undefined";
  const body = hasPlayerId
    ? {
        player_id: playerIdOrAmount,
        amount: maybeAmount,
      }
    : {
        amount: playerIdOrAmount,
      };

  return apiRequest("/deposit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function withdraw(playerIdOrAmount, maybeAmount) {
  const hasPlayerId = typeof maybeAmount !== "undefined";
  const body = hasPlayerId
    ? {
        player_id: playerIdOrAmount,
        amount: maybeAmount,
      }
    : {
        amount: playerIdOrAmount,
      };

  return apiRequest("/withdraw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function createWithdrawalRequest(
  amount,
  payoutMethod = "manual",
  payoutDetails = ""
) {
  return apiRequest("/withdraw-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      amount: Number(amount),
      payout_method: payoutMethod,
      payout_details: payoutDetails,
    },
  });
}

export async function getMyWithdrawals() {
  return apiRequest("/my-withdrawals");
}

export async function createStripeCheckout(amount) {
  return apiRequest("/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      amount: Number(amount),
    },
  });
}

export async function getWalletTransactions(txType = "all", period = "all") {
  return apiRequest(
    `/wallet/transactions?tx_type=${encodeURIComponent(txType)}&period=${encodeURIComponent(period)}`
  );
}

export function exportWalletTransactions(txType = "all", period = "all") {
  const token = localStorage.getItem("skillsbet_token");

  const url =
    buildApiUrl("/wallet/transactions/export") +
    `?tx_type=${encodeURIComponent(txType)}` +
    `&period=${encodeURIComponent(period)}`;

  fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Export failed");
      }

      return res.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "wallet_transactions.csv";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    })
    .catch((error) => {
      console.error(error);
    });
}

/* =========================
   SEASONS / RANK / PROGRESSION / BADGES
========================= */

export async function getSeasonStatus() {
  return apiRequest("/season/status", {
    useAuth: false,
  });
}

export async function getSeasonLeaderboard() {
  return apiRequest("/season/leaderboard", {
    useAuth: false,
  });
}

export async function getSeasonResults() {
  return apiRequest("/season/results", {
    useAuth: false,
  });
}

export async function getLatestSeasonResults() {
  return getSeasonResults();
}

export async function getMyProgression() {
  return apiRequest("/progression");
}

export async function getMyBadges() {
  return apiRequest("/badges");
}

export async function getBadges() {
  return getMyBadges();
}

export async function getRankRewardsStatus() {
  return apiRequest("/rank-rewards/status");
}

export async function claimRankReward(rankKey) {
  return apiRequest("/rank-rewards/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      rank_key: rankKey,
    },
  });
}

/* =========================
   CHEAT LOGS / ANTI-CHEAT
========================= */

export async function getCheatLogs() {
  return apiRequest("/cheat-logs");
}

export async function getAntiCheatProfiles() {
  return apiRequest("/admin/anti-cheat/profiles");
}

export async function updateAntiCheatRisk(playerId, riskLevel) {
  return apiRequest("/admin/anti-cheat/risk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      risk_level: riskLevel,
    },
  });
}

/* =========================
   ADMIN ANALYTICS / CHARTS / FINANCE
========================= */

export async function getAdminAnalytics(period = "all") {
  return apiRequest(`/admin/analytics?period=${encodeURIComponent(period)}`);
}

export async function getAdminCharts(period = "all") {
  return apiRequest(`/admin/charts?period=${encodeURIComponent(period)}`);
}

export async function getFinancialAudit(period = "all") {
  return apiRequest(
    `/admin/financial-audit?period=${encodeURIComponent(period)}`
  );
}

export function exportFinancialAudit(period = "all") {
  const base = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("skillsbet_token");

  const url =
    `${base}/admin/financial-audit/export` +
    `?period=${encodeURIComponent(period)}`;

  fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Export failed");
      }
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "financial_audit.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function getPlatformRevenue() {
  return apiRequest("/admin/platform-revenue");
}

export async function getPlatformWallet() {
  return apiRequest("/admin/platform-wallet");
}

export async function getStripePayments() {
  return apiRequest("/admin/stripe-payments");
}

/* =========================
   ADMIN WITHDRAWALS
========================= */

export async function getAllWithdrawals() {
  return apiRequest("/admin/withdrawals");
}

export async function decideWithdrawal(requestId, decision) {
  return apiRequest("/admin/withdrawals/decision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      request_id: Number(requestId),
      decision,
    },
  });
}

/* =========================
   ADMIN USERS
========================= */

export async function getAdminUsers() {
  return apiRequest("/admin/users");
}

export async function adminSetBalance(playerId, balance) {
  return apiRequest("/admin/users/set-balance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      balance: Number(balance),
    },
  });
}

export async function adminSetRole(playerId, role) {
  return apiRequest("/admin/users/role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      role,
    },
  });
}

export async function adminResetPlayer(playerId) {
  return apiRequest("/admin/users/reset-player", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
    },
  });
}

export async function adminSetElo(playerId, game, elo) {
  return apiRequest("/admin/users/set-elo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      game,
      elo: Number(elo),
    },
  });
}

/* =========================
   ADMIN DEV PANEL
========================= */

export async function resetTournaments() {
  return apiRequest("/admin/reset/tournaments", {
    method: "POST",
  });
}

export async function resetMissions() {
  return apiRequest("/admin/reset/missions", {
    method: "POST",
  });
}

export async function resetHistory() {
  return apiRequest("/admin/reset/history", {
    method: "POST",
  });
}

export async function resetDuels() {
  return apiRequest("/admin/reset/duels", {
    method: "POST",
  });
}

export async function resetQueue() {
  return apiRequest("/admin/reset/queue", {
    method: "POST",
  });
}

export async function closeCurrentSeason() {
  return apiRequest("/admin/season/close", {
    method: "POST",
  });
}

export async function startNewSeason() {
  return apiRequest("/admin/season/start", {
    method: "POST",
  });
}

export async function resetDemoData() {
  return apiRequest("/admin/reset/demo-data", {
    method: "POST",
  });
}

export async function getMyKyc() {
  return apiRequest("/kyc");
}

export async function submitKyc({
  fullName,
  country,
  documentType,
  documentReference = "",
}) {
  return apiRequest("/kyc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      full_name: fullName,
      country,
      document_type: documentType,
      document_reference: documentReference,
    },
  });
}

export async function getAllKycProfiles() {
  return apiRequest("/admin/kyc");
}

export async function decideKyc({ playerId, status, adminNote = "" }) {
  return apiRequest("/admin/kyc/decision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      player_id: playerId,
      status,
      admin_note: adminNote,
    },
  });
}

export async function getMyLimits() {
  return apiRequest("/limits");
}

export async function getMyTier() {
  return apiRequest("/tier");
}

export async function getAllPlayerTiers() {
  return apiRequest("/admin/tiers");
}

export async function getBattlePass() {
  return apiRequest("/battle-pass");
}

export async function createBattlePassCheckout() {
  return apiRequest("/battle-pass/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {},
  });
}

export async function claimBattlePassReward(rewardId) {
  return apiRequest("/battle-pass/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      reward_id: Number(rewardId),
    },
  });
}

export async function getBattlePassMissions() {
  return apiRequest("/battle-pass/missions");
}

export async function claimBattlePassMission(missionId) {
  return apiRequest("/battle-pass/missions/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      mission_id: Number(missionId),
    },
  });
}

export async function getMyBattlePassHistory() {
  return apiRequest("/battle-pass/history");
}

export async function getBattlePassSeasonsAdmin() {
  return apiRequest("/admin/battle-pass/seasons");
}

export async function createBattlePassSeasonAdmin(
  name,
  durationDays = 30,
  copyFromSeasonId = null
) {
  return apiRequest("/admin/battle-pass/seasons/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      name,
      duration_days: Number(durationDays),
      copy_from_season_id:
        copyFromSeasonId !== null && copyFromSeasonId !== ""
          ? Number(copyFromSeasonId)
          : null,
    },
  });
}

export async function closeBattlePassSeasonAdmin(seasonId) {
  return apiRequest("/admin/battle-pass/seasons/close", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      season_id: Number(seasonId),
    },
  });
}

export async function getBattlePassFinalGrantsAdmin() {
  return apiRequest("/admin/battle-pass/final-grants");
}

export async function getBattlePassLiveOpsStatusAdmin() {
  return apiRequest("/admin/battle-pass/live-ops/status");
}

export async function runBattlePassLiveOpsAdmin() {
  return apiRequest("/admin/battle-pass/live-ops/run", {
    method: "POST",
  });
}

export async function createLiveEventAdmin(data) {
  return apiRequest("/admin/live-events/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function redeemPromoCode(code) {
  return apiRequest("/promo-codes/redeem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      code,
    },
  });
}

export async function getPromoCodesAdmin() {
  return apiRequest("/admin/promo-codes");
}

export async function createPromoCodeAdmin({
  code,
  promoType,
  value,
  maxUses = 0,
  startDate = null,
  endDate = null,
}) {
  return apiRequest("/admin/promo-codes/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      code,
      promo_type: promoType,
      value: Number(value),
      max_uses: Number(maxUses),
      start_date: startDate,
      end_date: endDate,
    },
  });
}

export async function getMyReferralData() {
  return apiRequest("/referrals/me");
}

export async function getReferralsAdmin() {
  return apiRequest("/admin/referrals");
}

export async function getGrowthCrmDashboardAdmin() {
  return apiRequest("/admin/growth-crm");
}

export async function getMarketingSegmentsAdmin() {
  return apiRequest("/admin/marketing-segments");
}

export async function createCrmCampaignAdmin(data) {
  return apiRequest("/admin/crm/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });
}

export async function getCrmCampaignsAdmin(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.search && filters.search.trim() !== "") {
    params.set("search", filters.search.trim());
  }

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.page_size) {
    params.set("page_size", String(filters.page_size));
  }

  if (filters.sort_by) {
    params.set("sort_by", filters.sort_by);
  }

  if (filters.sort_order) {
    params.set("sort_order", filters.sort_order);
  }

  const queryString = params.toString();

  return apiRequest(`/admin/crm/campaigns${queryString ? `?${queryString}` : ""}`);
}

export async function previewCrmCampaignAdmin(id) {
  return apiRequest(`/admin/crm/preview/${encodeURIComponent(id)}`);
}

export async function createCrmCampaign(data) {
  return createCrmCampaignAdmin(data);
}

export async function executeCrmCampaignAdmin(campaignId, payload) {
  return apiRequest(`/admin/crm/campaigns/${encodeURIComponent(campaignId)}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  });
}

export async function executeCrmCampaign(campaignId, payload) {
  return executeCrmCampaignAdmin(campaignId, payload);
}

export async function getCrmAuditLogsAdmin(limit = 50) {
  return apiRequest(`/admin/crm/audit-logs?limit=${encodeURIComponent(limit)}`);
}

export async function getCrmSchedulerStatusAdmin() {
  return apiRequest("/admin/crm/scheduler/status");
}

export async function scheduleCrmCampaignAdmin(campaignId, payload) {
  return apiRequest(`/admin/crm/campaigns/${encodeURIComponent(campaignId)}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  });
}

export async function runDueScheduledCrmCampaignsAdmin() {
  return apiRequest("/admin/crm/scheduled/run-due", {
    method: "POST",
  });
}

export async function cancelScheduledCrmCampaignAdmin(campaignId) {
  return apiRequest(
    `/admin/crm/campaigns/${encodeURIComponent(campaignId)}/cancel-schedule`,
    {
      method: "POST",
    }
  );
}

/* =========================
   ADMIN CRM A/B TESTING
========================= */

export async function getCrmAbTestsAdmin() {
  return apiRequest("/admin/crm/ab-tests");
}

export async function selectCrmAbTestWinnerAdmin(parentCampaignId) {
  return apiRequest(
    `/admin/crm/ab-tests/${encodeURIComponent(parentCampaignId)}/select-winner`,
    {
      method: "POST",
    }
  );
}

export async function promoteCrmAbTestWinnerAdmin(
  parentCampaignId,
  scheduleType = "weekly"
) {
  return apiRequest(
    `/admin/crm/ab-tests/${encodeURIComponent(parentCampaignId)}/promote-winner`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        schedule_type: scheduleType,
      },
    }
  );
}

/* =========================
   ADMIN CSV EXPORTS
========================= */

export async function getLiveMatches() {
  return apiRequest("/live-matches", { useAuth: false });
}

export async function claimMission(missionId, playerId) {
  const body = playerId
    ? { mission_id: Number(missionId), player_id: playerId }
    : { mission_id: Number(missionId) };
  return apiRequest("/missions/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export function downloadAdminCsvExport(path, filename) {
  const base = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("skillsbet_token");

  fetch(`${base}${path}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("CSV export failed");
      }
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = blobUrl;
      a.download = filename || "skillsbet_export.csv";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    })
    .catch((error) => {
      console.error(error);
      alert(error.message || "CSV export failed");
    });
}

/* =========================
   ADMIN GROWTH COHORTS
========================= */

export async function getGrowthCohortsAdmin() {
  return apiRequest("/admin/growth-cohorts");
}

/* =========================
   ADMIN GROWTH CHURN
========================= */

export async function getGrowthChurnAdmin() {
  return apiRequest("/admin/growth-churn");
}

export async function runAntiChurnCampaignAdmin(riskLevel = "high") {
  return apiRequest("/admin/growth-churn/run-anti-churn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      risk_level: riskLevel,
    },
  });
}

export async function getAntiChurnActionsAdmin() {
  return apiRequest("/admin/growth-churn/actions");
}

export async function measureAntiChurnActionsAdmin() {
  return apiRequest("/admin/growth-churn/measure-actions", {
    method: "POST",
  });
}

export async function getAntiChurnRoiAdmin() {
  return apiRequest("/admin/growth-churn/roi");
}

/* =========================
   ADMIN GROWTH RECOMMENDATIONS
========================= */

export async function getGrowthRecommendationsAdmin() {
  return apiRequest("/admin/growth-recommendations");
}

export async function createCampaignFromRecommendationAdmin(recommendation) {
  return apiRequest("/admin/growth-recommendations/create-campaign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      title: recommendation.title,
      suggested_segment: recommendation.suggested_segment,
      suggested_action: recommendation.suggested_action,
      suggested_reward: Number(recommendation.suggested_reward || 0),
      reason: recommendation.reason,
    },
  });
}

export async function getCrmAbResultsAdmin(campaignId) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}/ab-results`);
}

export async function promoteCrmAbWinnerAdmin(campaignId, payload) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}/promote-ab-winner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
}

export async function archiveCrmCampaignAdmin(campaignId) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}/archive`, {
    method: "POST",
  });
}

export async function unarchiveCrmCampaignAdmin(campaignId) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}/unarchive`, {
    method: "POST",
  });
}

export async function duplicateCrmCampaignAdmin(campaignId) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}/duplicate`, {
    method: "POST",
  });
}

export async function updateCrmCampaignAdmin(campaignId, payload) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDraftCrmCampaignAdmin(campaignId) {
  return apiRequest(`/admin/crm/campaigns/${campaignId}`, {
    method: "DELETE",
  });
}

export async function getCrmCampaignStatusSummaryAdmin() {
  return apiRequest("/admin/crm/campaigns/status-summary");
}

export function getCrmCampaignsExportUrl(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.search && filters.search.trim() !== "") {
    params.set("search", filters.search.trim());
  }

  if (filters.sort_by) {
    params.set("sort_by", filters.sort_by);
  }

  if (filters.sort_order) {
    params.set("sort_order", filters.sort_order);
  }

  const queryString = params.toString();
  const path = `/admin/exports/crm-campaigns.csv${queryString ? `?${queryString}` : ""}`;

  return buildApiUrl(path);
}

export function getCrmAuditLogsExportUrl(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.action && filters.action !== "all") {
    params.set("action", filters.action);
  }

  if (filters.search && filters.search.trim() !== "") {
    params.set("search", filters.search.trim());
  }

  const queryString = params.toString();
  const path = `/admin/exports/crm-audit-logs.csv${queryString ? `?${queryString}` : ""}`;

  return buildApiUrl(path);
}

export async function downloadCsvWithAuth(url, filename) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("jwt") ||
    "";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de télécharger le fichier CSV.");
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(downloadUrl);
}