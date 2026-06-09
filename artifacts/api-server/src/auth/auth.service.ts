import { Injectable, HttpException, HttpStatus, Logger, Inject } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository.js";
import { OtpService, OTP_TTL_SECONDS } from "../otp/otp.service.js";
import { EmailService } from "../email/email.service.js";
import type { UserSession } from "@workspace/db";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(OtpService)      private readonly otp:   OtpService,
    @Inject(EmailService)    private readonly email:  EmailService,
  ) {}

  /* ── Helpers ─────────────────────────────────────────────── */

  private async issueNewOtp(email: string): Promise<Date> {
    await this.users.invalidateOtpSessions(email);
    const code   = this.otp.generateOtp();
    const hash   = await this.otp.hashOtp(code);
    const expiry = new Date(Date.now() + OTP_TTL_SECONDS * 1_000);
    await this.users.createOtpSession(email, hash, expiry);
    await this.email.sendOtpEmail(email, code);
    return expiry;
  }

  /* ── POST /api/auth/login ───────────────────────────────── */

  async login(email: string, password: string) {
    const normalised = email.toLowerCase().trim();
    let user = await this.users.findUserByEmail(normalised);

    if (!user) {
      const emp = await this.users.findEmployeeByEmail(normalised);
      if (!emp) {
        throw new HttpException(
          { error: "EMAIL_NOT_REGISTERED", field: "email", message: "This email is not registered." },
          HttpStatus.NOT_FOUND,
        );
      }
      if (!emp.isActivated) {
        throw new HttpException(
          { error: "EMPLOYEE_INACTIVE", field: "email", message: "Your account has not been activated yet. Contact your administrator." },
          HttpStatus.FORBIDDEN,
        );
      }
      user = await this.users.createUser({ email: normalised, role: emp.role });
    }

    /* Returning user with password set */
    if (user.passwordHash) {
      const valid = await this.otp.verifyPassword(password, user.passwordHash);
      if (!valid) {
        throw new HttpException(
          { error: "INCORRECT_PASSWORD", field: "password", message: "Incorrect password. Please try again." },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const sess = await this.users.createUserSession(user.email, user.role);
      return {
        scenario:        "login",
        success:         true,
        email:           user.email,
        role:            user.role,
        sessionToken:    sess.token,
        sessionExpiresAt: sess.expiresAt.getTime(),
      };
    }

    /* First-time login — reuse active OTP or send a new one */
    const existing = await this.users.findActiveOtpSession(normalised);
    if (existing) {
      return {
        scenario:     "first-login",
        otpSent:      false,
        sessionReused: true,
        expiresAt:    existing.expiresAt.getTime(),
        message:      "An OTP session is already active. Please check your email.",
      };
    }

    const expiry = await this.issueNewOtp(normalised);
    this.logger.log(`OTP sent for first-login: ${normalised}`);
    return { scenario: "first-login", otpSent: true, expiresAt: expiry.getTime() };
  }

  /* ── POST /api/auth/verify-otp ─────────────────────────── */

  async verifyOtp(email: string, otpCode: string, password: string) {
    const normalised = email.toLowerCase().trim();

    const session = await this.users.findLatestOtpSession(normalised);
    if (!session) {
      throw new HttpException(
        { error: "NO_SESSION", message: "No OTP session found. Please request a new code." },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (session.used) {
      throw new HttpException(
        { error: "OTP_USED", message: "This OTP has already been used. Please request a new code." },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (Date.now() > session.expiresAt.getTime()) {
      throw new HttpException(
        { error: "OTP_EXPIRED", message: "OTP expired. Request a new OTP to continue." },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (session.attempts >= this.users.MAX_ATTEMPTS) {
      throw new HttpException(
        { error: "TOO_MANY_ATTEMPTS", message: "Too many incorrect attempts. Please request a new OTP." },
        HttpStatus.BAD_REQUEST,
      );
    }

    const valid = await this.otp.verifyOtp(otpCode.trim(), session.otpHash);
    if (!valid) {
      await this.users.incrementOtpAttempts(session.id);
      const remaining = this.users.MAX_ATTEMPTS - (session.attempts + 1);
      throw new HttpException(
        {
          error:   "OTP_INCORRECT",
          message: remaining > 0
            ? "Incorrect code. Please try again."
            : "Incorrect code. Too many attempts — please request a new OTP.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.users.markOtpUsed(session.id);

    let user = await this.users.findUserByEmail(normalised);
    if (!user) {
      throw new HttpException(
        { error: "USER_NOT_FOUND", message: "User not found." },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.passwordHash && password.length >= 8) {
      const pwHash = await this.otp.hashPassword(password);
      await this.users.updateUser(normalised, { passwordHash: pwHash, activated: true });
    }

    this.logger.log(`OTP verified, account activated: ${normalised}`);
    const sess = await this.users.createUserSession(user.email, user.role);
    return {
      success:          true,
      email:            user.email,
      role:             user.role,
      sessionToken:     sess.token,
      sessionExpiresAt: sess.expiresAt.getTime(),
    };
  }

  /* ── POST /api/auth/resend-otp ──────────────────────────── */

  async resendOtp(email: string) {
    const normalised = email.toLowerCase().trim();

    const user = await this.users.findUserByEmail(normalised);
    if (!user) {
      throw new HttpException(
        { error: "EMAIL_NOT_REGISTERED", field: "email", message: "This email is not registered." },
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.passwordHash) {
      throw new HttpException(
        { error: "NOT_OTP_USER", message: "This account uses a password. Please sign in normally." },
        HttpStatus.BAD_REQUEST,
      );
    }

    const active = await this.users.findActiveOtpSession(normalised);
    if (active && active.attempts < this.users.MAX_ATTEMPTS) {
      throw new HttpException(
        {
          error:     "SESSION_ACTIVE",
          message:   "An OTP session is still active. Please wait for it to expire.",
          expiresAt: active.expiresAt.getTime(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (active && active.attempts >= this.users.MAX_ATTEMPTS) {
      await this.users.invalidateOtpSessions(normalised);
    }

    const expiry = await this.issueNewOtp(normalised);
    return { otpSent: true, expiresAt: expiry.getTime() };
  }

  /* ── GET /api/auth/otp-status ───────────────────────────── */

  async getOtpStatus(email: string) {
    const active = await this.users.findActiveOtpSession(email.toLowerCase().trim());
    if (!active) return { active: false, remainingMs: 0 };
    const remainingMs = Math.max(0, active.expiresAt.getTime() - Date.now());
    return { active: remainingMs > 0, remainingMs, expiresAt: active.expiresAt.getTime() };
  }

  /* ── POST /api/auth/forgot-password ─────────────────────── */

  async forgotPassword(email: string) {
    const normalised = email.toLowerCase().trim();

    const user = await this.users.findUserByEmail(normalised);
    if (!user) {
      const emp = await this.users.findEmployeeByEmail(normalised);
      if (!emp) {
        throw new HttpException(
          { error: "EMAIL_NOT_REGISTERED", field: "email", message: "This email is not registered." },
          HttpStatus.NOT_FOUND,
        );
      }
      /* Employee exists but no user record yet — no password to reset */
      throw new HttpException(
        { error: "NO_PASSWORD_SET", field: "email", message: "This account has no password set. Sign in with your OTP instead." },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!user.passwordHash) {
      throw new HttpException(
        { error: "NO_PASSWORD_SET", field: "email", message: "This account has no password set. Sign in with your OTP instead." },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const expiry = await this.issueNewOtp(normalised);
    this.logger.log(`Forgot-password OTP sent: ${normalised}`);
    return { otpSent: true, expiresAt: expiry.getTime() };
  }

  /* ── POST /api/auth/reset-password ──────────────────────── */

  async resetPassword(email: string, otpCode: string, newPassword: string, confirmPassword: string) {
    const normalised = email.toLowerCase().trim();

    if (newPassword !== confirmPassword) {
      throw new HttpException(
        { error: "PASSWORD_MISMATCH", field: "confirmPassword", message: "Passwords do not match." },
        HttpStatus.BAD_REQUEST,
      );
    }

    const session = await this.users.findLatestOtpSession(normalised);
    if (!session) {
      throw new HttpException(
        { error: "NO_SESSION", message: "No OTP session found. Please request a new code." },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (session.used) {
      throw new HttpException(
        { error: "OTP_USED", message: "This OTP has already been used. Please request a new code." },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (Date.now() > session.expiresAt.getTime()) {
      throw new HttpException(
        { error: "OTP_EXPIRED", message: "OTP expired. Request a new code to continue." },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (session.attempts >= this.users.MAX_ATTEMPTS) {
      throw new HttpException(
        { error: "TOO_MANY_ATTEMPTS", message: "Too many incorrect attempts. Please request a new OTP." },
        HttpStatus.BAD_REQUEST,
      );
    }

    const valid = await this.otp.verifyOtp(otpCode.trim(), session.otpHash);
    if (!valid) {
      await this.users.incrementOtpAttempts(session.id);
      const remaining = this.users.MAX_ATTEMPTS - (session.attempts + 1);
      throw new HttpException(
        {
          error:   "OTP_INCORRECT",
          message: remaining > 0
            ? "Incorrect code. Please try again."
            : "Incorrect code. Too many attempts — please request a new OTP.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.users.markOtpUsed(session.id);

    const user = await this.users.findUserByEmail(normalised);
    if (!user) {
      throw new HttpException(
        { error: "USER_NOT_FOUND", message: "User not found." },
        HttpStatus.NOT_FOUND,
      );
    }

    const pwHash = await this.otp.hashPassword(newPassword);
    await this.users.updateUser(normalised, { passwordHash: pwHash, activated: true });

    this.logger.log(`Password reset via OTP: ${normalised}`);
    return { success: true };
  }

  /* ── GET /api/auth/session ──────────────────────────────── */

  async getSession(session: UserSession) {
    return {
      email:     session.email,
      role:      session.role,
      expiresAt: session.expiresAt.getTime(),
    };
  }

  /* ── DELETE /api/auth/session ───────────────────────────── */

  async deleteSession(token: string): Promise<void> {
    if (token) await this.users.deleteUserSession(token);
  }
}
