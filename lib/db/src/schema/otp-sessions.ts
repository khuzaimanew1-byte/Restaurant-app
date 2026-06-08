import { pgTable, serial, varchar, smallint, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const otpSessions = pgTable("otp_sessions", {
  id:        serial("id").primaryKey(),
  email:     varchar("email",     { length: 255 }).notNull(),
  otpHash:   varchar("otp_hash",  { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts:  smallint("attempts").notNull().default(0),
  used:      boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOtpSessionSchema = createInsertSchema(otpSessions).omit({ id: true, createdAt: true });

export type InsertOtpSession = z.infer<typeof insertOtpSessionSchema>;
export type OtpSession       = typeof otpSessions.$inferSelect;
