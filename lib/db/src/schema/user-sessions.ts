import { pgTable, serial, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userSessions = pgTable("user_sessions", {
  id:        serial("id").primaryKey(),
  email:     varchar("email", { length: 255 }).notNull(),
  role:      varchar("role",  { length: 20  }).notNull(),
  token:     uuid("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, createdAt: true });

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession       = typeof userSessions.$inferSelect;
