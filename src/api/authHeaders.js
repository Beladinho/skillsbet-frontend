export function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("skillsbet_token");

  if (!token) {
    return {
      ...extraHeaders,
    };
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}