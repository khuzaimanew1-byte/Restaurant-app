import { Injectable } from "@nestjs/common";
import { and, desc, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm";
import { adminConfig, db, otpSessions } from "@workspace/db";
import type { Purp } from "../core/dto.js";

export interface AdmRow {
  id: number;
  email: string;
  pwd: string | null;
}

export interface OtpRow {
  id: number;
  otpHash: string;
  expiresAt: Date;
}

@Injectable()
export class AuthRepo {
  async adm(email: string): Promise<AdmRow | undefined> {
    const [row] = await db
      .select({
        id: adminConfig.id,
        email: adminConfig.email,
        pwd: adminConfig.passwordHash,
      })
      .from(adminConfig)
      .where(eq(adminConfig.email, email))
      .limit(1);
    return row;
  }

  async live(email: string, purp: Purp, now: Date): Promise<OtpRow | undefined> {
    const [row] = await db
      .select({
        id: otpSessions.id,
        otpHash: otpSessions.otpHash,
        expiresAt: otpSessions.expiresAt,
      })
      .from(otpSessions)
      .where(and(
        eq(otpSessions.email, email),
        eq(otpSessions.purpose, purp),
        isNull(otpSessions.usedAt),
        gt(otpSessions.expiresAt, now),
      ))
      .orderBy(desc(otpSessions.createdAt))
      .limit(1);
    return row;
  }

  async addOtp(email: string, otpHash: string, purp: Purp, expiresAt: Date): Promise<number> {
    const [row] = await db
      .insert(otpSessions)
      .values({ email, otpHash, purpose: purp, expiresAt })
      .returning({ id: otpSessions.id });
    return row!.id;
  }

  async gcOtp(now: Date): Promise<void> {
    await db.delete(otpSessions).where(
      or(
        lt(otpSessions.expiresAt, now),
        isNotNull(otpSessions.usedAt),
      ),
    );
  }

  async delOtp(id: number): Promise<void> {
    await db.delete(otpSessions).where(eq(otpSessions.id, id));
  }

  async clmOtp(id: number, now: Date): Promise<boolean> {
    const rows = await db
      .update(otpSessions)
      .set({ usedAt: now })
      .where(and(eq(otpSessions.id, id), isNull(otpSessions.usedAt)))
      .returning({ id: otpSessions.id });
    return rows.length > 0;
  }

  async relOtp(id: number): Promise<void> {
    await db.update(otpSessions).set({ usedAt: null }).where(eq(otpSessions.id, id));
  }

  async setPwd(email: string, hash: string): Promise<AdmRow | undefined> {
    const [row] = await db
      .update(adminConfig)
      .set({ passwordHash: hash })
      .where(eq(adminConfig.email, email))
      .returning({
        id: adminConfig.id,
        email: adminConfig.email,
        pwd: adminConfig.passwordHash,
      });
    return row;
  }
}

