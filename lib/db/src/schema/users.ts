import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  email:        varchar("email",         { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  role:         varchar("role",          { length: 20  }).notNull().default("USER"),
  employeeId:   varchar("employee_id",   { length: 50  }),
  activated:    boolean("activated").notNull().default(false),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User       = typeof users.$inferSelect;
