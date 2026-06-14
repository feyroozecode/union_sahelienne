/** Minimal client-side session persistence (localStorage). */
import type { AuthUser, LoginResponse } from "./api";

const TOKEN_KEY = "us_token";
const REFRESH_KEY = "us_refresh";
const USER_KEY = "us_user";

export function saveSession(res: LoginResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(REFRESH_KEY, res.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  [TOKEN_KEY, REFRESH_KEY, USER_KEY].forEach((k) => localStorage.removeItem(k));
}
