/** Employee API client — SSOT for all employee HTTP calls.
    Attaches JWT from localStorage on every request.
    Caller is responsible for redirect on 401.               */

// ── Status type — SSOT for all frontend status handling ───────────────────
export type UiStatus = "leave" | "unauthorized-leave" | "half-day" | "late" | null;

/** @deprecated Use UiStatus — kept as alias so existing references compile */
export type UiLeaveStatus = UiStatus;

/** DB token → UI display token (SSOT — import this everywhere, never inline) */
export function dbStatusToUi(s: "leave" | "unauth" | "half" | "late" | null): UiStatus {
  if (s === "unauth") return "unauthorized-leave";
  if (s === "half")   return "half-day";
  return s; // "leave" | "late" | null pass through
}

/** UI display token → DB token (SSOT — import this everywhere, never inline) */
export function uiStatusToDb(s: UiStatus): "leave" | "unauth" | "half" | "late" | null {
  if (s === "unauthorized-leave") return "unauth";
  if (s === "half-day")           return "half";
  return s as "leave" | "late" | null; // "leave", "late", null pass through
}

export interface EmployeeCard {
  id:          number;
  name:        string;
  role:        string;
  salary:      string;       // "PKR X,XXX" or ""
  checkIn:     string;       // "" when null — derived from shift.in
  checkOut:    string;       // "" when null — derived from shift.out
  leaveStatus: UiStatus;
  att:         number;
  perf:        number;
  avatar:      string;
  initials:    string;       // derived server-side from name
  color:       string;       // CSS var derived server-side
}

// ── Payload types ─────────────────────────────────────────────────────────
export interface CreateEmployeePayload {
  name:   string;
  role:   string;
  cnic:   string;
  sal?:   number;
  gen?:   string;
  email?: string;
  dob?:   string;
  ph?:    string;
  hire?:  string;
  addr?:  string;
  img?:   string;
  lang?:  string[];
  task?:  string[];
  cap?:   string[];
  spec?:  string[];
  exp?:   { y?: number; m?: number };
}

/** sts uses DB-level tokens — unauth / half / leave / late / null
    shift contains in/out times; null clears both.                  */
export interface UpdateStatusPayload {
  sts?:   "leave" | "unauth" | "half" | "late" | null;
  shift?: { in?: string | null; out?: string | null } | null;
  att?:   number;
  perf?:  number;
}

// ── Internals ─────────────────────────────────────────────────────────────
const AUTH_KEY = "auth_token";

function authHeader(): HeadersInit {
  const token = localStorage.getItem(AUTH_KEY) ?? "";
  return {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${token}`,
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try {
      const body = await res.json() as { message?: string };
      msg = Array.isArray(body.message) ? body.message.join("; ") : (body.message ?? msg);
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────

export async function fetchEmployees(): Promise<EmployeeCard[]> {
  const res = await fetch("/api/employees", { headers: authHeader() });
  return parseResponse<EmployeeCard[]>(res);
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<EmployeeCard> {
  const res = await fetch("/api/employees", {
    method:  "POST",
    headers: authHeader(),
    body:    JSON.stringify(payload),
  });
  return parseResponse<EmployeeCard>(res);
}

export async function updateEmployeeStatus(
  eid: number,
  payload: UpdateStatusPayload,
): Promise<EmployeeCard> {
  const res = await fetch(`/api/employees/${eid}/status`, {
    method:  "PATCH",
    headers: authHeader(),
    body:    JSON.stringify(payload),
  });
  return parseResponse<EmployeeCard>(res);
}
