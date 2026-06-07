import { Router } from "express";
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

/* ── POST /api/auth/login ─────────────────────────────────────────
   Handles all 3 scenarios:
   1. Email not found → EMAIL_NOT_REGISTERED
   2. Email found, no password → sends OTP (first-time activation)
   3. Email found, has password → validates password → login
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim()) {
      res.status(400).json({ error: "VALIDATION", field: "email", message: "Email is required." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: "VALIDATION", field: "email", message: "Enter a valid email address." });
      return;
    }
    if (!password) {
      res.status(400).json({ error: "VALIDATION", field: "password", message: "Password is required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "VALIDATION", field: "password", message: "Password must be at least 6 characters." });
      return;
    }

    const ip = getIp(req);
    const loginLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!loginLimit.allowed) {
      const mins = Math.ceil(loginLimit.retryAfterMs / 60000);
      res.status(429).json({
        error: "RATE_LIMITED",
        message: `Too many login attempts. Please try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
        retryAfterMs: loginLimit.retryAfterMs,
      });
      return;
    }

    const user = await findUserByEmail(email.trim());

    if (!user) {
      res.status(404).json({
        error: "EMAIL_NOT_REGISTERED",
        field: "email",
        message: "This email is not registered.",
      });
      return;
    }

    /* Scenario 3: has password → validate directly */
    if (user.passwordHash) {
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({
          error: "INCORRECT_PASSWORD",
          field: "password",
          message: "Incorrect password. Please try again.",
        });
        return;
      }
      res.json({ scenario: "login", success: true, email: user.email, role: user.role });
      return;
    }

    /* Scenario 2: no password → OTP flow */
    const otpLimit = checkRateLimit(`otp:${email.trim().toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!otpLimit.allowed) {
      /* Check if there's still an active session the user can use */
      const active = await findActiveOtpSession(email.trim());
      if (active) {
        const expiresAt = active.expiresAt.getTime();
        res.json({
          scenario: "first-login",
          otpSent: false,
          sessionReused: true,
          expiresAt,
          message: "An OTP session is already active. Please check your email.",
        });
        return;
      }
      const mins = Math.ceil(otpLimit.retryAfterMs / 60000);
      res.status(429).json({
        error: "RATE_LIMITED",
        message: `Too many OTP requests. Please try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
        retryAfterMs: otpLimit.retryAfterMs,
      });
      return;
    }

    /* Check for still-active OTP session → reuse it */
    const existing = await findActiveOtpSession(email.trim());
    if (existing) {
      const expiresAt = existing.expiresAt.getTime();
      res.json({
        scenario: "first-login",
        otpSent: false,
        sessionReused: true,
        expiresAt,
        message: "An OTP session is already active. Please check your email.",
      });
      return;
    }

    /* Generate + send new OTP */
    await invalidateOtpSessions(email.trim());
    const otp    = generateOtp();
    const hash   = await hashOtp(otp);
    const expiry = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    await createOtpSession(email.trim(), hash, expiry);
    await sendOtpEmail(email.trim(), otp);

    logger.info({ email: email.trim() }, "OTP sent for first-login");

    res.json({
      scenario: "first-login",
      otpSent: true,
      expiresAt: expiry.getTime(),
    });
  } catch (err) {
    logger.error({ err }, "login error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Unable to connect to the server. Please try again." });
  }
});

/* ── POST /api/auth/verify-otp ───────────────────────────────────
   Verifies OTP. On success for first-login: hashes + stores password,
   activates the account.
*/
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body as { email?: string; otp?: string; password?: string };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ error: "VALIDATION", message: "Email and OTP are required." });
      return;
    }

    const ip = getIp(req);
    const limit = checkRateLimit(`otp-verify:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      const mins = Math.ceil(limit.retryAfterMs / 60000);
      res.status(429).json({
        error: "RATE_LIMITED",
        message: `Too many verification attempts. Please try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
        retryAfterMs: limit.retryAfterMs,
      });
      return;
    }

    const session = await findLatestOtpSession(email.trim());
    if (!session) {
      res.status(400).json({ error: "NO_SESSION", message: "No OTP session found. Please request a new code." });
      return;
    }

    if (session.used) {
      res.status(400).json({ error: "OTP_USED", message: "This OTP has already been used. Please request a new code." });
      return;
    }

    const now = Date.now();
    const expiresAt = session.expiresAt.getTime();
    if (now > expiresAt) {
      res.status(400).json({
        error: "OTP_EXPIRED",
        message: "OTP expired. Request a new OTP to continue.",
      });
      return;
    }

    if (session.attempts >= 5) {
      res.status(400).json({
        error: "TOO_MANY_ATTEMPTS",
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
      return;
    }

    const valid = await verifyOtp(otp.trim(), session.otpHash);
    if (!valid) {
      await incrementOtpAttempts(session.objectId, session.attempts);
      const remaining = 5 - (session.attempts + 1);
      res.status(400).json({
        error: "OTP_INCORRECT",
        message: remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
          : "Incorrect code. Too many attempts — please request a new OTP.",
      });
      return;
    }

    await markOtpUsed(session.objectId);

    const user = await findUserByEmail(email.trim());
    if (!user) {
      res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found." });
      return;
    }

    /* First-login: save hashed password, activate account */
    if (!user.passwordHash && password) {
      if (password.length < 6) {
        res.status(400).json({ error: "VALIDATION", field: "password", message: "Password must be at least 6 characters." });
        return;
      }
      const ph = await hashPassword(password);
      await updateUser(user.objectId, { passwordHash: ph, activated: true });
    }

    logger.info({ email: email.trim() }, "OTP verified, account activated");

    res.json({ success: true, email: user.email, role: user.role });
  } catch (err) {
    logger.error({ err }, "verify-otp error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Unable to connect to the server. Please try again." });
  }
});

/* ── POST /api/auth/resend-otp ───────────────────────────────────
   Only generates a new OTP if no active session exists.
*/
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: "VALIDATION", message: "Email is required." });
      return;
    }

    const active = await findActiveOtpSession(email.trim());
    if (active) {
      const expiresAt = active.expiresAt.getTime();
      res.status(400).json({
        error: "SESSION_ACTIVE",
        message: "An OTP session is still active. Please wait for it to expire.",
        expiresAt,
      });
      return;
    }

    const otpLimit = checkRateLimit(`otp:${email.trim().toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!otpLimit.allowed) {
      const mins = Math.ceil(otpLimit.retryAfterMs / 60000);
      res.status(429).json({
        error: "RATE_LIMITED",
        message: `Too many OTP requests. Please try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
        retryAfterMs: otpLimit.retryAfterMs,
      });
      return;
    }

    await invalidateOtpSessions(email.trim());
    const otp    = generateOtp();
    const hash   = await hashOtp(otp);
    const expiry = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    await createOtpSession(email.trim(), hash, expiry);
    await sendOtpEmail(email.trim(), otp);

    res.json({ otpSent: true, expiresAt: expiry.getTime() });
  } catch (err) {
    logger.error({ err }, "resend-otp error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Unable to connect to the server. Please try again." });
  }
});

/* ── GET /api/auth/otp-status ────────────────────────────────────
   Returns remaining seconds for an active OTP session (backend truth).
*/
router.get("/otp-status", async (req, res) => {
  try {
    const email = String(req.query.email ?? "").trim();
    if (!email) {
      res.status(400).json({ error: "VALIDATION", message: "Email is required." });
      return;
    }
    const active = await findActiveOtpSession(email);
    if (!active) {
      res.json({ active: false, remainingMs: 0 });
      return;
    }
    const expiresAt    = active.expiresAt.getTime();
    const remainingMs  = Math.max(0, expiresAt - Date.now());
    res.json({ active: remainingMs > 0, remainingMs, expiresAt });
  } catch (err) {
    logger.error({ err }, "otp-status error");
    res.status(500).json({ error: "SERVER_ERROR", message: "Server error." });
  }
});

export default router;
