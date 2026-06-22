import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
import { useDebounce }       from "../hooks/useDebounce";
import { useDelayedUnmount } from "../hooks/useDelayedUnmount";
import { AddEmployeePage, type NewEmployeeData } from "./AddEmployeePage";
import "../styles/admin-dashboard.css";

// ── Types ──────────────────────────────────────────────────────────────────

type LeaveStatus = "leave" | "unauthorized-leave" | "half-day" | null;
type DisplayStatus =
  | "unauthorized-leave" | "leave" | "half-day"
  | "early-departure" | "late-arrival" | "arrival" | "normal";
type NavItem = "dashboard" | "leave" | "analytics" | "settings" | "notifications";

interface Employee {
  id: number; name: string; role: string; salary: string;
  checkIn: string; checkOut: string; leaveStatus: LeaveStatus;
  att: number; perf: number; avatar: string; initials: string; color: string;
}

interface OfficeTiming { start: string; end: string; }
interface CtxMenu     { empId: number; x: number; y: number; }

// ── Status maps ────────────────────────────────────────────────────────────

/** Maps display status → CSS class suffix for dot/label/time slots.
 *  Colors live entirely in index.css via --clr-* vars. */
const STATUS_CSS: Record<DisplayStatus, string | null> = {
  "unauthorized-leave": "unauth",
  "leave":              "leave",
  "half-day":           "half",
  "early-departure":    "early",
  "late-arrival":       "late",
  "arrival":            "present",
  "normal":             null,
};

const STATUS_LABEL: Record<DisplayStatus, string> = {
  "unauthorized-leave": "Unauthorized Leave",
  "leave":              "On Leave",
  "half-day":           "Half Day",
  "early-departure":    "Early Departure",
  "late-arrival":       "Late Arrival",
  "arrival":            "On Time",
  "normal":             "No Check-in",
};

// Priority when employee has NO checkout yet (odd slots 3,5,9 leave room for with-checkout)
const SORT_NO_CHECKOUT: Record<DisplayStatus, number> = {
  "unauthorized-leave": 0,
  "leave":              1,
  "late-arrival":       3,  // rank 3 — below half-day (2)
  "arrival":            5,  // rank 4
  "normal":             9,  // No Check-in, lowest
  "half-day":           99, // shouldn't appear without checkout
  "early-departure":    99, // shouldn't appear without checkout
};

// Priority when employee HAS a checkout (even slots 2,4,6,7,10)
const SORT_WITH_CHECKOUT: Record<DisplayStatus, number> = {
  "unauthorized-leave": 0,
  "leave":              1,
  "half-day":           2,  // rank 3 — above late-arrival no-checkout (3)
  "early-departure":    4,  // rank 4
  "late-arrival":       6,  // rank 5 — below arrival no-checkout (5)
  "arrival":            7,  // rank 6/7 — normal departure
  "normal":             10, // edge case
};

// ── Helpers ────────────────────────────────────────────────────────────────

function parseTimeMins(t: string): number {
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

// "09:15 AM" → "09:15"  (for <input type="time">)
function to24h(t: string): string {
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

// "09:15" → "09:15 AM"  (from <input type="time">)
function to12h(t: string): string {
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

// Returns CSS key for check-in time color ("late" = amber / null = default)
function getArrivalStatus(emp: Employee, timing: OfficeTiming): "late" | null {
  if (!emp.checkIn) return null;
  const inM    = parseTimeMins(emp.checkIn);
  const startM = parseTimeMins(timing.start);
  if (inM === -1) return null;
  return inM > startM ? "late" : null;
}

// Returns CSS key for check-out time color ("early" = purple / "half" = teal / null = default)
function getDepartureStatus(emp: Employee, timing: OfficeTiming): "early" | null {
  if (!emp.checkOut) return null;
  const outM = parseTimeMins(emp.checkOut);
  const endM = parseTimeMins(timing.end);
  if (outM === -1) return null;
  return outM < endM ? "early" : null;
}

function getDisplayStatus(emp: Employee, timing: OfficeTiming): DisplayStatus {
  if (emp.leaveStatus === "unauthorized-leave") return "unauthorized-leave";
  if (emp.leaveStatus === "leave")              return "leave";
  if (emp.leaveStatus === "half-day")           return "half-day";
  const startM = parseTimeMins(timing.start);
  const endM   = parseTimeMins(timing.end);
  if (emp.checkOut) {
    const outM = parseTimeMins(emp.checkOut);
    if (outM !== -1 && outM < endM) return "early-departure";
    if (emp.checkIn) {
      const inM = parseTimeMins(emp.checkIn);
      return (inM !== -1 && inM > startM) ? "late-arrival" : "arrival";
    }
    return "normal";
  }
  if (emp.checkIn) {
    const inM = parseTimeMins(emp.checkIn);
    return (inM !== -1 && inM > startM) ? "late-arrival" : "arrival";
  }
  return "normal";
}

function canAssignHalfDay(emp: Employee, timing: OfficeTiming): boolean {
  if (!emp.checkIn || !emp.checkOut) return false;
  const outM = parseTimeMins(emp.checkOut);
  const endM = parseTimeMins(timing.end);
  return outM !== -1 && endM !== -1 && outM < endM;
}

function sortedEmployees(emps: Employee[], timing: OfficeTiming): Employee[] {
  return [...emps].sort((a, b) => {
    const sa = getDisplayStatus(a, timing);
    const sb = getDisplayStatus(b, timing);
    const pa = (a.checkOut ? SORT_WITH_CHECKOUT : SORT_NO_CHECKOUT)[sa];
    const pb = (b.checkOut ? SORT_WITH_CHECKOUT : SORT_NO_CHECKOUT)[sb];
    return pa - pb;
  });
}

function getTodayStr() {
  const d = new Date();
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function normSalary(s: string) { return s.replace(/[$,]/g, ""); }

const Highlight = memo(function Highlight({ text, query = "" }: { text: string; query?: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="adm-card-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
});

// ── Seed data ──────────────────────────────────────────────────────────────

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1, name: "Alex Rivera", role: "Senior Developer", salary: "$4,500",
    checkIn: "09:15 AM", checkOut: "", leaveStatus: null, att: 80, perf: 60,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1bgJ9ObEX7Vmu2iodeu7ANsiyGaq3QqIV4cWRXrFs7iNvfixN5Pi1Bd0quN2nwqIw47xRZYRE_WzrWhIpY95KrALTGanCnM79dPhYaNbEntw6yMmqhc9yPEQMeBjjQL83NbIEAJdYjx18JZ_I7VSjZ2Rocv6HMa4IZ4yZdzdiCaRFiW5bxwaFqVEJSHL1CiynOn7vyhIM7-bWKBHQ13pcg-OGh7iAVXOyZkHm8muL1o5y52Qi9RRVShyLSHtedEfxYYYqjvqGnHMJ",
    initials: "AR", color: "var(--av-p1)",
  },
  {
    id: 2, name: "Sarah Chen", role: "UX Designer", salary: "$5,200",
    checkIn: "07:50 AM", checkOut: "04:30 PM", leaveStatus: null, att: 80, perf: 80,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    initials: "SC", color: "var(--av-p2)",
  },
  {
    id: 3, name: "James Wilson", role: "Product Manager", salary: "$8,000",
    checkIn: "07:55 AM", checkOut: "06:20 PM", leaveStatus: null, att: 80, perf: 60,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGR-7KzB18GmbpFkcXIIJMyEUWFY775MUOd3in9mdiC64fEbW2izZElN0zMWzbAIMH_NbyLfMBMSbHw9m2538zMnueCnlKR0jPgxCp1uo9XxImLja5La8-39M4tkLlG4qH0R_wKpN1p-GDAFAugZCssgOZi2wTYqSfw3feLrw21TKm4rFZPPGWzQRyt6qt6cHUcnXNo5WvVJdiov02YET-3LvBWRQzTe3eu4wG-XzRXj1rfZ6xxMjaoyVN_XrVjQVLTPfhNp7ovBw6",
    initials: "JW", color: "var(--av-p3)",
  },
  {
    id: 4, name: "Elena Rodriguez", role: "Data Analyst", salary: "$3,300",
    checkIn: "", checkOut: "", leaveStatus: "leave", att: 90, perf: 80,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVk__1uWGE-_CAuEpIOAUKhi20HsF9WuN6Qx7TL9YYdcJVifaE1Jc_jTe-zfvjWK6DYPwnbK17Wikld6ZBfkESaJ_7FS3OQdmeM-mQgsmySemoJrnvtmCU7jz-XIdRCCIiPVRUvxEwVOP6MFN8q1Z26T5LgcEa8cl24Y48c7cblxVTXtI651wkF7h6ePBkaFDUdtMgDNPdPOc3IM4_3p9rLjIKyoyt6Tgz1_G49HYO9UwrDN9QJkykxr26tYr4Z7HtBles9yVUY4x",
    initials: "ER", color: "var(--av-p4)",
  },
  {
    id: 5, name: "Michael Chang", role: "Sous Chef", salary: "$4,800",
    checkIn: "", checkOut: "", leaveStatus: "unauthorized-leave", att: 95, perf: 85,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLTNppDitBL-LUEeaxBCqc0mH7i9QNK5oXjv0WIk341piN1t1jbHb_IiDU04tNJXpFJovS2b8M761eF09xTFFthfLHinU7eKP65ofovLvikYSEaSPFseO02sWYQYARhRoo15vG0yN0jewg5gcaa4fxf_-cBnElNRwmC-4YfqjKa4FVucFFkp18q_EIMojqUWDtPykXs7ZeaGL_RSlhAx2Jywp_otPpLFm3B-H1sXV4W6-Cc3RxMQQeW07COmY1OMZQf-BYyLCBrNKo",
    initials: "MC", color: "var(--av-p5)",
  },
  {
    id: 6, name: "Olivia Smith", role: "Restaurant Manager", salary: "$6,000",
    checkIn: "07:30 AM", checkOut: "06:30 PM", leaveStatus: null, att: 100, perf: 90,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    initials: "OS", color: "var(--av-p6)",
  },
];

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "dashboard",  label: "Dashboard"    },
  { id: "leave",      label: "Time & Leave" },
  { id: "analytics",  label: "Analytics"    },
  { id: "settings",   label: "Settings"     },
];

const BOTTOM_NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "leave",         label: "Time"      },
  { id: "notifications", label: "Alerts"    },
  { id: "analytics",     label: "Analytics" },
  { id: "settings",      label: "Settings"  },
];

// ── Sub-components ─────────────────────────────────────────────────────────

const AvatarImg = memo(function AvatarImg({ emp }: { emp: Employee }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="adm-avatar-fallback" style={{ backgroundColor: emp.color }}>
        {emp.initials}
      </div>
    );
  }
  return (
    <img src={emp.avatar} alt={emp.name} className="adm-avatar-img"
      loading="lazy" onError={() => setFailed(true)} />
  );
});

/** variant="att" → --clr-att (warm white) | variant="perf" → --adm-gold (amber) */
const ProgressBar = memo(function ProgressBar({ value, variant }: { value: number; variant: "att" | "perf" }) {
  return (
    <div className="adm-progress-track">
      <div className={`adm-progress-fill adm-progress-fill--${variant}`}
        style={{ width: `${value}%` } as React.CSSProperties}
      />
    </div>
  );
});

const CHECKIN_SVG = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const CHECKOUT_SVG = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 11 12 16 7"/><line x1="11" y1="12" x2="21" y2="12"/>
  </svg>
);

const EmployeeCard = memo(function EmployeeCard({
  emp, idx, timing, isEditing, query, onCtxMenu, onLongPress, onEditSave,
}: {
  emp: Employee; idx: number; timing: OfficeTiming;
  isEditing: boolean; query: string;
  onCtxMenu: (id: number, x: number, y: number) => void;
  onLongPress: (id: number, x: number, y: number) => void;
  onEditSave: (id: number, ci: string, co: string) => void;
}) {
  const status    = getDisplayStatus(emp, timing);
  const statusCss = STATUS_CSS[status];
  const isLeave   = status === "leave" || status === "unauthorized-leave";
  const isHalf    = status === "half-day";

  // Inline edit local state
  const [ci24,      setCi24]      = useState("");
  const [co24,      setCo24]      = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (isEditing) {
      setCi24(to24h(emp.checkIn));
      setCo24(to24h(emp.checkOut));
      setEditError("");
    }
  }, [isEditing, emp.checkIn, emp.checkOut]);

  function handleInlineSave() {
    if (co24 && !ci24) { setEditError("Check-in required first"); return; }
    if (ci24 && co24 && co24 <= ci24) { setEditError("Check-out must be after check-in"); return; }
    onEditSave(emp.id, to12h(ci24), to12h(co24));
  }

  // Independent time slot CSS keys — no inline hex, colors live in CSS vars
  // arrStatus: late arrival = "late", else null (default text color)
  const arrStatus = getArrivalStatus(emp, timing);
  const depStatus = isHalf ? "half" : (emp.leaveStatus ? null : getDepartureStatus(emp, timing));

  // Dot CSS key: leave status > checkout departure > arrival
  let dotCss: string | null;
  if (emp.leaveStatus) {
    dotCss = statusCss;
  } else if (emp.checkOut) {
    dotCss = depStatus; // null = normal departure
  } else {
    dotCss = arrStatus; // null = no check-in yet
  }

  // Pulse only while actively checked in (no checkout, no leave)
  const shouldPulse = !emp.leaveStatus && !!emp.checkIn && !emp.checkOut;

  // Always show both slots; --:-- when no value recorded
  const displayIn  = emp.checkIn  || "--:--";
  const displayOut = emp.checkOut || "--:--";

  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef    = useRef({ x: 0, y: 0 });
  const prevented = useRef(false);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  const handleTouchStart = (e: React.TouchEvent) => {
    prevented.current = false;
    const t = e.touches[0];
    posRef.current = { x: t.clientX, y: t.clientY };
    timerRef.current = setTimeout(() => {
      prevented.current = true;
      onLongPress(emp.id, posRef.current.x, posRef.current.y);
    }, 600);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onCtxMenu(emp.id, e.clientX, e.clientY);
  };

  return (
    <div
      className={`adm-card${isLeave ? " adm-card-absent" : ""}${isEditing ? " adm-card-editing" : ""}`}
      style={{ animationDelay: `${idx * 70}ms` } as React.CSSProperties}
      onContextMenu={handleContextMenu}
      onTouchStart={isEditing ? undefined : handleTouchStart}
      onTouchEnd={isEditing ? undefined : clearTimer}
      onTouchMove={isEditing ? undefined : clearTimer}
    >
      <div className="adm-card-left">
        <div className="adm-avatar-wrap">
          <AvatarImg emp={emp} />
          <span className={`adm-dot${shouldPulse ? " adm-dot-pulse" : ""} adm-dot--${dotCss ?? "none"}`} />
        </div>

        <div className="adm-card-info">
          <h3 className="adm-card-name"><Highlight text={emp.name} query={query} /></h3>
          <p className="adm-card-role"><Highlight text={emp.role} query={query} /></p>
          <p className="adm-card-salary"><Highlight text={emp.salary} query={query} /></p>

          {/* Inline edit mode */}
          {isEditing ? (
            <div className="adm-inline-edit">
              <div className="adm-inline-time-row">
                <div className="adm-inline-field">
                  <span className="adm-inline-icon">{CHECKIN_SVG}</span>
                  <input
                    className="adm-inline-input"
                    type="time" value={ci24}
                    onChange={e => { setCi24(e.target.value); setEditError(""); }}
                    autoFocus
                  />
                </div>
                <div className="adm-inline-field">
                  <span className="adm-inline-icon">{CHECKOUT_SVG}</span>
                  <input
                    className={`adm-inline-input${!ci24 ? " adm-inline-input-disabled" : ""}`}
                    type="time" value={co24} disabled={!ci24}
                    onChange={e => { setCo24(e.target.value); setEditError(""); }}
                  />
                </div>
              </div>
              {editError && <p className="adm-inline-error">{editError}</p>}
            </div>
          ) : isLeave ? (
            /* Status label color comes from CSS class — no inline style */
            <div className={`adm-status-label adm-status--${status}`}>
              {STATUS_LABEL[status]}
            </div>
          ) : (
            <div className="adm-times">
              <span className={`adm-time-in${arrStatus ? ` adm-time--${arrStatus}` : ""}`}>
                {CHECKIN_SVG}
                <span className={emp.checkIn ? "" : "adm-time-placeholder"}>{displayIn}</span>
              </span>
              <span className={`adm-time-out${depStatus ? ` adm-time--${depStatus}` : ""}`}>
                {CHECKOUT_SVG}
                <span className={emp.checkOut ? "" : "adm-time-placeholder"}>{displayOut}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="adm-card-right">
        <button
          className={`adm-info-btn${isEditing ? " adm-info-btn-confirm" : ""}`}
          aria-label={isEditing ? "Confirm" : "Info"}
          onClick={isEditing ? handleInlineSave : undefined}
        >
          {isEditing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          )}
        </button>
        <div className="adm-bars">
          <div className="adm-bar-row">
            <div className="adm-bar-labels"><span>ATT</span><span>{emp.att}%</span></div>
            <ProgressBar value={emp.att} variant="att" />
          </div>
          <div className="adm-bar-row">
            <div className="adm-bar-labels"><span>PERF</span><span>{emp.perf}%</span></div>
            <ProgressBar value={emp.perf} variant="perf" />
          </div>
        </div>
      </div>
    </div>
  );
});

function ContextMenu({
  ctx, isOpen, employees, timing, onAction, onClose, isBeingEdited,
}: {
  ctx: CtxMenu; isOpen: boolean;
  employees: Employee[]; timing: OfficeTiming;
  isBeingEdited: boolean;
  onAction: (id: number, action: "edit" | LeaveStatus) => void;
  onClose: () => void;
}) {
  const emp    = employees.find(e => e.id === ctx.empId)!;
  const halfOk = canAssignHalfDay(emp, timing) || emp.leaveStatus === "half-day";
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── Keyboard navigation ──────────────────────────────────
     Items: 0=Edit  1=Leave  2=Unauthorized Leave  3=Half Day
     Only non-disabled items are reachable via ↑↓ */
  const itemDisabled = [false, false, false, !halfOk] as const;
  const enabledIdxs  = itemDisabled.map((d, i) => (d ? -1 : i)).filter(i => i >= 0);
  const [kbdIdx, setKbdIdx] = useState(-1);
  const kbdIdxRef = useRef(-1); // always-fresh ref for use inside event handlers

  function moveFocus(delta: 1 | -1) {
    const pos  = enabledIdxs.indexOf(kbdIdxRef.current);
    const next = enabledIdxs[(pos + delta + enabledIdxs.length) % enabledIdxs.length];
    kbdIdxRef.current = next;
    setKbdIdx(next);
  }

  /* ── All close triggers — active only while mounted (isOpen or exit anim) */
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return; // ignore during exit animation
      if (e.key === "Escape")     { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown")  { e.preventDefault(); moveFocus(1);  return; }
      if (e.key === "ArrowUp")    { e.preventDefault(); moveFocus(-1); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const idx = kbdIdxRef.current;
        if (idx < 0 || itemDisabled[idx as 0|1|2|3]) return;
        const actions = ["edit", "leave", "unauthorized-leave", "half-day"] as const;
        onAction(ctx.empId, actions[idx]);
        onClose();
      }
    };
    const onWindowBlur  = () => onClose();
    const onResize      = () => onClose();
    const onPopState    = () => onClose();

    /* capture phase so we beat any stopPropagation in child elements */
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("resize", onResize);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("popstate", onPopState);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, ctx.empId]);

  /* Reset keyboard focus each time the menu opens */
  useEffect(() => {
    if (isOpen) { kbdIdxRef.current = -1; setKbdIdx(-1); }
  }, [isOpen]);

  /* ── Viewport-safe positioning ─────────────────────────────
     Clamp so the menu never overflows edges; reflow on window resize closes it anyway */
  const menuW = 196, menuH = 184;
  const left  = Math.min(Math.max(ctx.x, 8), window.innerWidth  - menuW - 8);
  const top   = Math.min(Math.max(ctx.y, 8), window.innerHeight - menuH - 8);

  const TICK = (
    <svg className="adm-ctx-tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  function item(
    idx: 0 | 1 | 2 | 3,
    label: string,
    icon: React.ReactNode,
    action: () => void,
    statusKey?: string,
    active?: boolean,
  ) {
    const disabled = itemDisabled[idx];
    return (
      <button
        key={label}
        className={[
          "adm-ctx-item",
          disabled              ? "adm-ctx-item-disabled"       : "",
          active                ? "adm-ctx-item-active"         : "",
          kbdIdx === idx        ? "adm-ctx-item-kbd-focus"      : "",
          statusKey && !disabled ? `adm-ctx-item--${statusKey}` : "",
        ].filter(Boolean).join(" ")}
        onClick={disabled ? undefined : () => { action(); onClose(); }}
        onPointerEnter={() => { kbdIdxRef.current = disabled ? -1 : idx; setKbdIdx(disabled ? -1 : idx); }}
        disabled={disabled}
        tabIndex={-1}
        aria-checked={active}
        role="menuitemcheckbox"
      >
        {icon}
        <span>{label}</span>
        {active && TICK}
      </button>
    );
  }

  return (
    <div
      ref={menuRef}
      className="adm-ctx-menu"
      data-closing={!isOpen ? "" : undefined}
      style={{ left, top } as React.CSSProperties}
      tabIndex={-1}
      role="menu"
      aria-label="Employee actions"
    >
      {item(0, "Edit", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ), () => onAction(ctx.empId, "edit"), undefined, isBeingEdited)}

      <div className="adm-ctx-divider" />

      {item(1, "Leave", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ), () => onAction(ctx.empId, "leave"), "leave", emp.leaveStatus === "leave")}

      {item(2, "Unauthorized Leave", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), () => onAction(ctx.empId, "unauthorized-leave"), "unauth", emp.leaveStatus === "unauthorized-leave")}

      {item(3, "Half Day", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/>
        </svg>
      ), () => onAction(ctx.empId, "half-day"), "half", emp.leaveStatus === "half-day")}
    </div>
  );
}

function OfficeTimingHeader({ timing, onUpdate }: {
  timing: OfficeTiming;
  onUpdate: (t: OfficeTiming) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [start,   setStart]   = useState(timing.start);
  const [end,     setEnd]     = useState(timing.end);

  function save() { onUpdate({ start, end }); setEditing(false); }
  function cancel() { setStart(timing.start); setEnd(timing.end); setEditing(false); }

  return (
    <div className="adm-office-timing">
      <span className="adm-office-timing-label">Office Timing</span>
      {editing ? (
        <div className="adm-timing-edit-row">
          <input className="adm-timing-input" value={start} onChange={e => setStart(e.target.value)} />
          <span className="adm-timing-dash">–</span>
          <input className="adm-timing-input" value={end}   onChange={e => setEnd(e.target.value)}   />
          <button className="adm-timing-save"   onClick={save}>Save</button>
          <button className="adm-timing-cancel" onClick={cancel}>✕</button>
        </div>
      ) : (
        <div className="adm-timing-display-row">
          <span className="adm-timing-value">{timing.start} – {timing.end}</span>
          <button className="adm-timing-edit-btn" onClick={() => setEditing(true)} aria-label="Edit timing">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function NavIcon({ id }: { id: NavItem }) {
  switch (id) {
    case "dashboard":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      );
    case "leave":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );
    case "analytics":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      );
    case "settings":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
    case "notifications":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
  }
}

function RestaurantLogo({ size = 28 }: { size?: number }) {
  return (
    /* Color comes from .adm-restaurant-logo CSS class → var(--adm-gold) */
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="adm-restaurant-logo">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  );
}

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-modal-overlay" onClick={onCancel}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h3 className="adm-modal-title">Sign out?</h3>
        <p className="adm-modal-body">You'll need to sign in again to access the dashboard.</p>
        <div className="adm-modal-actions">
          <button className="adm-modal-cancel"  onClick={onCancel}>Cancel</button>
          <button className="adm-modal-confirm" onClick={onConfirm}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function AvatarDropdown({
  isOpen, triggerRefs, onLogoutRequest, onClose,
}: {
  isOpen: boolean;
  triggerRefs: React.RefObject<HTMLElement | null>[];
  onLogoutRequest: () => void;
  onClose: () => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);

  /* Outside-click listener — always active while mounted (not gated on isOpen).
     This is the fix: during exit animation isOpen=false but we still need to
     respond if the user clicks again so we don't block interaction. */
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      const insideTrigger = triggerRefs.some(r => r.current?.contains(t));
      const insideDrop    = dropRef.current?.contains(t);
      if (!insideTrigger && !insideDrop) onClose();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [onClose, triggerRefs]);

  return (
    <div
      ref={dropRef}
      className="adm-avatar-dropdown"
      data-closing={!isOpen ? "" : undefined}
    >
      <div className="adm-dropdown-header">
        <div className="adm-dropdown-avatar">A</div>
        <div className="adm-dropdown-info">
          <span className="adm-dropdown-name">Admin</span>
          <span className="adm-dropdown-role">Administrator</span>
        </div>
      </div>
      <div className="adm-dropdown-divider" />
      <button className="adm-dropdown-logout"
        onClick={() => { onClose(); onLogoutRequest(); }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeNav,      setActiveNav]      = useState<NavItem>("dashboard");
  const [employees,      setEmployees]      = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [officeTiming,   setOfficeTiming]   = useState<OfficeTiming>({ start: "08:00 AM", end: "06:00 PM" });
  const [rawQuery,        setRawQuery]       = useState("");
  const [mobileSearchOpen, setMobileSearch] = useState(false);
  const [showAddEmployee,  setShowAddEmployee] = useState(
    () => window.location.pathname === "/admin/add-employee"
  );
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [logoutModalOpen, setLogoutModal]   = useState(false);
  const [ctxMenu,        setCtxMenu]        = useState<CtxMenu | null>(null);
  const [ctxMenuData,    setCtxMenuData]    = useState<CtxMenu | null>(null);
  const [editingId,      setEditingId]      = useState<number | null>(null);

  /* ── useDelayedUnmount ─────────────────────────────────────────────────────
     Heavy panels (LogoutModal, AddEmployee) keep 60 s cache for quick re-open.
     Context menu and avatar dropdown use only 220/200 ms — just enough for their
     CSS exit animations. This fixes the "menu stays visible" bug where the old
     60 s delay kept both rendered (and fully visible) long after closing.       */
  const shouldRenderLogout   = useDelayedUnmount(logoutModalOpen);
  const shouldRenderAddEmp   = useDelayedUnmount(showAddEmployee);
  const shouldRenderDropdown = useDelayedUnmount(dropdownOpen, 220);
  const shouldRenderCtx      = useDelayedUnmount(!!ctxMenu, 220);

  /* Keep last ctxMenu data during the exit-animation window */
  useEffect(() => { if (ctxMenu) setCtxMenuData(ctxMenu); }, [ctxMenu]);

  const debouncedQuery = useDebounce(rawQuery, 280);

  const searchRef          = useRef<HTMLInputElement>(null);
  const mobileSearchRef    = useRef<HTMLInputElement>(null);
  /* Refs to the avatar trigger buttons — passed to AvatarDropdown for outside-click */
  const desktopAvatarRef   = useRef<HTMLDivElement>(null);
  const mobileAvatarRef    = useRef<HTMLButtonElement>(null);
  const dropdownTriggerRefs = [desktopAvatarRef, mobileAvatarRef] as React.RefObject<HTMLElement | null>[];

  const today        = getTodayStr();
  const presentCount  = useMemo(() => employees.filter(e => !e.leaveStatus && e.checkIn).length, [employees]);
  const halfDayCount  = useMemo(() => employees.filter(e => e.leaveStatus === "half-day").length, [employees]);
  const totalCount    = employees.length;

  const sorted = useMemo(() => sortedEmployees(employees, officeTiming), [employees, officeTiming]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return sorted;
    const qNorm = normSalary(q);
    return sorted.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      normSalary(e.salary).includes(qNorm)
    );
  }, [sorted, debouncedQuery]);

  const openSearch  = useCallback(() => { setMobileSearch(true); setTimeout(() => mobileSearchRef.current?.focus(), 300); }, []);
  const closeSearch = useCallback(() => { setMobileSearch(false); setRawQuery(""); }, []);

  // ── URL-sync for Add Employee page ───────────────────────────────────────
  const openAddEmployee = useCallback(() => {
    window.history.pushState({}, "", "/admin/add-employee");
    setShowAddEmployee(true);
  }, []);

  const closeAddEmployee = useCallback(() => {
    window.history.pushState({}, "", "/admin/dashboard");
    setShowAddEmployee(false);
  }, []);

  useEffect(() => {
    function onPopState() {
      setShowAddEmployee(window.location.pathname === "/admin/add-employee");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleAddEmployee = useCallback((data: NewEmployeeData) => {
    setEmployees(prev => {
      const nextId = Math.max(0, ...prev.map(e => e.id)) + 1;
      return [...prev, {
        id: nextId,
        name: data.name,
        role: data.role || "Staff",
        salary: data.salary,
        checkIn: "", checkOut: "",
        leaveStatus: null,
        att: 0, perf: 0,
        avatar: data.avatar,
        initials: data.initials,
        color: data.color,
      }];
    });
  }, []);
  const requestLogout = useCallback(() => { setDropdownOpen(false); setLogoutModal(true); }, []);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  const handleCtxAction = useCallback((empId: number, action: "edit" | LeaveStatus) => {
    if (action === "edit") {
      setEditingId(prev => prev === empId ? null : empId);
    } else {
      setEditingId(null);
      setEmployees(prev => prev.map(e => {
        if (e.id !== empId) return e;
        const newStatus: LeaveStatus = e.leaveStatus === action ? null : action;
        const clearTimes     = newStatus === "leave" || newStatus === "unauthorized-leave";
        const restoreDefaults = newStatus === null && !e.checkIn && !e.checkOut;
        return {
          ...e,
          leaveStatus: newStatus,
          checkIn:  clearTimes ? "" : (restoreDefaults ? officeTiming.start : e.checkIn),
          checkOut: clearTimes ? "" : (restoreDefaults ? officeTiming.end   : e.checkOut),
        };
      }));
    }
  }, [officeTiming]);

  const handleEditSave = useCallback((id: number, ci: string, co: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id !== id) return e;
      const conflictsWithTimes = e.leaveStatus === "leave" || e.leaveStatus === "unauthorized-leave";
      return {
        ...e,
        checkIn:     ci,
        checkOut:    co,
        leaveStatus: conflictsWithTimes ? null : e.leaveStatus,
      };
    }));
    setEditingId(null);
  }, []);

  const sharedCardProps = {
    timing: officeTiming,
    query: debouncedQuery,
    onCtxMenu: (id: number, x: number, y: number) => setCtxMenu({ empId: id, x, y }),
    onLongPress: (id: number, x: number, y: number) => setCtxMenu({ empId: id, x, y }),
  };

  return (
    <div className="adm-root">

      {/* ── Desktop Sidebar ── */}
      <nav className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <RestaurantLogo size={30} />
          <h1 className="adm-sidebar-brand">MyRestaurant</h1>
        </div>
        <div className="adm-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`adm-nav-item${activeNav === item.id ? " adm-nav-active" : ""}`}
              onClick={() => setActiveNav(item.id)}>
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="adm-main">

        {/* Desktop top header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <div className="adm-header-date-row">
              <h2 className="adm-header-date">{today}</h2>
            </div>
          </div>
          <div className="adm-header-right">
            <div className="adm-search-wrap">
              <svg className="adm-search-icon-inner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                className="adm-search-input"
                placeholder="Search employees..."
                value={rawQuery}
                autoComplete="off"
                onChange={e => setRawQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") setRawQuery(""); }}
              />
            </div>
            <button className="adm-notif-btn" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="adm-notif-dot" />
            </button>
            <div className="adm-profile-wrap">
              <div
                ref={desktopAvatarRef}
                className={`adm-profile-avatar${dropdownOpen ? " adm-profile-avatar-open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)} title="Account">A</div>
              {shouldRenderDropdown && (
                <AvatarDropdown
                  isOpen={dropdownOpen}
                  triggerRefs={dropdownTriggerRefs}
                  onLogoutRequest={requestLogout}
                  onClose={closeDropdown}
                />
              )}
            </div>
          </div>
        </header>

        {/* Mobile sticky top bar */}
        <header className="adm-topbar">
          <div className={`adm-topbar-logo${mobileSearchOpen ? " adm-topbar-logo-hide" : ""}`}>
            <RestaurantLogo size={26} />
            <span className="adm-topbar-brand">MyRestaurant</span>
          </div>
          <div className={`adm-topbar-search${mobileSearchOpen ? " adm-topbar-search-open" : ""}`}>
            <input
              ref={mobileSearchRef}
              className="adm-topbar-search-input"
              placeholder="Search staff..."
              value={rawQuery}
              autoComplete="off"
              onChange={e => setRawQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") setRawQuery(""); }}
            />
          </div>
          <div className="adm-topbar-actions">
            <button className="adm-topbar-toggle"
              onClick={mobileSearchOpen ? closeSearch : openSearch}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}>
              {mobileSearchOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              )}
            </button>
            <div className="adm-topbar-avatar-wrap">
              <button
                ref={mobileAvatarRef}
                className={`adm-topbar-profile${dropdownOpen ? " adm-topbar-profile-open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)} aria-label="Account">
                <div className="adm-topbar-profile-avatar">A</div>
              </button>
              {shouldRenderDropdown && (
                <AvatarDropdown
                  isOpen={dropdownOpen}
                  triggerRefs={dropdownTriggerRefs}
                  onLogoutRequest={requestLogout}
                  onClose={closeDropdown}
                />
              )}
            </div>
          </div>
        </header>

        {/* Desktop stats bar — below header: pills left, Total right */}
        <div className="adm-desktop-stats">
          <span className="adm-desktop-chip adm-desktop-chip-present">Present: {presentCount}</span>
          {halfDayCount > 0 && (
            <span className="adm-desktop-chip adm-desktop-chip-half">Half Day: {halfDayCount}</span>
          )}
          <span className="adm-desktop-stats-total">Total: {totalCount}</span>
        </div>

        {/* Mobile stats row: date + Total on top, Present left / Half Day right */}
        <div className="adm-mobile-stats">
          <div className="adm-mobile-dateline">
            <h2 className="adm-mobile-date">{today}</h2>
            <span className="adm-mobile-total">Total: {totalCount}</span>
          </div>
          <div className="adm-mobile-chips-row">
            <span className="adm-mobile-chip">Present: {presentCount}</span>
            {halfDayCount > 0 && (
              <span className="adm-mobile-chip adm-mobile-chip-half">Half Day: {halfDayCount}</span>
            )}
          </div>
        </div>

        {/* ── Content area ── */}
        <div key={activeNav} className="adm-content adm-content-enter">

          {/* Time & Leave page: office timing header */}
          {activeNav === "leave" && (
            <OfficeTimingHeader timing={officeTiming} onUpdate={setOfficeTiming} />
          )}

          {filtered.length === 0 ? (
            <div className="adm-empty">No employees match your search.</div>
          ) : (
            <div className="adm-grid">
              {filtered.map((emp, i) => (
                <EmployeeCard key={emp.id} emp={emp} idx={i} {...sharedCardProps}
                  isEditing={editingId === emp.id}
                  onEditSave={handleEditSave}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB */}
        <button className="adm-fab" aria-label="Add" onClick={openAddEmployee}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Bottom nav — mobile only */}
        <nav className="adm-bottom-nav">
          {BOTTOM_NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`adm-bnav-item${activeNav === item.id ? " adm-bnav-active" : ""}`}
              onClick={() => setActiveNav(item.id)}>
              <div className="adm-bnav-icon-wrap">
                <NavIcon id={item.id} />
                {item.id === "notifications" && <span className="adm-bnav-notif-dot" />}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

      </main>

      {/* Context menu — mounted while open or during 220ms exit animation */}
      {shouldRenderCtx && ctxMenuData && (
        <ContextMenu
          ctx={ctxMenuData}
          isOpen={!!ctxMenu}
          employees={employees}
          timing={officeTiming}
          isBeingEdited={editingId === ctxMenuData.empId}
          onAction={handleCtxAction}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Logout modal — kept mounted 60 s after close (Rule 3) */}
      {shouldRenderLogout && (
        <LogoutModal onConfirm={onLogout} onCancel={() => setLogoutModal(false)} />
      )}

      {/* Add Employee page — /admin/add-employee — kept mounted 60 s after close (Rule 3) */}
      {shouldRenderAddEmp && (
        <AddEmployeePage
          isOpen={showAddEmployee}
          onClose={closeAddEmployee}
          onSave={handleAddEmployee}
        />
      )}
    </div>
  );
}
