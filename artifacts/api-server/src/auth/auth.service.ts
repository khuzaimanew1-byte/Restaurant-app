import {
  Injectable, Inject, OnModuleInit, UnauthorizedException, HttpException, HttpStatus,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { eq, and, gt, isNull, isNotNull, desc } from "drizzle-orm";
import { db, pool, adminConfig, otpSessions } from "@workspace/db";
import { EmailService } from "./email.service.js";
import { signToken } from "./jwt.util.js";

interface AttemptRecord { count: number; lockedUntil: number | null; }

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly attempts = new Map<string, AttemptRecord>();

  constructor(@Inject(EmailService) private readonly email: EmailService) {}

  // ── Init DB tables on startup ────────────────────────────────────────
  async onModuleInit() {
    const client = await (pool as import("pg").Pool).connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_config (
          id           SERIAL PRIMARY KEY,
          email        VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT,
          created_at   TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS otp_sessions (
          id         SERIAL PRIMARY KEY,
          email      VARCHAR(255) NOT NULL,
          otp_hash   TEXT NOT NULL,
          purpose    VARCHAR(20)  NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used_at    TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      const adminEmail = process.env["ADMIN_GMAIL"];
      if (adminEmail) {
        await client.query(
          `INSERT INTO admin_config (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
          [adminEmail],
        );
      }
    } finally {
      client.release();
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  private requireAdmin(email: string) {
    const allowed = process.env["ADMIN_GMAIL"]?.toLowerCase().trim();
    if (!allowed || email.toLowerCase().trim() !== allowed)
      throw new HttpException("Email not registered", HttpStatus.NOT_FOUND);
  }

  private checkCooldown(email: string) {
    const rec = this.attempts.get(email);
    if (rec?.lockedUntil && Date.now() < rec.lockedUntil) {
      const mins = Math.ceil((rec.lockedUntil - Date.now()) / 60_000);
      throw new HttpException(`Too many attempts. Try again in ${mins} min`, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private recordFail(email: string) {
    const rec = this.attempts.get(email) ?? { count: 0, lockedUntil: null };
    rec.count++;
    if (rec.count >= 5) { rec.lockedUntil = Date.now() + 30 * 60_000; rec.count = 0; }
    this.attempts.set(email, rec);
  }

  private clearAttempts(email: string) { this.attempts.delete(email); }

  // ── Endpoints ────────────────────────────────────────────────────────
  async check(email: string): Promise<{ scene: "first-login" | "existing" }> {
    this.requireAdmin(email);
    const rows = await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1);
    return { scene: rows[0]?.passwordHash ? "existing" : "first-login" };
  }

  async sendOtp(email: string, purpose: "login" | "reset"): Promise<{ success: true; expiresAt: number }> {
    this.requireAdmin(email);
    this.checkCooldown(email);

    const now = new Date();
    const active = await db.select().from(otpSessions).where(
      and(
        eq(otpSessions.email, email),
        eq(otpSessions.purpose, purpose),
        isNull(otpSessions.usedAt),
        gt(otpSessions.expiresAt, now),
      ),
    ).limit(1);

    if (active[0]) {
      const secsLeft = Math.ceil((active[0].expiresAt.getTime() - Date.now()) / 1000);
      const mins = Math.floor(secsLeft / 60);
      const secs = secsLeft % 60;
      const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      throw new HttpException(
        `An OTP was already sent. Please wait ${label} before requesting a new one.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (purpose === "reset") {
      const rows = await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1);
      if (!rows[0]?.passwordHash) {
        throw new HttpException(
          "No password set yet. Complete your account setup first.",
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const otp     = String(Math.floor(100_000 + Math.random() * 900_000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60_000);

    await db.delete(otpSessions).where(
      and(eq(otpSessions.email, email), eq(otpSessions.purpose, purpose)),
    );
    const inserted = await db.insert(otpSessions).values({ email, otpHash, purpose, expiresAt }).returning();
    try {
      await this.email.sendOtp(email, otp, purpose);
    } catch (err) {
      // Roll back the OTP row so the user can retry immediately
      if (inserted[0]) {
        await db.delete(otpSessions).where(eq(otpSessions.id, inserted[0].id));
      }
      throw err;
    }
    return { success: true, expiresAt: expiresAt.getTime() };
  }

  async signIn(email: string, password: string): Promise<{ token: string }> {
    this.requireAdmin(email);
    this.checkCooldown(email);

    const rows = await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1);
    const admin = rows[0];

    if (!admin?.passwordHash)
      throw new HttpException(
        "Account setup incomplete. Sign in to complete setup first.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      this.recordFail(email);
      throw new UnauthorizedException("Incorrect password");
    }

    this.clearAttempts(email);
    const secret = process.env["JWT_SESSION"];
    if (!secret)
      throw new HttpException(
        "Server configuration error. Please contact the administrator.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return { token: signToken({ sub: String(admin.id), email: admin.email }) };
  }

  async verifyOtp(
    email: string, otp: string, purpose: "login" | "reset", password?: string,
  ): Promise<{ token?: string; success: boolean }> {
    this.checkCooldown(email);
    const now = new Date();

    const rows = await db
      .select().from(otpSessions)
      .where(and(
        eq(otpSessions.email,   email),
        eq(otpSessions.purpose, purpose),
        isNull(otpSessions.usedAt),
        gt(otpSessions.expiresAt, now),
      ))
      .orderBy(desc(otpSessions.createdAt))
      .limit(1);

    const session = rows[0];
    if (!session) { this.recordFail(email); throw new UnauthorizedException("Invalid or expired code. Please request a new one."); }

    // Atomically claim the session before verifying — prevents concurrent replay
    const claimed = await db
      .update(otpSessions)
      .set({ usedAt: now })
      .where(and(eq(otpSessions.id, session.id), isNull(otpSessions.usedAt)))
      .returning();

    if (!claimed.length) {
      this.recordFail(email);
      throw new UnauthorizedException("Invalid or expired code. Please request a new one.");
    }

    const match = await bcrypt.compare(otp, session.otpHash);
    if (!match) {
      // Release the claim so the user can retry
      await db.update(otpSessions).set({ usedAt: null }).where(eq(otpSessions.id, session.id));
      this.recordFail(email);
      throw new UnauthorizedException("Incorrect code. Check your email and try again.");
    }

    this.clearAttempts(email);

    if (purpose === "login" && password) {
      const hash = await bcrypt.hash(password, 12);
      await db.update(adminConfig).set({ passwordHash: hash }).where(eq(adminConfig.email, email));
      const admin = (await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1))[0]!;
      // Login OTP fully consumed — remove it
      await db.delete(otpSessions).where(eq(otpSessions.id, session.id));
      return { success: true, token: signToken({ sub: String(admin.id), email: admin.email }) };
    }

    // Reset OTP: keep row with usedAt set — resetPassword reads it to confirm identity
    return { success: true };
  }

  async resetPassword(email: string, password: string): Promise<{ token: string }> {
    this.requireAdmin(email);
    const cutoff = new Date(Date.now() - 15 * 60_000);
    const rows = await db.select().from(otpSessions).where(
      and(
        eq(otpSessions.email,   email),
        eq(otpSessions.purpose, "reset"),
        isNotNull(otpSessions.usedAt),
        gt(otpSessions.usedAt!, cutoff),
      ),
    ).limit(1);

    if (!rows.length) throw new UnauthorizedException("OTP not verified or session expired");

    const hash = await bcrypt.hash(password, 12);
    await db.update(adminConfig).set({ passwordHash: hash }).where(eq(adminConfig.email, email));
    const admin = (await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1))[0]!;
    // Reset OTP fully consumed — remove it so the row doesn't linger
    await db.delete(otpSessions).where(eq(otpSessions.id, rows[0]!.id));
    return { token: signToken({ sub: String(admin.id), email: admin.email }) };
  }

  async resendOtp(email: string, purpose: "login" | "reset"): Promise<{ success: true; expiresAt: number }> {
    this.requireAdmin(email);
    return this.sendOtp(email, purpose);
  }
}
