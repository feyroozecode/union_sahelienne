/**
 * Thin client for the Union Sahélienne backend.
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL (see .env.*).
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-unionsahel.alfajarsoft.com/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Pull a human-readable message out of a NestJS error body. */
function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.message === "string") return b.message;
    if (Array.isArray(b.message) && b.message.length) return String(b.message[0]);
    if (b.errors && typeof b.errors === "object") {
      const first = Object.values(b.errors as Record<string, unknown>)[0];
      if (typeof first === "string") return first;
    }
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Connexion au serveur impossible. Réessayez.", 0);
  }

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new ApiError(extractMessage(body, "Une erreur est survenue."), res.status);
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// — Types —
export interface OtpChallenge {
  requiresOtp: true;
  channel: "email" | "phone";
  target: string;
  expiresAt: number;
  code?: string; // returned in closed-beta mode
}

export interface AuthUser {
  id: number | string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: string;
  age?: number;
  profession?: string;
  country?: string;
  city?: string;
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<OtpChallenge | void>("/auth/email/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<LoginResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email: string) =>
    request<OtpChallenge>("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ email, channel: "email", purpose: "register" }),
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/email/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};
