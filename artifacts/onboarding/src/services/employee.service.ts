/** Employee API client — SSOT for all employee HTTP calls.
    Attaches JWT from localStorage on every request.
    Caller is responsible for redirect on 401.               */

// ── View model (mirrors EmployeeCard from api-server/employees.types.ts) ──
export type UiLeaveStatus = "leave" | "unauthorized-leave" | "half-day" | null;

export interface EmployeeCard {
  id:          number;
  name:        string;
  role:        string;
  salary:      string;       // "PKR X,XXX" or ""
  checkIn:     string;       // "" when null
  checkOut:    string;       // "" when null
  leaveStatus: UiLeaveStatus;
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

/** sts uses DB-level tokens — unauth / half / leave / null */
export interface UpdateStatusPayload {
  sts?:  "leave" | "unauth" | "half" | null;
  sin?:  string | null;
  sout?: string | null;
  att?:  number;
  perf?: number;
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
