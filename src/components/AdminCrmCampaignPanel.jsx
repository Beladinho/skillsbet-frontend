import { useEffect, useState } from "react";
import {
  getCrmCampaignsAdmin,
  createCrmCampaignAdmin,
  previewCrmCampaignAdmin,
  executeCrmCampaignAdmin,
  getCrmAuditLogsAdmin,
  scheduleCrmCampaignAdmin,
  getCrmSchedulerStatusAdmin,
  runDueScheduledCrmCampaignsAdmin,
  cancelScheduledCrmCampaignAdmin,
  getCrmAbResultsAdmin,
  promoteCrmAbWinnerAdmin,
  archiveCrmCampaignAdmin,
  unarchiveCrmCampaignAdmin,
  duplicateCrmCampaignAdmin,
  updateCrmCampaignAdmin,
  deleteDraftCrmCampaignAdmin,
  getCrmCampaignStatusSummaryAdmin,
  getCrmCampaignsExportUrl,
  getCrmAuditLogsExportUrl,
  downloadCsvWithAuth,
} from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminCrmCampaignPanel() {
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [campaigns, setCampaigns] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [campaignStatusSummary, setCampaignStatusSummary] = useState(null);
  const [previews, setPreviews] = useState({});
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [loading, setLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [previewingAll, setPreviewingAll] = useState(false);
  const [previewAllProgress, setPreviewAllProgress] = useState({
    done: 0,
    total: 0,
  });
  const [cancelPreviewAllRequested, setCancelPreviewAllRequested] = useState(false);
  const [campaignsLastRefreshedAt, setCampaignsLastRefreshedAt] = useState(null);
  const [auditLogsLastRefreshedAt, setAuditLogsLastRefreshedAt] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortMode, setSortMode] = useState("created_desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalCampaigns, setServerTotalCampaigns] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [readinessFilter, setReadinessFilter] = useState("all");

  const [auditLimit, setAuditLimit] = useState(50);
  const [auditStatusFilter, setAuditStatusFilter] = useState("all");
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [auditSearchFilter, setAuditSearchFilter] = useState("");
  const [auditHighImpactOnly, setAuditHighImpactOnly] = useState(false);

  const [name, setName] = useState("Reactivation Campaign A");
  const [segment, setSegment] = useState("inactive_users");
  const [actionType, setActionType] = useState("reward_tokens");
  const [reward, setReward] = useState(5);
  const [message, setMessage] = useState("We miss you! Here are some tokens.");
  const [schedule, setSchedule] = useState("manual");

  const [abEnabled, setAbEnabled] = useState(false);
  const [variantName, setVariantName] = useState("A");
  const [parentCampaignId, setParentCampaignId] = useState("");

  const WARNING_THRESHOLD = 100;
  const PREVIEW_CONCURRENCY_LIMIT = 3;

  function getBackendSortParams(mode) {
    if (mode === "created_desc") return { sort_by: "created_at", sort_order: "desc" };
    if (mode === "created_asc") return { sort_by: "created_at", sort_order: "asc" };
    if (mode === "id_desc") return { sort_by: "id", sort_order: "desc" };
    if (mode === "id_asc") return { sort_by: "id", sort_order: "asc" };
    if (mode === "name_asc") return { sort_by: "name", sort_order: "asc" };
    if (mode === "status_asc") return { sort_by: "status", sort_order: "asc" };
    return { sort_by: "created_at", sort_order: "desc" };
  }

  function getCampaignStatusStyle(status) {
    if (status === "draft") {
      return {
        background: "rgba(255,255,255,0.08)",
        color: "inherit",
      };
    }

    if (status === "scheduled") {
      return {
        background: "rgba(155, 89, 182, 0.18)",
        color: "#9b59b6",
      };
    }

    if (status === "executed") {
      return {
        background: "rgba(46, 204, 113, 0.18)",
        color: "#2ecc71",
      };
    }

    if (status === "promoted") {
      return {
        background: "rgba(52, 152, 219, 0.18)",
        color: "#3498db",
      };
    }

    if (status === "archived") {
      return {
        background: "rgba(149, 165, 166, 0.18)",
        color: "#95a5a6",
      };
    }

    return {
      background: "rgba(255,255,255,0.08)",
      color: "inherit",
    };
  }

  function getExecutionReadiness(campaign, preview) {
    if (campaign.status === "promoted") {
      return {
        label: "Locked: promoted",
        background: "rgba(52, 152, 219, 0.18)",
        color: "#3498db",
      };
    }

    if (campaign.status === "archived") {
      return {
        label: "Locked: archived",
        background: "rgba(149, 165, 166, 0.18)",
        color: "#95a5a6",
      };
    }

    if (!preview) {
      return {
        label: "Preview required",
        background: "rgba(255,255,255,0.08)",
        color: "inherit",
      };
    }

    const eligibleCount = preview.eligible_count || 0;

    if (eligibleCount === 0) {
      return {
        label: "No eligible players",
        background: "rgba(231, 76, 60, 0.18)",
        color: "#e74c3c",
      };
    }

    if (eligibleCount > WARNING_THRESHOLD) {
      return {
        label: "High impact",
        background: "rgba(241, 196, 15, 0.18)",
        color: "#f1c40f",
      };
    }

    return {
      label: "Ready",
      background: "rgba(46, 204, 113, 0.18)",
      color: "#2ecc71",
    };
  }

  function getCampaignActionStyle(actionType) {
    if (actionType === "reward_tokens") {
      return {
        background: "rgba(241, 196, 15, 0.18)",
        color: "#f1c40f",
      };
    }

    if (actionType === "notification") {
      return {
        background: "rgba(52, 152, 219, 0.18)",
        color: "#3498db",
      };
    }

    return {
      background: "rgba(255,255,255,0.08)",
      color: "inherit",
    };
  }

  function getCampaignSegmentStyle(segment) {
    if (segment === "inactive_users") {
      return {
        background: "rgba(231, 76, 60, 0.18)",
        color: "#e74c3c",
      };
    }

    if (segment === "never_depositors") {
      return {
        background: "rgba(241, 196, 15, 0.18)",
        color: "#f1c40f",
      };
    }

    if (segment === "vip_users") {
      return {
        background: "rgba(155, 89, 182, 0.18)",
        color: "#9b59b6",
      };
    }

    if (segment === "converted_users") {
      return {
        background: "rgba(46, 204, 113, 0.18)",
        color: "#2ecc71",
      };
    }

    if (segment === "new_users") {
      return {
        background: "rgba(52, 152, 219, 0.18)",
        color: "#3498db",
      };
    }

    if (segment === "referred_users" || segment === "referrers") {
      return {
        background: "rgba(230, 126, 34, 0.18)",
        color: "#e67e22",
      };
    }

    return {
      background: "rgba(255,255,255,0.08)",
      color: "inherit",
    };
  }

  function getAuditStatusStyle(status) {
  if (status === "success") {
    return {
      background: "rgba(46, 204, 113, 0.18)",
      color: "#2ecc71",
    };
  }

  if (status === "blocked") {
    return {
      background: "rgba(241, 196, 15, 0.18)",
      color: "#f1c40f",
    };
  }

  if (status === "error") {
    return {
      background: "rgba(231, 76, 60, 0.18)",
      color: "#e74c3c",
    };
  }

  if (status === "dry_run") {
    return {
      background: "rgba(52, 152, 219, 0.18)",
      color: "#3498db",
    };
  }

  if (status === "scheduled") {
    return {
      background: "rgba(155, 89, 182, 0.18)",
      color: "#9b59b6",
    };
  }

  return {
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
  };
}

  async function handleCopyAuditLog(log) {
    const text =
      `CRM Audit Log\n` +
      `ID: ${log.id || "-"}\n` +
      `Date: ${log.created_at ? new Date(log.created_at).toLocaleString() : "-"}\n` +
      `Campaign: ${log.campaign_id ? `#${log.campaign_id}` : "-"}\n` +
      `Action: ${log.action || "-"}\n` +
      `Status: ${log.status || "-"}\n` +
      `Target: ${log.total_target_players ?? 0}\n` +
      `Eligible: ${log.eligible_count ?? 0}\n` +
      `Already executed: ${log.already_executed_count ?? 0}\n` +
      `Message: ${log.message || "-"}`;

    try {
      await navigator.clipboard.writeText(text);
      notifySuccess("CRM", "Audit log copié.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", "Impossible de copier cet audit log.");
    }
  }

  useEffect(() => {
    loadCampaigns();
    loadAuditLogs();
    loadSchedulerStatus();
    loadCampaignStatusSummary();
  }, []);

  async function handleCopyCampaignMessage(campaign) {
    const text = campaign.message || "";

    if (!text.trim()) {
      notifyError("CRM", "Cette campagne n’a pas de message à copier.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      notifySuccess("CRM", "Message de campagne copié.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", "Impossible de copier le message de campagne.");
    }
  }

  async function handleCopyCampaignSummary(campaign) {
    const text =
      `CRM Campaign Summary\n` +
      `ID: ${campaign.id || "-"}\n` +
      `Name: ${campaign.name || "-"}\n` +
      `Segment: ${campaign.target_segment || campaign.segment || "-"}\n` +
      `Action: ${campaign.action_type || "-"}\n` +
      `Reward: ${campaign.reward_amount ?? 0}\n` +
      `Schedule type: ${campaign.schedule_type || "manual"}\n` +
      `Status: ${campaign.status || "draft"}\n` +
      `Scheduled at: ${campaign.scheduled_at || "-"}\n` +
      `Executed at: ${campaign.executed_at || "-"}\n` +
      `Archived at: ${campaign.archived_at || "-"}\n` +
      `A/B: ${campaign.ab_test_enabled || campaign.is_ab_test ? "Yes" : "No"}\n` +
      `Variant: ${campaign.variant_name || "-"}\n` +
      `Parent campaign ID: ${campaign.parent_campaign_id || "-"}\n` +
      `Promoted from A/B: ${campaign.promoted_from_ab_test ? "Yes" : "No"}\n` +
      `Active: ${campaign.is_active ? "Yes" : "No"}\n` +
      `Created at: ${campaign.created_at || "-"}\n` +
      `Message: ${campaign.message || "-"}`;

    try {
      await navigator.clipboard.writeText(text);
      notifySuccess("CRM", "Résumé de campagne copié.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", "Impossible de copier le résumé de campagne.");
    }
  }

  function toggleCampaignDetails(campaignId) {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  }

  function expandAllVisibleCampaignDetails() {
    const nextExpanded = {};

    paginatedCampaigns.forEach((campaign) => {
      nextExpanded[campaign.id] = true;
    });

    setExpandedCampaigns(nextExpanded);
  }

  function collapseAllCampaignDetails() {
    setExpandedCampaigns({});
  }

  function resetCampaignViewState() {
    setExpandedCampaigns({});
    setPreviews({});
  }

  async function loadCampaigns(nextFilters = null) {
    try {
      setLoading(true);

      const sortParams = getBackendSortParams(sortMode);

      const filters = nextFilters || {
        status: statusFilter,
        search: searchFilter,
        page: currentPage,
        page_size: pageSize,
        ...sortParams,
      };

      const data = await getCrmCampaignsAdmin(filters);

      if (Array.isArray(data)) {
        setCampaigns(data);
        setServerTotalPages(1);
        setServerTotalCampaigns(data.length);
        setCampaignsLastRefreshedAt(new Date());
        return;
      }

      setCampaigns(Array.isArray(data.items) ? data.items : []);
      setServerTotalPages(data.total_pages || 1);
      setServerTotalCampaigns(data.total || 0);
      setCampaignsLastRefreshedAt(new Date());

      if (data.page && data.page !== currentPage) {
        setCurrentPage(data.page);
      }
    } catch (error) {
      console.error(error);
      notifyError("CRM", error.message || "Impossible de charger les campagnes CRM.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyCampaignFilters() {
    playClick();

    const sortParams = getBackendSortParams(sortMode);

    setCurrentPage(1);
    resetCampaignViewState();

    await loadCampaigns({
      status: statusFilter,
      search: searchFilter,
      page: 1,
      page_size: pageSize,
      ...sortParams,
    });

    await loadCampaignStatusSummary();
  }

  function handleExportFilteredAuditLogsCsv() {
  if (!filteredAuditLogs || filteredAuditLogs.length === 0) {
    notifyError("CRM", "Aucun audit log à exporter avec les filtres actuels.");
    return;
  }

  const headers = [
    "id",
    "created_at",
    "campaign_id",
    "action",
    "status",
    "total_target_players",
    "eligible_count",
    "already_executed_count",
    "message",
  ];

  const escapeCsvValue = (value) => {
    const cleanValue = value === null || value === undefined ? "" : String(value);
    return `"${cleanValue.replaceAll('"', '""')}"`;
  };

  const rows = filteredAuditLogs.map((log) => [
    log.id || "",
    log.created_at || "",
    log.campaign_id || "",
    log.action || "",
    log.status || "",
    log.total_target_players ?? 0,
    log.eligible_count ?? 0,
    log.already_executed_count ?? 0,
    log.message || "",
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `crm_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  notifySuccess("CRM", `Export CSV généré : ${filteredAuditLogs.length} logs.`);
}

  async function handleExportAllMatchingAuditLogsCsv() {
    if (exportingCsv) {
      notifyError("CRM", "Un export CSV est déjà en cours.");
      return;
    }

    try {
      setExportingCsv(true);

      const exportUrl = getCrmAuditLogsExportUrl({
        status: auditStatusFilter,
        action: auditActionFilter,
        search: auditSearchFilter,
      });

      await downloadCsvWithAuth(
        exportUrl,
        `crm_audit_logs_filtered_${new Date().toISOString().slice(0, 10)}.csv`
      );

      notifySuccess("CRM", "Export complet des audit logs filtrés téléchargé.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", error.message || "Impossible d’exporter les audit logs filtrés.");
    } finally {
      setExportingCsv(false);
    }
  }

  function handleExportVisibleCampaignsCsv() {
  if (!paginatedCampaigns || paginatedCampaigns.length === 0) {
    notifyError("CRM", "Aucune campagne visible à exporter.");
    return;
  }

  const headers = [
    "id",
    "name",
    "segment",
    "target_segment",
    "action_type",
    "reward_amount",
    "message",
    "schedule_type",
    "status",
    "scheduled_at",
    "executed_at",
    "archived_at",
    "is_ab_test",
    "ab_test_enabled",
    "variant_name",
    "parent_campaign_id",
    "promoted_from_ab_test",
    "is_active",
    "created_at",
  ];

  const escapeCsvValue = (value) => {
    const cleanValue = value === null || value === undefined ? "" : String(value);
    return `"${cleanValue.replaceAll('"', '""')}"`;
  };

  const rows = paginatedCampaigns.map((campaign) => [
    campaign.id || "",
    campaign.name || "",
    campaign.segment || "",
    campaign.target_segment || "",
    campaign.action_type || "",
    campaign.reward_amount ?? 0,
    campaign.message || "",
    campaign.schedule_type || "",
    campaign.status || "",
    campaign.scheduled_at || "",
    campaign.executed_at || "",
    campaign.archived_at || "",
    campaign.is_ab_test ?? false,
    campaign.ab_test_enabled ?? false,
    campaign.variant_name || "",
    campaign.parent_campaign_id || "",
    campaign.promoted_from_ab_test ?? false,
    campaign.is_active ?? true,
    campaign.created_at || "",
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `crm_campaigns_visible_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  notifySuccess("CRM", `Export CSV généré : ${paginatedCampaigns.length} campagnes visibles.`);
}

  async function handleExportAllMatchingCampaignsCsv() {
    if (exportingCsv) {
      notifyError("CRM", "Un export CSV est déjà en cours.");
      return;
    }

    try {
      setExportingCsv(true);

      const sortParams = getBackendSortParams(sortMode);

      const exportUrl = getCrmCampaignsExportUrl({
        status: statusFilter,
        search: searchFilter,
        ...sortParams,
      });

      await downloadCsvWithAuth(
        exportUrl,
        `crm_campaigns_filtered_${new Date().toISOString().slice(0, 10)}.csv`
      );

      notifySuccess("CRM", "Export complet des campagnes filtrées téléchargé.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", error.message || "Impossible d’exporter les campagnes filtrées.");
    } finally {
      setExportingCsv(false);
    }
  }

  async function handleResetCampaignFilters() {
    playClick();

    setStatusFilter("all");
    setSearchFilter("");
    setSortBy("created_at");
    setSortOrder("desc");
    setSortMode("created_desc");
    setCurrentPage(1);
    setPageSize(10);
    setReadinessFilter("all");
    setAuditStatusFilter("all");
    setAuditActionFilter("all");
    setAuditSearchFilter("");
    resetCampaignViewState();

    await loadCampaigns({
      status: "all",
      search: "",
      page: 1,
      page_size: 10,
      sort_by: "created_at",
      sort_order: "desc",
    });

    await loadCampaignStatusSummary();
  }

  async function loadAuditLogs(limit = auditLimit) {
    try {
      const data = await getCrmAuditLogsAdmin(limit);
      setAuditLogs(Array.isArray(data) ? data : []);
      setAuditLogsLastRefreshedAt(new Date());
    } catch (error) {
      console.error(error);
      notifyError("CRM", error.message || "Impossible de charger les audit logs CRM.");
    }
  }

  async function loadSchedulerStatus() {
    try {
      const data = await getCrmSchedulerStatusAdmin();
      setSchedulerStatus(data);
    } catch (error) {
      console.error(error);
      setSchedulerStatus(null);
    }
  }

  async function loadCampaignStatusSummary() {
    try {
      const data = await getCrmCampaignStatusSummaryAdmin();
      setCampaignStatusSummary(data);
    } catch (error) {
      console.error(error);
      setCampaignStatusSummary(null);
    }
  }

  async function refreshCrmData() {
    const sortParams = getBackendSortParams(sortMode);

    await loadCampaigns({
      status: statusFilter,
      search: searchFilter,
      page: currentPage,
      page_size: pageSize,
      ...sortParams,
    });

    await loadAuditLogs();
    await loadCampaignStatusSummary();
  }

  async function handleRefreshAllCrm() {
    try {
      playClick();

      await refreshCrmData();
      await loadSchedulerStatus();

      notifySuccess("CRM", "Toutes les données CRM ont été rafraîchies.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", "Impossible de rafraîchir toutes les données CRM.");
    }
  }

  async function handleCreate() {
    try {
      await createCrmCampaignAdmin({
        name,
        segment,
        action_type: actionType,
        reward_amount: Number(reward),
        message,
        schedule_type: schedule,
        ab_test_enabled: abEnabled,
        is_ab_test: abEnabled,
        variant_name: variantName,
        parent_campaign_id: parentCampaignId !== "" ? Number(parentCampaignId) : null,
      });

      await refreshCrmData();
      notifySuccess("CRM", "Campaign created successfully.");
    } catch (error) {
      console.error(error);
      notifyError("CRM", error.message || "Impossible de créer la campagne.");
    }
  }

  async function handlePreview(id, options = {}) {
    const { silent = false } = options;

    try {
      const result = await previewCrmCampaignAdmin(id);

      setPreviews((prev) => ({
        ...prev,
        [id]: result,
      }));

      if (!silent) {
        notifySuccess("CRM", `Preview loaded. Eligible players: ${result.eligible_count}`);
      }

      return result;
    } catch (error) {
      console.error(error);

      if (!silent) {
        notifyError("CRM", error.message || "Impossible de prévisualiser la campagne.");
      }

      return null;
    }
  }

  async function handlePreviewAllVisibleCampaigns() {
    if (previewingAll) {
      notifyError("CRM", "Un chargement de previews est déjà en cours.");
      return;
    }

    try {
      setPreviewingAll(true);
      setCancelPreviewAllRequested(false);

      const visibleCampaignsToPreview = paginatedCampaigns.filter(
        (campaign) => campaign.status !== "promoted" && campaign.status !== "archived"
      );

      setPreviewAllProgress({
        done: 0,
        total: visibleCampaignsToPreview.length,
      });

      if (visibleCampaignsToPreview.length === 0) {
        notifyError("CRM", "Aucune campagne visible éligible à prévisualiser.");
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      let completedCount = 0;
      let cancelled = false;

      for (
        let index = 0;
        index < visibleCampaignsToPreview.length;
        index += PREVIEW_CONCURRENCY_LIMIT
      ) {
        if (cancelPreviewAllRequested) {
          cancelled = true;
          break;
        }

        const batch = visibleCampaignsToPreview.slice(
          index,
          index + PREVIEW_CONCURRENCY_LIMIT
        );

        const results = await Promise.allSettled(
          batch.map((campaign) => handlePreview(campaign.id, { silent: true }))
        );

        results.forEach((result) => {
          completedCount += 1;

          if (result.status === "fulfilled" && result.value) {
            successCount += 1;
          } else {
            failedCount += 1;
          }
        });

        setPreviewAllProgress({
          done: completedCount,
          total: visibleCampaignsToPreview.length,
        });
      }

      if (cancelled) {
        notifyError(
          "CRM",
          `Preview All annulé.\n\nRéussies : ${successCount}\nÉchecs : ${failedCount}\nProgression : ${completedCount}/${visibleCampaignsToPreview.length}`
        );
        return;
      }

      notifySuccess(
        "CRM",
        `Preview All terminé.\n\nRéussies : ${successCount}\nÉchecs : ${failedCount}\nProgression : ${completedCount}/${visibleCampaignsToPreview.length}`
      );
    } catch (error) {
      console.error(error);
      notifyError("CRM", "Erreur pendant le chargement des previews visibles.");
    } finally {
      setPreviewingAll(false);
      setCancelPreviewAllRequested(false);
    }
  }

  function handleClearAllVisiblePreviews() {
    const visibleCampaignIds = new Set(
      paginatedCampaigns.map((campaign) => campaign.id)
    );

    setPreviews((prev) => {
      const next = { ...prev };

      visibleCampaignIds.forEach((campaignId) => {
        delete next[campaignId];
      });

      return next;
    });

    notifySuccess("CRM", "Previews visibles supprimées.");
  }

  async function handlePreviewAllVisibleCampaigns() {
    if (previewingAll) {
      notifyError("CRM", "Un chargement de previews est déjà en cours.");
      return;
    }

    try {
      setPreviewingAll(true);

      const visibleCampaignsToPreview = paginatedCampaigns.filter(
        (campaign) => campaign.status !== "promoted" && campaign.status !== "archived"
      );

      if (visibleCampaignsToPreview.length === 0) {
        notifyError("CRM", "Aucune campagne visible éligible à prévisualiser.");
        return;
      }

      for (const campaign of visibleCampaignsToPreview) {
        await handlePreview(campaign.id);
      }

      notifySuccess(
        "CRM",
        `Previews chargées pour ${visibleCampaignsToPreview.length} campagnes visibles.`
      );
    } catch (error) {
      console.error(error);
      notifyError("CRM", "Erreur pendant le chargement des previews visibles.");
    } finally {
      setPreviewingAll(false);
    }
  }

  async function handleExecute(id, isDryRun = false) {
    try {
      let preview = previews[id];

      if (!preview) {
        preview = await handlePreview(id);
      }

      if (!preview) {
        notifyError("CRM", "Impossible d’exécuter sans preview valide.");
        return;
      }

      const eligibleCount = preview.eligible_count || 0;
      const alreadyExecutedCount = preview.already_executed_count || 0;
      const totalTargetPlayers = preview.total_target_players || 0;

      const warningText =
        eligibleCount > WARNING_THRESHOLD
          ? `\n\n⚠️ ATTENTION : cette campagne dépasse le seuil de sécurité de ${WARNING_THRESHOLD} joueurs.`
          : "";

      const confirmation = window.prompt(
        `${isDryRun ? "SIMULATION CRM" : "CONFIRMATION SÉCURISÉE CRM"}\n\n` +
          `Campagne ID : ${id}\n` +
          `Joueurs ciblés au total : ${totalTargetPlayers}\n` +
          `Joueurs déjà exécutés : ${alreadyExecutedCount}\n` +
          `Joueurs qui vont recevoir la campagne : ${eligibleCount}` +
          warningText +
          `\n\nPour confirmer, tape exactement : EXECUTE`
      );

      if (confirmation !== "EXECUTE") {
        notifyError("CRM", "Action annulée. Tu dois taper exactement EXECUTE.");
        return;
      }

      const result = await executeCrmCampaignAdmin(id, {
        confirmation: "EXECUTE",
        warning_threshold: WARNING_THRESHOLD,
        dry_run: isDryRun,
        high_impact_confirmation: eligibleCount > WARNING_THRESHOLD ? "HIGH IMPACT" : "",
      });

      await refreshCrmData();

      const refreshedPreview = await previewCrmCampaignAdmin(id);

      setPreviews((prev) => ({
        ...prev,
        [id]: refreshedPreview,
      }));

      notifySuccess(
        "CRM",
        isDryRun
          ? `SIMULATION CRM réussie.\n\nCampagne ID : ${id}\nJoueurs ciblés : ${
              result.total_target_players ?? totalTargetPlayers
            }\nÉligibles : ${result.eligible_count ?? eligibleCount}\nDéjà exécutés : ${
              result.already_executed_count ?? alreadyExecutedCount
            }\n\nAucune action réelle n’a été effectuée.`
          : `Campagne exécutée avec succès.\n\nCampagne ID : ${id}\nJoueurs impactés : ${
              result.eligible_count ?? eligibleCount
            }\nDéjà exécutés avant lancement : ${
              result.already_executed_count ?? alreadyExecutedCount
            }\nTotal ciblé : ${result.total_target_players ?? totalTargetPlayers}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.detail?.technical_error ||
          error?.message ||
          "Impossible d’exécuter la campagne."
      );
      await loadAuditLogs();
    }
  }

  async function handleSchedule(id) {
    try {
      const scheduledAt = window.prompt(
        "Programme cette campagne CRM.\n\nFormat attendu : YYYY-MM-DDTHH:MM\nExemple : 2026-04-28T21:30"
      );

      if (!scheduledAt) {
        notifyError("CRM", "Programmation annulée.");
        return;
      }

      const result = await scheduleCrmCampaignAdmin(id, {
        scheduled_at: scheduledAt,
      });

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Campagne programmée avec succès.\n\nCampagne ID : ${result.campaign_id}\nStatut : ${result.status}\nDate prévue : ${result.scheduled_at}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant la programmation de la campagne CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleAbResults(campaignId) {
    try {
      const data = await getCrmAbResultsAdmin(campaignId);
      const variants = data.variants || {};

      const lines = Object.entries(variants)
        .map(([variant, stats]) => {
          return `Variante ${variant} : ${stats.players || 0} joueurs (${stats.percentage || 0}%)`;
        })
        .join("\n");

      notifySuccess(
        "CRM A/B Results",
        `Résultats A/B — ${data.campaign_name || `Campagne ${campaignId}`}\n\n` +
          `Total joueurs : ${data.total_players || 0}\n` +
          `Variante gagnante : ${data.winning_variant || "Aucune"}\n\n` +
          (lines || "Aucune donnée A/B disponible pour le moment.") +
          `\n\nRecommandation :\n${data.recommendation || "-"}`
      );
    } catch (error) {
      console.error(error);
      notifyError("CRM", error.message || "Erreur chargement résultats A/B.");
    }
  }

  async function handlePromoteAbWinner(campaignId) {
    try {
      const minExecutionsInput = window.prompt(
        "SEUIL MINIMUM A/B\n\nCombien d'exécutions minimum avant promotion ?\n\nValeur recommandée : 10",
        "10"
      );

      if (!minExecutionsInput) {
        notifyError("CRM", "Promotion annulée.");
        return;
      }

      const minExecutions = Number(minExecutionsInput);

      if (!Number.isFinite(minExecutions) || minExecutions < 1) {
        notifyError("CRM", "Le seuil minimum doit être un nombre supérieur ou égal à 1.");
        return;
      }

      const confirmation = window.prompt(
        `PROMOUVOIR LA VARIANTE GAGNANTE A/B\n\nCampagne ID : ${campaignId}\nSeuil minimum : ${minExecutions} exécutions\n\nCette action va créer une nouvelle campagne CRM normale basée sur la variante gagnante.\n\nPour confirmer, tape exactement : PROMOTE`
      );

      if (confirmation !== "PROMOTE") {
        notifyError("CRM", "Promotion annulée. Tu dois taper exactement PROMOTE.");
        return;
      }

      const result = await promoteCrmAbWinnerAdmin(campaignId, {
        min_executions: minExecutions,
      });

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Variante gagnante promue avec succès.\n\nCampagne source : ${
          result.source_campaign_id
        }\nNouveau statut source : ${
          result.source_campaign_status || "promoted"
        }\nVariante gagnante : ${result.winning_variant}\nExécutions A/B : ${
          result.total_players
        }\nNouvelle campagne : ${result.new_campaign_id}\n\nNom : ${
          result.new_campaign?.name
        }\nReward : ${result.new_campaign?.reward_amount}`
      );
    } catch (error) {
      console.error(error);
      notifyError("CRM", error?.detail?.message || error?.message || "Promotion bloquée ou impossible.");
      await loadAuditLogs();
    }
  }

  async function handleCancelScheduledCampaign(id) {
    try {
      const confirmation = window.prompt(
        `ANNULER LA PROGRAMMATION CRM\n\nCampagne ID : ${id}\n\nPour confirmer l'annulation, tape exactement : CANCEL`
      );

      if (confirmation !== "CANCEL") {
        notifyError("CRM", "Annulation stoppée. Tu dois taper exactement CANCEL.");
        return;
      }

      const result = await cancelScheduledCrmCampaignAdmin(id);

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Programmation annulée avec succès.\n\nCampagne ID : ${result.campaign_id}\nNouveau statut : ${result.status}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant l'annulation de la programmation CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleArchiveCampaign(id) {
    try {
      const confirmation = window.prompt(
        `ARCHIVER LA CAMPAGNE CRM\n\nCampagne ID : ${id}\n\nCette action masque la campagne et empêche son exécution.\n\nPour confirmer, tape exactement : ARCHIVE`
      );

      if (confirmation !== "ARCHIVE") {
        notifyError("CRM", "Archivage annulé. Tu dois taper exactement ARCHIVE.");
        return;
      }

      const result = await archiveCrmCampaignAdmin(id);

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Campagne archivée avec succès.\n\nCampagne ID : ${result.campaign_id}\nStatut : ${result.status}\nArchivée le : ${result.archived_at}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message || error?.message || "Erreur pendant l’archivage de la campagne CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleUnarchiveCampaign(id) {
    try {
      const confirmation = window.prompt(
        `RESTAURER LA CAMPAGNE CRM\n\nCampagne ID : ${id}\n\nCette action remet la campagne en draft.\n\nPour confirmer, tape exactement : UNARCHIVE`
      );

      if (confirmation !== "UNARCHIVE") {
        notifyError("CRM", "Restauration annulée. Tu dois taper exactement UNARCHIVE.");
        return;
      }

      const result = await unarchiveCrmCampaignAdmin(id);

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Campagne restaurée avec succès.\n\nCampagne ID : ${result.campaign_id}\nNouveau statut : ${result.status}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant la restauration de la campagne CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleDuplicateCampaign(id) {
    try {
      const confirmation = window.prompt(
        `DUPLIQUER LA CAMPAGNE CRM\n\nCampagne ID : ${id}\n\nCette action va créer une nouvelle campagne en draft avec la même configuration.\n\nPour confirmer, tape exactement : DUPLICATE`
      );

      if (confirmation !== "DUPLICATE") {
        notifyError("CRM", "Duplication annulée. Tu dois taper exactement DUPLICATE.");
        return;
      }

      const result = await duplicateCrmCampaignAdmin(id);

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Campagne dupliquée avec succès.\n\nCampagne source : ${result.source_campaign_id}\nNouvelle campagne : ${result.new_campaign_id}\n\nNom : ${result.new_campaign?.name}\nStatut : ${result.new_campaign?.status}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant la duplication de la campagne CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleEditCampaign(campaign) {
    try {
      if (campaign.status !== "draft") {
        notifyError("CRM", "Seules les campagnes en draft peuvent être modifiées.");
        return;
      }

      const updatedName = window.prompt("Nouveau nom de campagne :", campaign.name || "");
      if (!updatedName) return notifyError("CRM", "Modification annulée.");

      const updatedSegment = window.prompt(
        "Nouveau segment :",
        campaign.target_segment || campaign.segment || "inactive_users"
      );
      if (!updatedSegment) return notifyError("CRM", "Modification annulée.");

      const updatedMessage = window.prompt("Nouveau message :", campaign.message || "");
      if (updatedMessage === null) return notifyError("CRM", "Modification annulée.");

      const updatedRewardInput = window.prompt("Nouveau reward amount :", String(campaign.reward_amount ?? 0));
      if (updatedRewardInput === null) return notifyError("CRM", "Modification annulée.");

      const updatedReward = Number(updatedRewardInput);
      if (!Number.isFinite(updatedReward) || updatedReward < 0) {
        notifyError("CRM", "Le reward doit être un nombre supérieur ou égal à 0.");
        return;
      }

      const confirmation = window.prompt(
        `MODIFIER LA CAMPAGNE CRM\n\nCampagne ID : ${campaign.id}\n\nPour confirmer la modification, tape exactement : UPDATE`
      );

      if (confirmation !== "UPDATE") {
        notifyError("CRM", "Modification annulée. Tu dois taper exactement UPDATE.");
        return;
      }

      const result = await updateCrmCampaignAdmin(campaign.id, {
        name: updatedName,
        segment: updatedSegment,
        message: updatedMessage,
        reward_amount: updatedReward,
      });

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Campagne modifiée avec succès.\n\nCampagne ID : ${result.campaign_id}\nNom : ${result.name}\nSegment : ${result.segment}\nReward : ${result.reward_amount}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant la modification de la campagne CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleDeleteDraftCampaign(campaign) {
    try {
      if (campaign.status !== "draft") {
        notifyError("CRM", "Seules les campagnes en draft peuvent être supprimées.");
        return;
      }

      const confirmation = window.prompt(
        `SUPPRIMER LA CAMPAGNE CRM\n\nCampagne ID : ${campaign.id}\nNom : ${campaign.name}\n\nCette action est définitive.\n\nPour confirmer, tape exactement : DELETE`
      );

      if (confirmation !== "DELETE") {
        notifyError("CRM", "Suppression annulée. Tu dois taper exactement DELETE.");
        return;
      }

      const result = await deleteDraftCrmCampaignAdmin(campaign.id);

      await refreshCrmData();

      notifySuccess(
        "CRM",
        `Campagne supprimée avec succès.\n\nCampagne ID : ${result.deleted_campaign?.campaign_id}\nNom : ${result.deleted_campaign?.name}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant la suppression de la campagne CRM."
      );
      await loadAuditLogs();
    }
  }

  async function handleRunDueScheduledCampaigns() {
    try {
      const confirmation = window.prompt(
        "EXÉCUTER LES CAMPAGNES PROGRAMMÉES\n\nCette action va lancer toutes les campagnes CRM programmées dont la date est dépassée.\n\nPour confirmer, tape exactement : RUN"
      );

      if (confirmation !== "RUN") {
        notifyError("CRM", "Action annulée. Tu dois taper exactement RUN.");
        return;
      }

      const result = await runDueScheduledCrmCampaignsAdmin();

      await refreshCrmData();
      await loadSchedulerStatus();

      notifySuccess(
        "CRM",
        `Campagnes programmées vérifiées.\n\nCampagnes dues : ${result.due_campaigns_count}\nDate de vérification : ${result.checked_at}`
      );
    } catch (error) {
      console.error(error);
      notifyError(
        "CRM",
        error?.detail?.message ||
          error?.message ||
          "Erreur pendant l'exécution des campagnes programmées."
      );
      await loadAuditLogs();
    }
  }

    const sortedCampaigns = campaigns;
    const totalPages = serverTotalPages || 1;
    const paginatedCampaigns = sortedCampaigns.filter((campaign) => {
      if (readinessFilter === "all") {
        return true;
      }

      const preview = previews[campaign.id];
      const readiness = getExecutionReadiness(campaign, preview);

      return readiness.label === readinessFilter;
    });

    const expandedCampaignCount = Object.values(expandedCampaigns).filter(Boolean).length;

    const previewAllPercentage =
      previewAllProgress.total > 0
        ? Math.min(
            100,
            Math.round(
              (previewAllProgress.done / previewAllProgress.total) * 100
            )
          )
        : 0;

    const visiblePreviewSummary = paginatedCampaigns.reduce(
      (summary, campaign) => {
        const preview = previews[campaign.id];
        const readiness = getExecutionReadiness(campaign, preview);

        if (readiness.label === "Ready") {
        summary.ready += 1;
      } else if (readiness.label === "High impact") {
        summary.highImpact += 1;
      } else if (readiness.label === "No eligible players") {
        summary.noEligible += 1;
      } else if (readiness.label === "Preview required") {
        summary.previewRequired += 1;
      } else {
        summary.locked += 1;
      }

      return summary;
    },
    {
      ready: 0,
      highImpact: 0,
      noEligible: 0,
      previewRequired: 0,
      locked: 0,
    }
  );

    const filteredAuditLogs = auditLogs.filter((log) => {
      const cleanSearch = auditSearchFilter.trim().toLowerCase();

      const matchesStatus =
        auditStatusFilter === "all" || log.status === auditStatusFilter;

      const matchesAction =
        auditActionFilter === "all" || log.action === auditActionFilter;

      const matchesSearch =
        cleanSearch === "" ||
        String(log.id || "").toLowerCase().includes(cleanSearch) ||
        String(log.campaign_id || "").toLowerCase().includes(cleanSearch) ||
        String(log.action || "").toLowerCase().includes(cleanSearch) ||
        String(log.status || "").toLowerCase().includes(cleanSearch) ||
        String(log.message || "").toLowerCase().includes(cleanSearch);

      const isHighImpactLog =
        String(log.action || "").toLowerCase().includes("high_impact") ||
        String(log.message || "").toLowerCase().includes("high impact") ||
        String(log.message || "").toLowerCase().includes("high impact") ||
        String(log.message || "").toLowerCase().includes("seuil sécurité");

      const matchesHighImpact =
        !auditHighImpactOnly || isHighImpactLog;

      return matchesStatus && matchesAction && matchesSearch && matchesHighImpact;
    });

    const auditActions = Array.from(
      new Set(auditLogs.map((log) => log.action).filter(Boolean))
    );

return (
  <div className="card" style={{ marginTop: 24, padding: 16 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h3 style={{ marginBottom: 4 }}>Admin CRM Campaigns</h3>
        <p style={{ margin: 0, opacity: 0.75 }}>
          Gestion des campagnes CRM, previews, dry runs, exécutions et programmations.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            fontSize: 13,
          }}
        >
          Scheduler:{" "}
          <strong style={{ color: schedulerStatus?.enabled ? "#2ecc71" : "#e74c3c" }}>
            {schedulerStatus?.status || "unknown"}
          </strong>
        </div>

        <button onClick={() => { playClick(); loadSchedulerStatus(); }}>
          Refresh Status
        </button>

        <button onClick={handleRefreshAllCrm}>
          Refresh All CRM
        </button>

        <button onClick={() => { playClick(); handleRunDueScheduledCampaigns(); }}>
          Run Due Scheduled
        </button>
      </div>
    </div>

    {campaignStatusSummary && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          ["Total", campaignStatusSummary.total],
          ["Draft", campaignStatusSummary.draft],
          ["Scheduled", campaignStatusSummary.scheduled],
          ["Executed", campaignStatusSummary.executed],
          ["Promoted", campaignStatusSummary.promoted],
          ["Archived", campaignStatusSummary.archived],
          ["Other", campaignStatusSummary.other],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{value ?? 0}</div>
          </div>
        ))}
      </div>
    )}

    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <label>Campaign name</label>
        <br />
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: 280 }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Target segment</label>
        <br />
        <select value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option value="new_users">New Users</option>
          <option value="inactive_users">Inactive Users</option>
          <option value="never_depositors">Never Depositors</option>
          <option value="converted_users">Converted Users</option>
          <option value="vip_users">VIP Users</option>
          <option value="referred_users">Referred Users</option>
          <option value="referrers">Referrers</option>
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Action type</label>
        <br />
        <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
          <option value="reward_tokens">Reward Tokens</option>
          <option value="notification">Notification Only</option>
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Reward amount</label>
        <br />
        <input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Message</label>
        <br />
        <input value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: 360 }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Schedule</label>
        <br />
        <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
          <option value="manual">Manual</option>
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          <input type="checkbox" checked={abEnabled} onChange={(e) => setAbEnabled(e.target.checked)} /> Enable A/B test
        </label>
      </div>

      {abEnabled && (
        <>
          <div style={{ marginBottom: 8 }}>
            <label>Variant name</label>
            <br />
            <select value={variantName} onChange={(e) => setVariantName(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Parent campaign ID optional</label>
            <br />
            <input
              type="number"
              value={parentCampaignId}
              onChange={(e) => setParentCampaignId(e.target.value)}
              placeholder="Leave empty for first variant"
            />
          </div>
        </>
      )}

      <button onClick={() => { playClick(); handleCreate(); }}>
        Create Campaign
      </button>
    </div>

    <div
      style={{
        marginTop: 20,
        marginBottom: 12,
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h4 style={{ margin: 0 }}>Existing Campaigns</h4>
          <p style={{ margin: "4px 0 0", opacity: 0.7 }}>
            Filtre les campagnes CRM par statut ou recherche.
          </p>
          <p style={{ margin: "4px 0 0", opacity: 0.85, fontWeight: 700 }}>
            Campagnes visibles : {sortedCampaigns.length} / {serverTotalCampaigns}
          </p>
          <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: 12 }}>
            Détails ouverts : {expandedCampaignCount}
          </p>

          {previewingAll && (
            <div
              style={{
                marginTop: 10,
                width: "100%",
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>Preview All Progress</span>

                <span>
                  {previewAllProgress.done}/{previewAllProgress.total} (
                  {previewAllPercentage}%)
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: `${previewAllPercentage}%`,
                    height: "100%",
                    background:
                      previewAllPercentage >= 100
                        ? "#2ecc71"
                        : "linear-gradient(90deg, #3498db, #2ecc71)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              fontSize: 12,
            }}
          >
            <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(46, 204, 113, 0.18)", color: "#2ecc71", fontWeight: 700 }}>
              Ready: {visiblePreviewSummary.ready}
            </span>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(241, 196, 15, 0.18)", color: "#f1c40f", fontWeight: 700 }}>
              High Impact: {visiblePreviewSummary.highImpact}
            </span>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(231, 76, 60, 0.18)", color: "#e74c3c", fontWeight: 700 }}>
              No Eligible: {visiblePreviewSummary.noEligible}
            </span>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.08)", fontWeight: 700 }}>
              Preview Required: {visiblePreviewSummary.previewRequired}
            </span>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(149, 165, 166, 0.18)", color: "#95a5a6", fontWeight: 700 }}>
              Locked: {visiblePreviewSummary.locked}
            </span>
          </div>

          <p style={{ margin: "4px 0 0", opacity: 0.65, fontSize: 12 }}>
            Last refreshed: {campaignsLastRefreshedAt ? campaignsLastRefreshedAt.toLocaleTimeString() : "-"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={async (e) => {
              const nextStatus = e.target.value;
              const sortParams = getBackendSortParams(sortMode);

              setStatusFilter(nextStatus);
              setCurrentPage(1);
              resetCampaignViewState();

              await loadCampaigns({
                status: nextStatus,
                search: searchFilter,
                page: 1,
                page_size: pageSize,
                ...sortParams,
              });
            }}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="executed">Executed</option>
            <option value="promoted">Promoted</option>
            <option value="archived">Archived</option>
          </select>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  const sortParams = getBackendSortParams(sortMode);

                  setCurrentPage(1);
                  resetCampaignViewState();

                  await loadCampaigns({
                    status: statusFilter,
                    search: searchFilter,
                    page: 1,
                    page_size: pageSize,
                    ...sortParams,
                  });
                }
              }}
              placeholder="Search name, segment, ID..."
              style={{ minWidth: "220px" }}
            />

            {searchFilter.trim() !== "" && (
              <button
                onClick={async () => {
                  const sortParams = getBackendSortParams(sortMode);

                  playClick();
                  setSearchFilter("");
                  setCurrentPage(1);
                  resetCampaignViewState();

                  await loadCampaigns({
                    status: statusFilter,
                    search: "",
                    page: 1,
                    page_size: pageSize,
                    ...sortParams,
                  });

                  await loadCampaignStatusSummary();
                }}
              >
                Clear Search
              </button>
            )}
          </div>

          <select
            value={sortMode}
            onChange={async (e) => {
              const nextSortMode = e.target.value;
              const sortParams = getBackendSortParams(nextSortMode);

              setSortMode(nextSortMode);
              setCurrentPage(1);
              resetCampaignViewState();

              await loadCampaigns({
                status: statusFilter,
                search: searchFilter,
                page: 1,
                page_size: pageSize,
                ...sortParams,
              });
            }}
          >
            <option value="created_desc">Newest first</option>
            <option value="created_asc">Oldest first</option>
            <option value="id_desc">Highest ID first</option>
            <option value="id_asc">Lowest ID first</option>
            <option value="name_asc">Name A-Z</option>
            <option value="status_asc">Status A-Z</option>
          </select>

          <select
            value={pageSize}
            onChange={async (e) => {
              const nextPageSize = Number(e.target.value);
              const sortParams = getBackendSortParams(sortMode);

              setPageSize(nextPageSize);
              setCurrentPage(1);
              resetCampaignViewState();

              await loadCampaigns({
                status: statusFilter,
                search: searchFilter,
                page: 1,
                page_size: nextPageSize,
                ...sortParams,
              });
            }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <select
            value={readinessFilter}
            onChange={(e) => setReadinessFilter(e.target.value)}
          >
            <option value="all">All readiness</option>
            <option value="Ready">Ready</option>
            <option value="High impact">High Impact</option>
            <option value="No eligible players">No Eligible</option>
            <option value="Preview required">Preview Required</option>
            <option value="Locked: promoted">Locked Promoted</option>
            <option value="Locked: archived">Locked Archived</option>
          </select>

          {readinessFilter !== "all" && (
            <button onClick={() => { playClick(); setReadinessFilter("all"); }}>
              Reset Readiness
            </button>
          )}

          <button onClick={handleApplyCampaignFilters}>Apply</button>

          <button
            disabled={previewingAll}
            onClick={() => { playClick(); handlePreviewAllVisibleCampaigns(); }}
          >
            {previewingAll ? "Previewing..." : "Preview All Visible"}
          </button>

          {previewingAll && (
            <button
              onClick={() => {
                playClick();
                setCancelPreviewAllRequested(true);
              }}
            >
              Cancel Preview All
            </button>
          )}

          <button onClick={() => { playClick(); handleClearAllVisiblePreviews(); }}>
            Clear Visible Previews
          </button>

          <button
            onClick={() => {
              playClick();

              const sortParams = getBackendSortParams(sortMode);

              loadCampaigns({
                status: statusFilter,
                search: searchFilter,
                page: currentPage,
                page_size: pageSize,
                ...sortParams,
              });

              loadCampaignStatusSummary();
            }}
          >
            Refresh Campaigns
          </button>

          <button onClick={() => { playClick(); handleExportVisibleCampaignsCsv(); }}>
            Export Visible CSV
          </button>

          <button
            disabled={exportingCsv}
            onClick={() => { playClick(); handleExportAllMatchingCampaignsCsv(); }}
          >
            {exportingCsv ? "Exporting..." : "Export All Matching CSV"}
          </button>

          <button onClick={() => { playClick(); expandAllVisibleCampaignDetails(); }}>
            Expand Visible Details
          </button>

          <button onClick={() => { playClick(); collapseAllCampaignDetails(); }}>
            Collapse All Details
          </button>

          <button onClick={handleResetCampaignFilters}>Reset</button>
        </div>
      </div>
    </div>

    {loading ? (
      <p>Loading campaigns...</p>
    ) : campaigns.length === 0 ? (
      <p>No campaigns match the current filters.</p>
    ) : sortedCampaigns.length === 0 ? (
      <p>No campaigns match the current filters.</p>
    ) : paginatedCampaigns.length === 0 ? (
      <p>No campaigns match the current readiness filter on this page.</p>
    ) : (
      paginatedCampaigns.map((campaign) => {
        const preview = previews[campaign.id];
        const eligibleCount = preview?.eligible_count || 0;
        const isHighImpact = eligibleCount > WARNING_THRESHOLD;
        const isAbCampaign = campaign.ab_test_enabled || campaign.is_ab_test;
        const isPromotedLocked = campaign.status === "promoted";
        const isArchivedLocked = campaign.status === "archived";
        const isLocked = isPromotedLocked || isArchivedLocked;
        const readiness = getExecutionReadiness(campaign, preview);
        const canExecute = readiness.label === "Ready" || readiness.label === "High impact";

        return (
          <div key={campaign.id} className="simple-list-item">
            <div>
              <strong>#{campaign.id}</strong> — {campaign.name}{" "}

              {isAbCampaign && (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(52, 152, 219, 0.18)", fontSize: 12, fontWeight: 700 }}>
                  A/B
                </span>
              )}

              {isPromotedLocked && (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(46, 204, 113, 0.18)", fontSize: 12, fontWeight: 700 }}>
                  Winner Promoted
                </span>
              )}

              {isArchivedLocked && (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(149, 165, 166, 0.18)", fontSize: 12, fontWeight: 700 }}>
                  Archived
                </span>
              )}

              {preview && (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(52, 152, 219, 0.18)", color: "#3498db", fontSize: 12, fontWeight: 700 }}>
                  Preview Loaded
                </span>
              )}

              {preview && isHighImpact && (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(241, 196, 15, 0.18)", color: "#f1c40f", fontSize: 12, fontWeight: 700 }}>
                  High Impact
                </span>
              )}

              <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: readiness.background, color: readiness.color, fontSize: 12, fontWeight: 700 }}>
                {readiness.label}
              </span>
            </div>

            <div>
              Segment:{" "}
              <span style={{ padding: "3px 8px", borderRadius: 999, fontWeight: 700, fontSize: 12, ...getCampaignSegmentStyle(campaign.target_segment || campaign.segment) }}>
                {campaign.target_segment || campaign.segment}
              </span>{" "}
              | Action:{" "}
              <span style={{ padding: "3px 8px", borderRadius: 999, fontWeight: 700, fontSize: 12, ...getCampaignActionStyle(campaign.action_type || "-") }}>
                {campaign.action_type || "-"}
              </span>{" "}
              | Reward: {campaign.reward_amount ?? 0}
            </div>

            <div>
              Schedule type: {campaign.schedule_type || "manual"} | Status:{" "}
              <span style={{ padding: "3px 8px", borderRadius: 999, fontWeight: 700, fontSize: 12, ...getCampaignStatusStyle(campaign.status || "draft") }}>
                {campaign.status || "draft"}
              </span>
            </div>

            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Message:{" "}
              <span>
                {campaign.message
                  ? campaign.message.length > 90
                    ? `${campaign.message.slice(0, 90)}...`
                    : campaign.message
                  : "-"}
              </span>

              {campaign.message && (
                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => { playClick(); handleCopyCampaignMessage(campaign); }}
                >
                  Copy Message
                </button>
              )}
            </div>

            <div>
              Scheduled at: {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : "-"} | Executed at:{" "}
              {campaign.executed_at ? new Date(campaign.executed_at).toLocaleString() : "-"}
            </div>

            <div>
              A/B: {isAbCampaign ? campaign.variant_name || "Yes" : "No"} | Active: {campaign.is_active ? "Yes" : "No"} | Promoted:{" "}
              {campaign.promoted_from_ab_test || isPromotedLocked ? "Yes" : "No"}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => { playClick(); handleDuplicateCampaign(campaign.id); }}>
                Duplicate
              </button>

              <button onClick={() => { playClick(); handleCopyCampaignSummary(campaign); }}>
                Copy Summary
              </button>

              <button onClick={() => { playClick(); toggleCampaignDetails(campaign.id); }}>
                {expandedCampaigns[campaign.id] ? "Hide Details" : "Show Details"}
              </button>

              {!isLocked && (
                <>
                  <button onClick={() => { playClick(); handlePreview(campaign.id); }}>
                    Preview
                  </button>

                  {preview && (
                    <button onClick={() => { playClick(); handleClearPreview(campaign.id); }}>
                      Clear Preview
                    </button>
                  )}

                  {campaign.status === "draft" && (
                    <>
                      <button onClick={() => { playClick(); handleEditCampaign(campaign); }}>
                        Edit
                      </button>

                      <button onClick={() => { playClick(); handleDeleteDraftCampaign(campaign); }}>
                        Delete Draft
                      </button>
                    </>
                  )}

                  <button onClick={() => { playClick(); handleExecute(campaign.id, true); }}>
                    Dry Run
                  </button>
                </>
              )}

              {isAbCampaign && (
                <>
                  <button onClick={() => { playClick(); handleAbResults(campaign.id); }}>
                    A/B Results
                  </button>

                  {!isLocked && (
                    <button onClick={() => { playClick(); handlePromoteAbWinner(campaign.id); }}>
                      Promote Winner
                    </button>
                  )}
                </>
              )}

              {!isLocked && (
                <>
                  <button onClick={() => { playClick(); handleSchedule(campaign.id); }}>
                    Schedule
                  </button>

                  {campaign.status === "scheduled" && (
                    <button onClick={() => { playClick(); handleCancelScheduledCampaign(campaign.id); }}>
                      Cancel Schedule
                    </button>
                  )}

                  <button
                    disabled={!canExecute}
                    title={!canExecute ? `Execution blocked: ${readiness.label}` : "Execute campaign"}
                    onClick={() => {
                      playClick();

                      if (readiness.label === "High impact") {
                        const confirmation = window.prompt(
                          `HIGH IMPACT EXECUTION\n\n` +
                            `Cette campagne dépasse le seuil de sécurité de ${WARNING_THRESHOLD} joueurs.\n\n` +
                            `Pour continuer vers la confirmation finale, tape exactement : HIGH IMPACT`
                        );

                        if (confirmation !== "HIGH IMPACT") {
                          notifyError("CRM", "Exécution high impact annulée.");
                          return;
                        }
                      }

                      handleExecute(campaign.id, false);
                    }}
                  >
                    Execute
                  </button>

                  {campaign.status !== "scheduled" && (
                    <button onClick={() => { playClick(); handleArchiveCampaign(campaign.id); }}>
                      Archive
                    </button>
                  )}
                </>
              )}

              {isPromotedLocked && (
                <span style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(46, 204, 113, 0.18)", fontSize: 13, fontWeight: 700 }}>
                  Winner Promoted — Locked
                </span>
              )}

              {isArchivedLocked && (
                <>
                  <span style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(149, 165, 166, 0.18)", fontSize: 13, fontWeight: 700 }}>
                    Archived — Locked
                  </span>

                  <button onClick={() => { playClick(); handleUnarchiveCampaign(campaign.id); }}>
                    Unarchive
                  </button>
                </>
              )}
            </div>

            {expandedCampaigns[campaign.id] && (
              <div style={{ marginTop: 10, padding: 10, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, background: "rgba(255,255,255,0.03)", fontSize: 13 }}>
                <div><strong>Campaign ID:</strong> {campaign.id}</div>
                <div><strong>Name:</strong> {campaign.name || "-"}</div>
                <div><strong>Segment:</strong> {campaign.target_segment || campaign.segment || "-"}</div>
                <div><strong>Action type:</strong> {campaign.action_type || "-"}</div>
                <div><strong>Reward amount:</strong> {campaign.reward_amount ?? 0}</div>
                <div><strong>Schedule type:</strong> {campaign.schedule_type || "manual"}</div>
                <div><strong>Status:</strong> {campaign.status || "draft"}</div>
                <div><strong>Scheduled at:</strong> {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : "-"}</div>
                <div><strong>Executed at:</strong> {campaign.executed_at ? new Date(campaign.executed_at).toLocaleString() : "-"}</div>
                <div><strong>Archived at:</strong> {campaign.archived_at ? new Date(campaign.archived_at).toLocaleString() : "-"}</div>
                <div><strong>A/B enabled:</strong> {campaign.ab_test_enabled || campaign.is_ab_test ? "Yes" : "No"}</div>
                <div><strong>Variant:</strong> {campaign.variant_name || "-"}</div>
                <div><strong>Parent campaign ID:</strong> {campaign.parent_campaign_id || "-"}</div>
                <div><strong>Promoted from A/B:</strong> {campaign.promoted_from_ab_test ? "Yes" : "No"}</div>
                <div><strong>Active:</strong> {campaign.is_active ? "Yes" : "No"}</div>
                <div><strong>Created at:</strong> {campaign.created_at ? new Date(campaign.created_at).toLocaleString() : "-"}</div>
                <div style={{ marginTop: 8 }}><strong>Message:</strong> {campaign.message || "-"}</div>
              </div>
            )}

            {preview && (
              <div style={{ marginTop: 10, padding: 10, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8 }}>
                <div>
                  <strong>Preview:</strong> {preview.eligible_count} eligible / {preview.total_target_players} total target players
                </div>

                <div>Already executed: {preview.already_executed_count}</div>

                {isHighImpact && (
                  <div style={{ marginTop: 8, fontWeight: 700 }}>
                    ⚠️ Warning: more than {WARNING_THRESHOLD} players targeted.
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <strong>Sample players:</strong>
                </div>

                {!preview.sample_players || preview.sample_players.length === 0 ? (
                  <p>No eligible players.</p>
                ) : (
                  preview.sample_players.map((player) => (
                    <div key={player.player_id} style={{ fontSize: 13, opacity: 0.85 }}>
                      {player.player_id} — games: {player.games_played} — tier: {player.tier}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })
    )}

    {totalPages > 1 && (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
        <button
          disabled={currentPage === 1}
          onClick={async () => {
            const sortParams = getBackendSortParams(sortMode);
            const nextPage = Math.max(1, currentPage - 1);

            setCurrentPage(nextPage);
            resetCampaignViewState();

            await loadCampaigns({
              status: statusFilter,
              search: searchFilter,
              page: nextPage,
              page_size: pageSize,
              ...sortParams,
            });
          }}
        >
          Prev
        </button>

        <span style={{ fontWeight: 700 }}>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={async () => {
            const sortParams = getBackendSortParams(sortMode);
            const nextPage = Math.min(totalPages, currentPage + 1);

            setCurrentPage(nextPage);
            resetCampaignViewState();

            await loadCampaigns({
              status: statusFilter,
              search: searchFilter,
              page: nextPage,
              page_size: pageSize,
              ...sortParams,
            });
          }}
        >
          Next
        </button>
      </div>
    )}

    <div style={{ marginTop: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h4 style={{ marginBottom: 4 }}>CRM Audit Logs</h4>
          <p style={{ margin: 0, opacity: 0.75 }}>
            Dernières exécutions, simulations, programmations et blocages CRM.
          </p>
          <p style={{ margin: "4px 0 0", opacity: 0.85, fontWeight: 700 }}>
            Logs visibles : {filteredAuditLogs.length} / {auditLogs.length}
          </p>
          <p style={{ margin: "4px 0 0", opacity: 0.65, fontSize: 12 }}>
            Last refreshed: {auditLogsLastRefreshedAt ? auditLogsLastRefreshedAt.toLocaleTimeString() : "-"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={auditStatusFilter} onChange={(e) => setAuditStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="success">success</option>
            <option value="blocked">blocked</option>
            <option value="error">error</option>
            <option value="dry_run">dry_run</option>
            <option value="scheduled">scheduled</option>
          </select>

          <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)}>
            <option value="all">All actions</option>
            {auditActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              playClick();
              setAuditHighImpactOnly((value) => !value);
            }}
            style={{
              fontWeight: 700,
              background: auditHighImpactOnly ? "rgba(241, 196, 15, 0.22)" : undefined,
            }}
          >
            {auditHighImpactOnly ? "High Impact Only: ON" : "High Impact Only"}
          </button>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              value={auditSearchFilter}
              onChange={(e) => setAuditSearchFilter(e.target.value)}
              placeholder="Search logs..."
              style={{ minWidth: "180px" }}
            />

            {auditSearchFilter.trim() !== "" && (
              <button onClick={() => { playClick(); setAuditSearchFilter(""); }}>
                Clear Log Search
              </button>
            )}
          </div>

          <select
            value={auditLimit}
            onChange={async (e) => {
              const nextLimit = Number(e.target.value);
              setAuditLimit(nextLimit);
              await loadAuditLogs(nextLimit);
            }}
          >
            <option value={25}>Last 25</option>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
          </select>

          <button onClick={() => { playClick(); loadAuditLogs(auditLimit); }}>
            Refresh Logs
          </button>

          <button onClick={() => { playClick(); handleExportFilteredAuditLogsCsv(); }}>
            Export Visible CSV
          </button>

          <button
            disabled={exportingCsv}
            onClick={() => { playClick(); handleExportAllMatchingAuditLogsCsv(); }}
          >
            {exportingCsv ? "Exporting..." : "Export All Matching CSV"}
          </button>

          <button
            onClick={() => {
              playClick();
              setAuditStatusFilter("all");
              setAuditActionFilter("all");
              setAuditSearchFilter("");
              setAuditHighImpactOnly(false);
            }}
          >
            Reset Log Filters
          </button>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <p>No CRM audit logs yet.</p>
      ) : filteredAuditLogs.length === 0 ? (
        <p>No CRM audit logs match the current filters.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Date</th>
                <th style={{ textAlign: "left", padding: 8 }}>Campaign</th>
                <th style={{ textAlign: "left", padding: 8 }}>Action</th>
                <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                <th style={{ textAlign: "left", padding: 8 }}>Target</th>
                <th style={{ textAlign: "left", padding: 8 }}>Eligible</th>
                <th style={{ textAlign: "left", padding: 8 }}>Already</th>
                <th style={{ textAlign: "left", padding: 8 }}>Message</th>
                <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAuditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ padding: 8, opacity: 0.85 }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
                  </td>
                  <td style={{ padding: 8 }}>{log.campaign_id ? `#${log.campaign_id}` : "-"}</td>
                  <td style={{ padding: 8 }}>{log.action || "-"}</td>
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 12,
                        ...getAuditStatusStyle(log.status),
                      }}
                    >
                      {log.status || "-"}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>{log.total_target_players ?? 0}</td>
                  <td style={{ padding: 8 }}>{log.eligible_count ?? 0}</td>
                  <td style={{ padding: 8 }}>{log.already_executed_count ?? 0}</td>
                  <td style={{ padding: 8, maxWidth: 360 }}>{log.message || "-"}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => { playClick(); handleCopyAuditLog(log); }}>
                      Copy Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);
}