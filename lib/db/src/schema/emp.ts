import {
  pgTable, serial, varchar, text, integer, timestamp, jsonb, index,
} from "drizzle-orm/pg-core";

export const employeeProfile = pgTable("employee_profile", {
  id:        serial("id").primaryKey(),
  name:      varchar("name",  { length: 200 }).notNull(),
  role:      varchar("role",  { length: 100 }).notNull(),
  cnic:      varchar("cnic",  { length: 15  }).notNull(),
  lang:      text("lang").array().notNull().default([]),
  hire:      varchar("hire",  { length: 20  }),
  exp:       jsonb("exp").$type<{ y?: number; m?: number }>(),
  task:      text("task").array().notNull().default([]),
  cap:       text("cap").array().notNull().default([]),
  spec:      text("spec").array().notNull().default([]),
  gen:       varchar("gen",   { length: 20  }),
  email:     varchar("email", { length: 255 }),
  dob:       varchar("dob",   { length: 20  }),
  ph:        varchar("ph",    { length: 30  }),
  addr:      text("addr"),
  sal:       integer("sal"),
  img:       text("img"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, t => [index("idx_emp_profile_cnic").on(t.cnic)]);

export const employeeStatus = pgTable(
  "employee_status",
  {
    id:    serial("id").primaryKey(),
    eid:   integer("eid").notNull().references(() => employeeProfile.id, { onDelete: "cascade" }),
    att:   integer("att").notNull().default(100),
    perf:  integer("perf").notNull().default(100),
    sts:   varchar("sts", { length: 10 }),
    shift: jsonb("shift").$type<{ in?: string; out?: string }>(),
  },
  t => [index("idx_emp_status_eid").on(t.eid)],
);
