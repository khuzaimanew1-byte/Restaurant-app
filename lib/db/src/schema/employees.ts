import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id:          serial("id").primaryKey(),
  employeeId:  varchar("employee_id", { length: 50 }).notNull().unique(),
  fullName:    varchar("full_name",   { length: 255 }).notNull(),
  email:       varchar("email",       { length: 255 }).notNull().unique(),
  role:        varchar("role",        { length: 20  }).notNull().default("EMPLOYEE"),
  isActivated: boolean("is_activated").notNull().default(false),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const selectEmployeeSchema = createSelectSchema(employees);

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee      = typeof employees.$inferSelect;
