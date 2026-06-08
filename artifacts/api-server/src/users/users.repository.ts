import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import {
  db,
  users,
  employees,
  otpSessions,
  userSessions,
  type User,
  type Employee,
  type OtpSession,
  type UserSession,
} from "@workspace/db";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  /* ── Users ─────────────────────────────────────────────── */

  async findUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });
  }

  async createUser(data: {
    email: string;
    role: string;
    passwordHash?: string | null;
    activated?: boolean;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email:        data.email.toLowerCase().trim(),
        role:         data.role,
        passwordHash: data.passwordHash ?? null,
        activated:    data.activated ?? false,
      })
      .returning();
    return user!;
  }

  async updateUser(
    email: string,
    data: Partial<{ passwordHash: string; activated: boolean }>,
  ): Promise<void> {
    await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.email, email.toLowerCase().trim()));
  }

  /* ── Employees ──────────────────────────────────────────── */

  async findEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({
      where: eq(employees.email, email.toLowerCase().trim()),
    });
  }

  /* ── OTP Sessions ───────────────────────────────────────── */

  async findActiveOtpSession(email: string): Promise<OtpSession | undefined> {
    return db.query.otpSessions.findFirst({
      where: and(
        eq(otpSessions.email, email.toLowerCase().trim()),
        eq(otpSessions.used, false),
        gt(otpSessions.expiresAt, new Date()),
      ),
      orderBy: [desc(otpSessions.createdAt)],
    });
  }

  async findLatestOtpSession(email: string): Promise<OtpSession | undefined> {
    return db.query.otpSessions.findFirst({
      where: eq(otpSessions.email, email.toLowerCase().trim()),
      orderBy: [desc(otpSessions.createdAt)],
    });
  }

  async createOtpSession(
    email: string,
    otpHash: string,
    expiresAt: Date,
  ): Promise<OtpSession> {
    const [sess] = await db
      .insert(otpSessions)
      .values({
        email:     email.toLowerCase().trim(),
        otpHash,
        expiresAt,
        attempts:  0,
        used:      false,
      })
      .returning();
    return sess!;
  }

  async invalidateOtpSessions(email: string): Promise<void> {
    await db
      .update(otpSessions)
      .set({ used: true })
      .where(
        and(
          eq(otpSessions.email, email.toLowerCase().trim()),
          eq(otpSessions.used, false),
        ),
      );
  }

  async incrementOtpAttempts(id: number): Promise<void> {
    await db
      .update(otpSessions)
      .set({ attempts: sql`${otpSessions.attempts} + 1` })
      .where(eq(otpSessions.id, id));
  }

  async markOtpUsed(id: number): Promise<void> {
    await db
      .update(otpSessions)
      .set({ used: true })
      .where(eq(otpSessions.id, id));
  }

  /* ── User Sessions ──────────────────────────────────────── */

  async createUserSession(email: string, role: string): Promise<UserSession> {
    const token     = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const [sess]    = await db
      .insert(userSessions)
      .values({ email: email.toLowerCase().trim(), role, token, expiresAt })
      .returning();
    return sess!;
  }

  async findUserSession(token: string): Promise<UserSession | undefined> {
    return db.query.userSessions.findFirst({
      where: and(
        eq(userSessions.token, token),
        gt(userSessions.expiresAt, new Date()),
      ),
    });
  }

  async deleteUserSession(token: string): Promise<void> {
    await db
      .delete(userSessions)
      .where(eq(userSessions.token, token));
  }

  /* ── Bootstrap ──────────────────────────────────────────── */

  async ensureAdminAccount(): Promise<void> {
    const adminEmail = (process.env["ADMIN_GMAIL"] ?? "").toLowerCase().trim();
    if (!adminEmail) {
      this.logger.warn("ADMIN_GMAIL not set — skipping admin account bootstrap.");
      return;
    }

    const emp = await this.findEmployeeByEmail(adminEmail);
    if (!emp) {
      await db.insert(employees).values({
        employeeId:  "ADMIN-001",
        fullName:    "System Administrator",
        email:       adminEmail,
        role:        "ADMIN",
        isActivated: true,
      });
      this.logger.log(`Admin employee created for ${adminEmail}`);
    }

    const user = await this.findUserByEmail(adminEmail);
    if (!user) {
      await this.createUser({ email: adminEmail, role: "ADMIN" });
      this.logger.log(`Admin user record created for ${adminEmail}`);
    }
  }

  get MAX_ATTEMPTS() { return MAX_OTP_ATTEMPTS; }
}
