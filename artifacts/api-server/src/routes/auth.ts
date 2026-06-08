import { Router, type Response } from "express";
import {
  findUserByEmail,
  createOtpSession,
  findActiveOtpSession,
  findLatestOtpSession,
  invalidateOtpSessions,
  incrementOtpAttempts,
  markOtpUsed,
  updateUser,
} from "../lib/back4app.js";
import { sendOtpEmail } from "../lib/email.js";
import {
  generateOtp,
  hashOtp,
  verifyOtp,
  hashPassword,
  verifyPassword,
  OTP_TTL_SECONDS,
} from "../lib/otp.js";
import { checkRateLimit } from "../lib/rateLimit.js";
import { logger } from "../lib/logger.js";

const router = Router();

function getIp(req: Express.Request): string {
  return String((req as any).ip ?? "unknown");
}

function pluralMins(ms: number): string {
  const m = Math.ceil(ms / 60000);
  return `${m} minute${m !== 1 ? "s" : ""}`;
}

async function issueNewOtp(email: string): Promise<Date> {
  await invalidateOtpSessions(email);
  const otp    = generateOtp();
  const hash   = await hashOtp(otp);
  const expiry = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
  await createOtpSession(email, hash, expiry);
  await sendOtpEmail(email, otp);
  return expiry;
}

function rateLimited(res: Response, ms: number, message: string) {
  res.status(429).json({ error: "RATE_LIMITED", message, retryAfterMs: ms });
}

/* ── POST /api/auth/login ─────────────────────────────────────────
   1. Email not found → EMAIL_NOT_REGISTERED
   2. Email found, no password → sends OTP (first-time activation)
   3. Email found, has password → validates password → login
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim()) {
      res.status(400).json({ error: "VALIDATION", field: "email", message: "Email is required." }); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: "VALIDATION", field: "email", message: "Enter a valid email address." }); return;
    }
    if (!password) {
      res.status(400).json({ error: "VALIDATION", field: "password", message: "Password is required." }); return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "VALIDATION", field: "password", message: "Password must be at least 6 characters." }); return;
    }

    const loginLimit = checkRateLimit(`login:${getIp(req)}`, 10, 15 * 60 * 1000);
    if (!loginLimit.allowed) {
      rateLimited(res, loginLimit.retryAfterMs, `Too many login attempts. Please try again in ${pluralMins(loginLimit.retryAfterMs)}.`);
      return;
    }

    const user = await findUserByEmail(email.trim());
    if (!user) {
      res.status(404).json({ error: "EMAIL_NOT_REGISTERED", field: "email", message: "This email is not registered." }); return;
    }

    /* Scenario 3: has password → validate directly */
    if (user.passwordHash) {
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "INCORRECT_PASSWORD", field: "password", message: "Incorrect password. Please try again." }); return;
      }
      res.json({ scenario: "login", success: true, email: user.email, role: user.role }); return;
    }

    /* Scenario 2: no password → OTP flow */
    const otpLimit = checkRateLimit(`otp:${email.trim().toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!otpLimit.allowed) {
      const active = await findActiveOtpSession(email.trim());
      if (active) {
        res.json({ scenario: "first-login", otpSent: false, sessionReused: true, expiresAt: active.expiresAt.getTime(), message: "An OTP session is already active. Please check your email." });
        return;
      }
      rateLimited(res, otpLimit.retryAfterMs, `Too many OTP requests. Please try again in ${pluralMins(otpLimit.retryAfterMs)}.`);
      return;
    }

    const existing = await findActiveOtpSession(email.trim());
    if (existing) {
      res.json({ scenario: "first-login", otpSent: false, sessionReused: true, expiresAt: existing.expiresAt.getTime(), message: "An OTP session is already active. Please check your email." });
      return;
    }

    const expiry = await issueNewOtp(email.trim());
    logger.info({ email: email.trim() }, "OTP sent for first-login");
    res.json({ scenario: "first-login", otpSent: true, expiresAt: expiry.getTime() });
  } catch (err) {
    logger.error({ err }, "login error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Unable to connect to the server. Please try again." });
  }
});

/* ── POST /api/auth/verify-otp ── */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body as { email?: string; otp?: string; password?: string };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ error: "VALIDATION", message: "Email and OTP are required." }); return;
    }

    const limit = checkRateLimit(`otp-verify:${getIp(req)}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      rateLimited(res, limit.retryAfterMs, `Too many verification attempts. Please try again in ${pluralMins(limit.retryAfterMs)}.`);
      return;
    }

    const session = await findLatestOtpSession(email.trim());
    if (!session) {
      res.status(400).json({ error: "NO_SESSION", message: "No OTP session found. Please request a new code." }); return;
    }
    if (session.used) {
      res.status(400).json({ error: "OTP_USED", message: "This OTP has already been used. Please request a new code." }); return;
    }
    if (Date.now() > session.expiresAt.getTime()) {
      res.status(400).json({ error: "OTP_EXPIRED", message: "OTP expired. Request a new OTP to continue." }); return;
    }
    if (session.attempts >= 5) {
      res.status(400).json({ error: "TOO_MANY_ATTEMPTS", message: "Too many incorrect attempts. Please request a new OTP." }); return;
    }

    const valid = await verifyOtp(otp.trim(), session.otpHash);
    if (!valid) {
      await incrementOtpAttempts(session.objectId, session.attempts);
      const remaining = 5 - (session.attempts + 1);
      res.status(400).json({
        error: "OTP_INCORRECT",
        message: remaining > 0
          ? "Incorrect code. Please try again."
          : "Incorrect code. Too many attempts — please request a new OTP.",
      });
      return;
    }

    await markOtpUsed(session.objectId);

    const user = await findUserByEmail(email.trim());
    if (!user) {
      res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found." }); return;
    }

    if (!user.passwordHash && password) {
      if (password.length < 6) {
        res.status(400).json({ error: "VALIDATION", field: "password", message: "Password must be at least 6 characters." }); return;
      }
      await updateUser(user.objectId, { passwordHash: await hashPassword(password), activated: true });
    }

    logger.info({ email: email.trim() }, "OTP verified, account activated");
    res.json({ success: true, email: user.email, role: user.role });
  } catch (err) {
    logger.error({ err }, "verify-otp error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Unable to connect to the server. Please try again." });
  }
});

/* ── POST /api/auth/resend-otp ── */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: "VALIDATION", message: "Email is required." }); return;
    }

    const user = await findUserByEmail(email.trim());
    if (!user) {
      res.status(404).json({ error: "EMAIL_NOT_REGISTERED", field: "email", message: "This email is not registered." }); return;
    }
    if (user.passwordHash) {
      res.status(400).json({ error: "NOT_OTP_USER", message: "This account uses a password. Please sign in normally." }); return;
    }

    const active = await findActiveOtpSession(email.trim());
    if (active && active.attempts < 5) {
      res.status(400).json({ error: "SESSION_ACTIVE", message: "An OTP session is still active. Please wait for it to expire.", expiresAt: active.expiresAt.getTime() }); return;
    }
    if (active && active.attempts >= 5) {
      await invalidateOtpSessions(email.trim());
    }

    const otpLimit = checkRateLimit(`otp:${email.trim().toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!otpLimit.allowed) {
      rateLimited(res, otpLimit.retryAfterMs, `Too many OTP requests. Please try again in ${pluralMins(otpLimit.retryAfterMs)}.`);
      return;
    }

    const expiry = await issueNewOtp(email.trim());
    res.json({ otpSent: true, expiresAt: expiry.getTime() });
  } catch (err) {
    logger.error({ err }, "resend-otp error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Unable to connect to the server. Please try again." });
  }
});

/* ── GET /api/auth/otp-status ── */
router.get("/otp-status", async (req, res) => {
  try {
    const email = String(req.query.email ?? "").trim();
    if (!email) {
      res.status(400).json({ error: "VALIDATION", message: "Email is required." }); return;
    }
    const active = await findActiveOtpSession(email);
    if (!active) { res.json({ active: false, remainingMs: 0 }); return; }
    const expiresAt   = active.expiresAt.getTime();
    const remainingMs = Math.max(0, expiresAt - Date.now());
    res.json({ active: remainingMs > 0, remainingMs, expiresAt });
  } catch (err) {
    logger.error({ err }, "otp-status error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Server error." });
  }
});

export default router;
