import { apiRequest } from "./http";

export async function registerUser(email, password, referralCode = "") {
  return apiRequest("/register", {
    method: "POST",
    useAuth: false,
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      email,
      password,
      referral_code: referralCode || null,
    },
  });
}

export async function loginUser(email, password) {
  return apiRequest("/login", {
    method: "POST",
    useAuth: false,
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      email: String(email || "").trim(),
      password,
    },
  });
}