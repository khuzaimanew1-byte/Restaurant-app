import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const adminConfig = pgTable("admin_config", {
  id:           serial("id").primaryKey(),
  email:        varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const otpSessions = pgTable("otp_sessions", {
  id:        serial("id").primaryKey(),
  email:     varchar("email", { length: 255 }).notNull(),
  otpHash:   text("otp_hash").notNull(),
  purpose:   varchar("purpose", { length: 20 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt:    timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
