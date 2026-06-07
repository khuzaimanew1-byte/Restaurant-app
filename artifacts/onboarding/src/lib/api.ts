const BASE = "/api/auth";

interface ApiError {
  error: string;
  field?: string;
  message: string;
  retryAfterMs?: number;
  expiresAt?: number;
}

export class AppError extends Error {
  code: string;
  field?: string;
  retryAfterMs?: number;
  expiresAt?: number;

  constructor(data: ApiError) {
    super(data.message);
    this.code = data.error;
    this.field = data.field;
    this.retryAfterMs = data.retryAfterMs;
    this.expiresAt = data.expiresAt;
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
  const data = await res.json() as T & ApiError;
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
  const data = await res.json() as T & ApiError;
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
}

export async function login(email: string, password: string): Promise<LoginResult> {
  return post<LoginResult>("/login", { email, password });
}

export interface VerifyOtpResult {
  success: boolean;
  email: string;
  role: string;
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
