/* Shared types for the employees module — no NestJS/Drizzle imports here
   so these can be imported by any layer (controller, service, repo).       */

export type DbStatus = "leave" | "unauth" | "half" | "late" | null;

/** Canonical mapping — DB → frontend UI token */
export function dbStatusToUi(s: DbStatus): UiStatus {
  if (s === "unauth") return "unauthorized-leave";
  if (s === "half")   return "half-day";
  return s as UiStatus; // null | "leave" | "late" pass through unchanged
}

/** Canonical mapping — frontend UI token → DB */
export function uiStatusToDb(s: UiStatus): DbStatus {
  if (s === "unauthorized-leave") return "unauth";
  if (s === "half-day")           return "half";
  return s as DbStatus; // null | "leave" | "late" pass through unchanged
}

export type UiStatus = "leave" | "unauthorized-leave" | "half-day" | "late" | null;

/* Avatar palette — CSS vars SSOT is index.css :root --av-p1…--av-p8 */
export const AVATAR_PALETTE_CSS = [
  "var(--av-p1)", "var(--av-p2)", "var(--av-p3)", "var(--av-p4)",
  "var(--av-p5)", "var(--av-p6)", "var(--av-p7)", "var(--av-p8)",
];

/** View model returned to the UI — all derived fields computed here */
export interface EmployeeCard {
  id:          number;
  name:        string;
  role:        string;
  salary:      string;       // formatted "PKR X,XXX" or ""
  checkIn:     string;       // "" when null — derived from shift.in
  checkOut:    string;       // "" when null — derived from shift.out
  leaveStatus: UiStatus;
  att:         number;
  perf:        number;
  avatar:      string;       // img data-URL or remote URL
  initials:    string;       // derived from name
  color:       string;       // CSS var from palette, derived from name
}

/** Build a view-model card from a joined profile+status DB row */
export function toEmployeeCard(row: {
  id: number; name: string; role: string; sal: number | null; img: string | null;
  att: number | null; perf: number | null;
  sts: string | null; shift: { in?: string; out?: string } | null;
}): EmployeeCard {
  const initials = row.name.trim().split(/\s+/).map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase();
  const color    = AVATAR_PALETTE_CSS[row.name.charCodeAt(0) % AVATAR_PALETTE_CSS.length]!;
  const salary   = row.sal ? `PKR ${row.sal.toLocaleString("en-PK")}` : "";
  return {
    id:          row.id,
    name:        row.name,
    role:        row.role,
    salary,
    checkIn:     row.shift?.in  ?? "",
    checkOut:    row.shift?.out ?? "",
    leaveStatus: dbStatusToUi(row.sts as DbStatus),
    att:         row.att  ?? 100,
    perf:        row.perf ?? 100,
    avatar:      row.img  ?? "",
    initials,
    color,
  };
}
