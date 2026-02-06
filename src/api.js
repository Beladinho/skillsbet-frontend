export const safePost = async (url, data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid payload");
  }

  return api.post(url, data);
};



