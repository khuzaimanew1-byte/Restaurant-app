import type { EmployeeCard } from "./employee.service";

// ── Types ───────────────────────────────────────────────────────────────────

export type DisplayStatus =
  | "unauthorized-leave" | "leave" | "half-day"
  | "early-departure"   | "late-arrival" | "arrival" | "normal";

export interface OfficeTiming { start: string; end: string; }

// ── Status maps ─────────────────────────────────────────────────────────────

export const STATUS_CSS: Record<DisplayStatus, string | null> = {
  "unauthorized-leave": "unauth",
  "leave":              "leave",
  "half-day":           "half",
  "early-departure":    "early",
  "late-arrival":       "late",
  "arrival":            "present",
  "normal":             null,
};

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  "unauthorized-leave": "Unauthorized Leave",
  "leave":              "On Leave",
  "half-day":           "Half Day",
  "early-departure":    "Early Departure",
  "late-arrival":       "Late Arrival",
  "arrival":            "On Time",
  "normal":             "No Check-in",
};

export const SORT_NO_CHECKOUT: Record<DisplayStatus, number> = {
  "unauthorized-leave": 0,
  "leave":              1,
  "late-arrival":       3,
  "arrival":            5,
  "normal":             9,
  "half-day":           99,
  "early-departure":    99,
};

export const SORT_WITH_CHECKOUT: Record<DisplayStatus, number> = {
  "unauthorized-leave": 0,
  "leave":              1,
  "half-day":           2,
  "early-departure":    4,
  "late-arrival":       6,
  "arrival":            7,
  "normal":             10,
};

// ── Pure time helpers ────────────────────────────────────────────────────────

export function parseMins(t: string): number {
  if (!t) return -1;
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const p = m[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export function to24h(t: string): string {
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "";
  let h = parseInt(m[1]);
  const min = m[2];
  const p = m[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

export function to12h(t: string): string {
  if (!t) return "";
  const parts = t.split(":");
  if (parts.length < 2) return "";
  let h = parseInt(parts[0]);
  const min = parts[1];
  const period = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${min} ${period}`;
}

// ── Status derivation ────────────────────────────────────────────────────────

export function arrSts(emp: EmployeeCard, timing: OfficeTiming): "late" | null {
  if (!emp.checkIn) return null;
  const inM    = parseMins(emp.checkIn);
  const startM = parseMins(timing.start);
  if (inM === -1) return null;
  return inM > startM ? "late" : null;
}

export function depSts(emp: EmployeeCard, timing: OfficeTiming): "early" | null {
  if (!emp.checkOut) return null;
  const outM = parseMins(emp.checkOut);
  const endM = parseMins(timing.end);
  if (outM === -1) return null;
  return outM < endM ? "early" : null;
}

export function dispSts(emp: EmployeeCard, timing: OfficeTiming): DisplayStatus {
  if (emp.leaveStatus === "unauthorized-leave") return "unauthorized-leave";
  if (emp.leaveStatus === "leave")              return "leave";
  if (emp.leaveStatus === "half-day")           return "half-day";
  const startM = parseMins(timing.start);
  const endM   = parseMins(timing.end);
  if (emp.checkOut) {
    const outM = parseMins(emp.checkOut);
    if (outM !== -1 && outM < endM) return "early-departure";
    if (emp.checkIn) {
      const inM = parseMins(emp.checkIn);
      return (inM !== -1 && inM > startM) ? "late-arrival" : "arrival";
    }
    return "normal";
  }
  if (emp.checkIn) {
    const inM = parseMins(emp.checkIn);
    return (inM !== -1 && inM > startM) ? "late-arrival" : "arrival";
  }
  return "normal";
}

export function canHalf(emp: EmployeeCard, timing: OfficeTiming): boolean {
  if (!emp.checkIn || !emp.checkOut) return false;
  const outM = parseMins(emp.checkOut);
  const endM = parseMins(timing.end);
  return outM !== -1 && endM !== -1 && outM < endM;
}

export function sortEmp(emps: EmployeeCard[], timing: OfficeTiming): EmployeeCard[] {
  return [...emps].sort((a, b) => {
    const sa = dispSts(a, timing);
    const sb = dispSts(b, timing);
    const pa = (a.checkOut ? SORT_WITH_CHECKOUT : SORT_NO_CHECKOUT)[sa];
    const pb = (b.checkOut ? SORT_WITH_CHECKOUT : SORT_NO_CHECKOUT)[sb];
    return pa - pb;
  });
}

// ── Shared SVG icons — check-in / check-out (SSOT) ──────────────────────────

export const IcoIn = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

export const IcoOut = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 11 12 16 7"/><line x1="11" y1="12" x2="21" y2="12"/>
  </svg>
);
