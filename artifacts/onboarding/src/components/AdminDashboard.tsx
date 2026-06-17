import { useState, useRef, useCallback, useEffect } from "react";

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

const STATUS_COLOR: Record<DisplayStatus, string | null> = {
  "unauthorized-leave": "#FF5A5F",
  "leave":              "#94A3B8",
  "half-day":           "#14B8A6",
  "early-departure":    "#14B8A6",
  "late-arrival":       "#F59E0B",
  "arrival":            "#22C55E",
  "normal":             null,
};

const STATUS_LABEL: Partial<Record<DisplayStatus, string>> = {
  "unauthorized-leave": "Unauthorized Leave",
  "leave":              "On Leave",
  "half-day":           "Half Day",
  "late-arrival":       "Late Arrival",
};

const STATUS_SORT: Record<DisplayStatus, number> = {
  "unauthorized-leave": 0, "leave": 1, "half-day": 2,
  "early-departure": 3, "late-arrival": 4, "arrival": 5, "normal": 6,
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

// Returns the color the CHECK-IN time should receive (arrival-based, independent of departure)
// Only late arrivals get amber; early/on-time arrivals use default text color
function getArrivalColor(emp: Employee, timing: OfficeTiming): string | null {
  if (!emp.checkIn) return null;
  const inM    = parseTimeMins(emp.checkIn);
  const startM = parseTimeMins(timing.start);
  if (inM === -1) return null;
  return inM > startM ? "#F59E0B" : null;
}

// Returns the color the CHECK-OUT time should receive (departure-based)
function getDepartureColor(emp: Employee, timing: OfficeTiming): string | null {
  if (!emp.checkOut) return null;
  const outM = parseTimeMins(emp.checkOut);
  const endM = parseTimeMins(timing.end);
  if (outM === -1) return null;
  return outM < endM ? "#14B8A6" : null; // null = normal departure, no special color
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
  return [...emps].sort((a, b) =>
    STATUS_SORT[getDisplayStatus(a, timing)] - STATUS_SORT[getDisplayStatus(b, timing)]
  );
}

function getTodayStr() {
  const d = new Date();
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

// ── Seed data ──────────────────────────────────────────────────────────────

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1, name: "Alex Rivera", role: "Senior Developer", salary: "$4,500/mo",
    checkIn: "09:15 AM", checkOut: "", leaveStatus: null, att: 80, perf: 60,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1bgJ9ObEX7Vmu2iodeu7ANsiyGaq3QqIV4cWRXrFs7iNvfixN5Pi1Bd0quN2nwqIw47xRZYRE_WzrWhIpY95KrALTGanCnM79dPhYaNbEntw6yMmqhc9yPEQMeBjjQL83NbIEAJdYjx18JZ_I7VSjZ2Rocv6HMa4IZ4yZdzdiCaRFiW5bxwaFqVEJSHL1CiynOn7vyhIM7-bWKBHQ13pcg-OGh7iAVXOyZkHm8muL1o5y52Qi9RRVShyLSHtedEfxYYYqjvqGnHMJ",
    initials: "AR", color: "#3B5BDB",
  },
  {
    id: 2, name: "Sarah Chen", role: "UX Designer", salary: "$5,200/mo",
    checkIn: "07:50 AM", checkOut: "04:30 PM", leaveStatus: null, att: 80, perf: 80,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    initials: "SC", color: "#E64980",
  },
  {
    id: 3, name: "James Wilson", role: "Product Manager", salary: "$8,000/mo",
    checkIn: "07:55 AM", checkOut: "06:20 PM", leaveStatus: null, att: 80, perf: 60,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGR-7KzB18GmbpFkcXIIJMyEUWFY775MUOd3in9mdiC64fEbW2izZElN0zMWzbAIMH_NbyLfMBMSbHw9m2538zMnueCnlKR0jPgxCp1uo9XxImLja5La8-39M4tkLlG4qH0R_wKpN1p-GDAFAugZCssgOZi2wTYqSfw3feLrw21TKm4rFZPPGWzQRyt6qt6cHUcnXNo5WvVJdiov02YET-3LvBWRQzTe3eu4wG-XzRXj1rfZ6xxMjaoyVN_XrVjQVLTPfhNp7ovBw6",
    initials: "JW", color: "#7048E8",
  },
  {
    id: 4, name: "Elena Rodriguez", role: "Data Analyst", salary: "$3,300/mo",
    checkIn: "", checkOut: "", leaveStatus: "leave", att: 90, perf: 80,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVk__1uWGE-_CAuEpIOAUKhi20HsF9WuN6Qx7TL9YYdcJVifaE1Jc_jTe-zfvjWK6DYPwnbK17Wikld6ZBfkESaJ_7FS3OQdmeM-mQgsmySemoJrnvtmCU7jz-XIdRCCIiPVRUvxEwVOP6MFN8q1Z26T5LgcEa8cl24Y48c7cblxVTXtI651wkF7h6ePBkaFDUdtMgDNPdPOc3IM4_3p9rLjIKyoyt6Tgz1_G49HYO9UwrDN9QJkykxr26tYr4Z7HtBles9yVUY4x",
    initials: "ER", color: "#2B8A3E",
  },
  {
    id: 5, name: "Michael Chang", role: "Sous Chef", salary: "$4,800/mo",
    checkIn: "", checkOut: "", leaveStatus: "unauthorized-leave", att: 95, perf: 85,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLTNppDitBL-LUEeaxBCqc0mH7i9QNK5oXjv0WIk341piN1t1jbHb_IiDU04tNJXpFJovS2b8M761eF09xTFFthfLHinU7eKP65ofovLvikYSEaSPFseO02sWYQYARhRoo15vG0yN0jewg5gcaa4fxf_-cBnElNRwmC-4YfqjKa4FVucFFkp18q_EIMojqUWDtPykXs7ZeaGL_RSlhAx2Jywp_otPpLFm3B-H1sXV4W6-Cc3RxMQQeW07COmY1OMZQf-BYyLCBrNKo",
    initials: "MC", color: "#C92A2A",
  },
  {
    id: 6, name: "Olivia Smith", role: "Restaurant Manager", salary: "$6,000/mo",
    checkIn: "07:30 AM", checkOut: "06:30 PM", leaveStatus: null, att: 100, perf: 90,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    initials: "OS", color: "#1098AD",
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

function AvatarImg({ emp }: { emp: Employee }) {
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
      onError={() => setFailed(true)} />
  );
}

function ProgressBar({ value, color, glow }: { value: number; color: string; glow: string }) {
  return (
    <div className="adm-progress-track">
      <div className="adm-progress-fill"
        style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 8px ${glow}` } as React.CSSProperties}
      />
    </div>
  );
}

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

function EmployeeCard({
  emp, idx, timing, isEditing, isDimmed, onCtxMenu, onLongPress, onEditSave,
}: {
  emp: Employee; idx: number; timing: OfficeTiming;
  isEditing: boolean;
  isDimmed: boolean;
  onCtxMenu: (id: number, x: number, y: number) => void;
  onLongPress: (id: number, x: number, y: number) => void;
  onEditSave: (id: number, ci: string, co: string) => void;
}) {
  const status  = getDisplayStatus(emp, timing);
  const isLeave = status === "leave" || status === "unauthorized-leave";
  const isHalf  = status === "half-day";

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

  // Independent time colors — each slot gets its own status color
  // Half-day: check-in no color (arrived normally), check-out purple (early departure)
  const arrColor = isHalf ? null : (emp.leaveStatus ? null : getArrivalColor(emp, timing));
  const depColor = isHalf ? "#14B8A6" : (emp.leaveStatus ? null : getDepartureColor(emp, timing));

  // Dot color: checkout status takes priority when checkout exists; else arrival drives it
  let dotColor: string | null;
  if (emp.leaveStatus) {
    dotColor = STATUS_COLOR[status];
  } else if (emp.checkOut) {
    dotColor = depColor; // null = normal departure (no special color)
  } else {
    dotColor = arrColor; // null = no checkin yet
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
      className={`adm-card${isLeave ? " adm-card-absent" : ""}${isEditing ? " adm-card-editing" : ""}${isDimmed ? " adm-card-dimmed" : ""}`}
      style={{ animationDelay: `${idx * 70}ms` } as React.CSSProperties}
      onContextMenu={handleContextMenu}
      onTouchStart={isEditing ? undefined : handleTouchStart}
      onTouchEnd={isEditing ? undefined : clearTimer}
      onTouchMove={isEditing ? undefined : clearTimer}
    >
      <div className="adm-card-left">
        <div className="adm-avatar-wrap">
          <AvatarImg emp={emp} />
          <span
            className={`adm-dot${shouldPulse ? " adm-dot-pulse" : ""}`}
            style={dotColor
              ? { background: dotColor, boxShadow: `0 0 6px ${dotColor}99` } as React.CSSProperties
              : { background: "rgba(148,163,184,0.22)" }
            }
          />
        </div>

        <div className="adm-card-info">
          <h3 className="adm-card-name">{emp.name}</h3>
          <p className="adm-card-role">{emp.role}</p>
          <p className="adm-card-salary">
            {emp.salary}
            {isHalf && <span className="adm-half-badge"><span className="adm-half-badge-frac">½</span> Day</span>}
          </p>

          {/* Inline edit mode */}
          {isEditing ? (
            <div className="adm-inline-edit">
              <div className="adm-inline-time-row">
                <div className="adm-inline-field">
                  {CHECKIN_SVG}
                  <input
                    className="adm-inline-input"
                    type="time" value={ci24}
                    onChange={e => { setCi24(e.target.value); setEditError(""); }}
                    autoFocus
                  />
                </div>
                <div className="adm-inline-field">
                  {CHECKOUT_SVG}
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
            <div className="adm-status-label" style={{ color: STATUS_COLOR[status]! } as React.CSSProperties}>
              {STATUS_LABEL[status]}
            </div>
          ) : (
            <div className="adm-times">
              <span
                className="adm-time-in"
                style={arrColor ? { color: arrColor } as React.CSSProperties : undefined}
              >
                {CHECKIN_SVG}
                <span className={emp.checkIn ? "" : "adm-time-placeholder"}>{displayIn}</span>
              </span>
              <span
                className="adm-time-out"
                style={depColor ? { color: depColor } as React.CSSProperties : undefined}
              >
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
            <ProgressBar value={emp.att} color="#E5E2E1" glow="rgba(229,226,225,0.3)" />
          </div>
          <div className="adm-bar-row">
            <div className="adm-bar-labels"><span>PERF</span><span>{emp.perf}%</span></div>
            <ProgressBar value={emp.perf} color="#D4AF37" glow="rgba(212,175,55,0.4)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextMenu({
  ctx, employees, timing, onAction, onClose,
}: {
  ctx: CtxMenu; employees: Employee[]; timing: OfficeTiming;
  onAction: (id: number, action: "edit" | LeaveStatus) => void;
  onClose: () => void;
}) {
  const emp      = employees.find(e => e.id === ctx.empId)!;
  const halfOk   = canAssignHalfDay(emp, timing);
  const menuRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function down(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    function key(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [onClose]);

  const menuW = 196, menuH = 176;
  const left  = Math.min(ctx.x, window.innerWidth  - menuW - 8);
  const top   = Math.min(ctx.y, window.innerHeight - menuH - 8);

  const TICK = (
    <svg className="adm-ctx-tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const item = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    color?: string,
    disabled?: boolean,
    active?: boolean,
  ) => (
    <button
      className={`adm-ctx-item${disabled ? " adm-ctx-item-disabled" : ""}${active ? " adm-ctx-item-active" : ""}`}
      style={color && !disabled ? { color } as React.CSSProperties : undefined}
      onClick={disabled ? undefined : action}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
      {active && TICK}
    </button>
  );

  return (
    <div ref={menuRef} className="adm-ctx-menu" style={{ left, top } as React.CSSProperties}>
      {item("Edit", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ), () => { onAction(ctx.empId, "edit"); onClose(); })}

      <div className="adm-ctx-divider" />

      {item("Leave", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ), () => { onAction(ctx.empId, "leave"); onClose(); }, "#94A3B8", false, emp.leaveStatus === "leave")}

      {item("Unauthorized Leave", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), () => { onAction(ctx.empId, "unauthorized-leave"); onClose(); }, "#FF5A5F", false, emp.leaveStatus === "unauthorized-leave")}

      {item("Half Day", (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/>
        </svg>
      ), () => { onAction(ctx.empId, "half-day"); onClose(); }, "#14B8A6", !halfOk, emp.leaveStatus === "half-day")}
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4AF37" }}>
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

function AvatarDropdown({ onLogoutRequest, onClose }: { onLogoutRequest: () => void; onClose: () => void }) {
  return (
    <div className="adm-avatar-dropdown">
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
  const [searchQuery,    setSearchQuery]    = useState("");
  const [mobileSearchOpen, setMobileSearch] = useState(false);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [logoutModalOpen, setLogoutModal]   = useState(false);
  const [ctxMenu,        setCtxMenu]        = useState<CtxMenu | null>(null);
  const [editingId,      setEditingId]      = useState<number | null>(null);

  const searchRef         = useRef<HTMLInputElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef  = useRef<HTMLDivElement>(null);

  const today        = getTodayStr();
  const presentCount = employees.filter(e => !e.leaveStatus && e.checkIn).length;
  const totalCount   = employees.length;

  const sorted   = sortedEmployees(employees, officeTiming);
  const filtered = searchQuery.trim()
    ? sorted.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sorted;

  const openSearch  = useCallback(() => { setMobileSearch(true); setTimeout(() => searchRef.current?.focus(), 300); }, []);
  const closeSearch = useCallback(() => { setMobileSearch(false); setSearchQuery(""); }, []);
  const requestLogout = useCallback(() => { setDropdownOpen(false); setLogoutModal(true); }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handle(e: MouseEvent) {
      const t = e.target as Node;
      if (!desktopDropdownRef.current?.contains(t) && !mobileDropdownRef.current?.contains(t))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  const handleCtxAction = useCallback((empId: number, action: "edit" | LeaveStatus) => {
    if (action === "edit") {
      setEditingId(prev => prev === empId ? null : empId);
    } else {
      setEditingId(null);
      setEmployees(prev => prev.map(e => {
        if (e.id !== empId) return e;
        const clearTimes = action === "leave" || action === "unauthorized-leave";
        return { ...e, leaveStatus: action, checkIn: clearTimes ? "" : e.checkIn, checkOut: clearTimes ? "" : e.checkOut };
      }));
    }
  }, []);

  const handleEditSave = useCallback((id: number, ci: string, co: string) => {
    setEmployees(prev => prev.map(e =>
      e.id === id ? { ...e, checkIn: ci, checkOut: co, leaveStatus: null } : e
    ));
    setEditingId(null);
  }, []);

  const sharedCardProps = {
    timing: officeTiming,
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
            <h2 className="adm-header-date">{today}</h2>
            <div className="adm-header-stats">
              <span className="adm-stat-chip adm-stat-present">Present:&nbsp;<strong>{presentCount}</strong></span>
              <span className="adm-stat-chip">Total: {totalCount}</span>
            </div>
          </div>
          <div className="adm-header-right">
            <div className="adm-search-wrap">
              <svg className="adm-search-icon-inner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="adm-search-input" placeholder="Search employees..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="adm-notif-btn" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="adm-notif-dot" />
            </button>
            <div className="adm-profile-wrap" ref={desktopDropdownRef}>
              <div
                className={`adm-profile-avatar${dropdownOpen ? " adm-profile-avatar-open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)} title="Account">A</div>
              {dropdownOpen && (
                <AvatarDropdown onLogoutRequest={requestLogout} onClose={() => setDropdownOpen(false)} />
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
            <input ref={searchRef} className="adm-topbar-search-input" placeholder="Search staff..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
            <div className="adm-topbar-avatar-wrap" ref={mobileDropdownRef}>
              <button
                className={`adm-topbar-profile${dropdownOpen ? " adm-topbar-profile-open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)} aria-label="Account">
                <div className="adm-topbar-profile-avatar">A</div>
              </button>
              {dropdownOpen && (
                <AvatarDropdown onLogoutRequest={requestLogout} onClose={() => setDropdownOpen(false)} />
              )}
            </div>
          </div>
        </header>

        {/* Mobile stats row */}
        <div className="adm-mobile-stats">
          <div>
            <h2 className="adm-mobile-date">{today}</h2>
            <span className="adm-mobile-chip">Present: {presentCount}</span>
          </div>
          <span className="adm-mobile-total">Total: {totalCount}</span>
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
                  isDimmed={editingId !== null && editingId !== emp.id}
                  onEditSave={handleEditSave}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB — mobile only */}
        <button className="adm-fab" aria-label="Add">
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

      {/* Context menu */}
      {ctxMenu && (
        <ContextMenu
          ctx={ctxMenu} employees={employees} timing={officeTiming}
          onAction={handleCtxAction} onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Logout modal */}
      {logoutModalOpen && (
        <LogoutModal onConfirm={onLogout} onCancel={() => setLogoutModal(false)} />
      )}
    </div>
  );
}
