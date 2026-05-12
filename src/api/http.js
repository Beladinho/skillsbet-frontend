const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function clearExpiredSession() {
  localStorage.removeItem("skillsbet_player_id");
  localStorage.removeItem("skillsbet_token");
  localStorage.removeItem("skillsbet_role");
  localStorage.removeItem("skillsbet_balance");

  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("wallet");
  localStorage.removeItem("duel_id");
  localStorage.removeItem("scores");
  localStorage.removeItem("xp");
  localStorage.removeItem("badges");

  window.dispatchEvent(new Event("skillsbet:logout"));

  if (window.location.pathname !== "/") {
    window.location.reload();
  }
}

function buildHeaders(customHeaders = {}, useAuth = true) {
  const headers = { ...customHeaders };

  if (useAuth) {
    const token = localStorage.getItem("skillsbet_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body = null,
    headers = {},
    useAuth = true,
  } = options;

  const finalHeaders = buildHeaders(headers, useAuth);

  const fetchOptions = {
    method,
    headers: finalHeaders,
  };

  if (body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, fetchOptions);
  const data = await parseResponse(res);

  if (!res.ok) {
  const errorText =
    typeof data === "string"
      ? data
      : data?.detail || JSON.stringify(data);

  if (res.status === 403) {
    window.dispatchEvent(
      new CustomEvent("skillsbet:error", {
        detail: errorText,
      })
    );

    throw new Error(errorText || "Accès refusé.");
  }

  if (
    res.status === 401 &&
    (errorText.includes("Token expired") ||
      errorText.includes("Invalid token") ||
      errorText.includes("Missing Authorization header"))
  ) {
    clearExpiredSession();
    throw new Error("Session expirée. Merci de vous reconnecter.");
  }

  if (res.status === 404) {
    throw new Error("Ressource introuvable.");
  }

  throw new Error(errorText || "Erreur API");
}

  return data;
}

export { clearExpiredSession, API_URL };