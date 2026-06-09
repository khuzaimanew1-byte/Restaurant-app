const BASE = "/api/auth";

interface ApiError {
  error: string;
  field?: string;
  message: string | string[];
  retryAfterMs?: number;
  expiresAt?: number;
}

export class AppError extends Error {
  code: string;
  field?: string;
  retryAfterMs?: number;
  expiresAt?: number;

  constructor(data: ApiError) {
    const msg = Array.isArray(data.message) ? data.message.join(" · ") : data.message;
    super(msg);
    this.code = data.error;
    this.field = data.field;
    this.retryAfterMs = data.retryAfterMs;
    this.expiresAt = data.expiresAt;
  }
}

async function safeJson<T>(res: Response): Promise<T & ApiError> {
  const text = await res.text().catch(() => "");
  if (!text.trim()) {
    throw new AppError({
      error: "EMPTY_RESPONSE",
      message: res.ok
        ? "Server returned an empty response. Please try again."
        : `Request failed (${res.status}). Please try again.`,
    });
  }
  try {
    return JSON.parse(text) as T & ApiError;
  } catch {
    throw new AppError({
      error: "PARSE_ERROR",
      message: "Unexpected server response. Please try again.",
    });
  }
}

async function post<T>(path: string, body: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AppError({
      error: "NETWORK_ERROR",
      message: "Unable to connect to the server.\nCheck your internet connection and try again.",
    });
  }
  const data = await safeJson<T>(res);
  if (!res.ok) throw new AppError(data as ApiError);
  return data;
}

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`);
  } catch {
    throw new AppError({
      error: "NETWORK_ERROR",
      message: "Unable to connect to the server.\nCheck your internet connection and try again.",
    });
  }
  const data = await safeJson<T>(res);
  if (!res.ok) throw new AppError(data as ApiError);
  return data;
}

/* ── Auth API ──────────────────────────────────────────────── */

export interface LoginResult {
  scenario: "login" | "first-login";
  success?: boolean;
  otpSent?: boolean;
  sessionReused?: boolean;
  expiresAt?: number;
  email?: string;
  role?: string;
  message?: string;
  sessionToken?: string;
  sessionExpiresAt?: number;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  return post<LoginResult>("/login", { email, password });
}

export interface VerifyOtpResult {
  success: boolean;
  email: string;
  role: string;
  sessionToken: string;
  sessionExpiresAt: number;
}

export async function verifyOtp(email: string, otp: string, password: string): Promise<VerifyOtpResult> {
  return post<VerifyOtpResult>("/verify-otp", { email, otp, password });
}

export interface ResendOtpResult {
  otpSent: boolean;
  expiresAt: number;
}

export async function resendOtp(email: string): Promise<ResendOtpResult> {
  return post<ResendOtpResult>("/resend-otp", { email });
}

export interface OtpStatusResult {
  active: boolean;
  remainingMs: number;
  expiresAt?: number;
}

export async function getOtpStatus(email: string): Promise<OtpStatusResult> {
  return get<OtpStatusResult>(`/otp-status?email=${encodeURIComponent(email)}`);
}

export interface SessionResult {
  email: string;
  role: string;
  expiresAt: number;
}

export async function validateSession(token: string): Promise<SessionResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AppError({ error: "NETWORK_ERROR", message: "Unable to connect to the server.\nCheck your internet connection and try again." });
  }
  const data = await res.json() as SessionResult & ApiError;
  if (!res.ok) throw new AppError(data as ApiError);
  return data;
}

export async function logoutSession(token: string): Promise<void> {
  try {
    await fetch(`${BASE}/session`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch { /* best-effort */ }
}

/* ── Forgot Password API ───────────────────────────────────── */

export interface ForgotPasswordResult {
  otpSent: boolean;
  expiresAt: number;
}

export async function forgotPasswordRequest(email: string): Promise<ForgotPasswordResult> {
  return post<ForgotPasswordResult>("/forgot-password", { email });
}

export interface ResetPasswordResult {
  success: boolean;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ResetPasswordResult> {
  return post<ResetPasswordResult>("/reset-password", { email, otp, newPassword, confirmPassword });
}
