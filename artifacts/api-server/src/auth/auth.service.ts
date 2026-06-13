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
    const allowed = process.env["ADMIN_GMAIL"];
    if (!allowed || email !== allowed) throw new UnauthorizedException("Not authorized");
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

  async sendOtp(email: string, purpose: "login" | "reset"): Promise<{ success: true }> {
    this.requireAdmin(email);
    this.checkCooldown(email);

    if (purpose === "reset") {
      const rows = await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1);
      if (!rows[0]?.passwordHash) {
        throw new HttpException(
          "No password has been set for this account",
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const otp     = String(Math.floor(100_000 + Math.random() * 900_000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 8 * 60_000);

    await db.delete(otpSessions).where(
      and(eq(otpSessions.email, email), eq(otpSessions.purpose, purpose)),
    );
    await db.insert(otpSessions).values({ email, otpHash, purpose, expiresAt });
    await this.email.sendOtp(email, otp);
    return { success: true };
  }

  async signIn(email: string, password: string): Promise<{ token: string }> {
    this.requireAdmin(email);
    this.checkCooldown(email);

    const rows = await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1);
    const admin = rows[0];

    if (!admin?.passwordHash) throw new UnauthorizedException("Account not set up yet");

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) { this.recordFail(email); throw new UnauthorizedException("Invalid credentials"); }

    this.clearAttempts(email);
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
    if (!session) { this.recordFail(email); throw new UnauthorizedException("Invalid or expired code"); }

    const match = await bcrypt.compare(otp, session.otpHash);
    if (!match)  { this.recordFail(email); throw new UnauthorizedException("Invalid or expired code"); }

    await db.update(otpSessions).set({ usedAt: now }).where(eq(otpSessions.id, session.id));
    this.clearAttempts(email);

    if (purpose === "login" && password) {
      const hash = await bcrypt.hash(password, 12);
      await db.update(adminConfig).set({ passwordHash: hash }).where(eq(adminConfig.email, email));
      const admin = (await db.select().from(adminConfig).where(eq(adminConfig.email, email)).limit(1))[0]!;
      return { success: true, token: signToken({ sub: String(admin.id), email: admin.email }) };
    }

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
    return { token: signToken({ sub: String(admin.id), email: admin.email }) };
  }

  async resendOtp(email: string, purpose: "login" | "reset"): Promise<{ success: true }> {
    return this.sendOtp(email, purpose);
  }
}
