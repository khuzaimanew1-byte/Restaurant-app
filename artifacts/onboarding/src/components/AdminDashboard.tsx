import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
import { useDebounce }              from "../hooks/useDebounce";
import { useDelayedUnmount }        from "../hooks/useDelayedUnmount";
import { useEmployees }             from "../hooks/useEmployees";
import { useUpdateEmployeeStatus }  from "../hooks/useUpdateEmployeeStatus";
import { type EmployeeCard, type UiStatus, uiStatusToDb } from "../services/employee.service";
import { Navigation, type NavItem } from "./ui/Navigation";
import { Topbar }                   from "./ui/Topbar";
import { StatusTag }                from "./ui/StatusTag";
import "../styles/main-bg.css";
import "../styles/admin-dashboard.css";

// ── Types ──────────────────────────────────────────────────────────────────

type DisplayStatus =
  | "unauthorized-leave" | "leave" | "half-day"
  | "early-departure" | "late-arrival" | "arrival" | "normal";

/* EmployeeCard from the DB is the canonical employee shape — same fields
   as the old local Employee interface; no need for a separate definition. */
type Employee = EmployeeCard;

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
  "late-arrival":       3,
  "arrival":            5,
  "normal":             9,
  "half-day":           99,
  "early-departure":    99,
};

// Priority when employee HAS a checkout (even slots 2,4,6,7,10)
const SORT_WITH_CHECKOUT: Record<DisplayStatus, number> = {
  "unauthorized-leave": 0,
  "leave":              1,
  "half-day":           2,
  "early-departure":    4,
  "late-arrival":       6,
  "arrival":            7,
  "normal":             10,
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

/* Seed data removed — employees are now loaded exclusively from the DB
   via useEmployees() → GET /api/employees. See data/employee-seeds.ts
   for the seed records inserted into Neon on first server boot.      */

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

  /* Independent time slot CSS keys — no inline hex, colors live in CSS vars */
  const arrStatus = getArrivalStatus(emp, timing);
  const depStatus = isHalf ? "half" : (emp.leaveStatus ? null : getDepartureStatus(emp, timing));

  let dotCss: string | null;
  if (emp.leaveStatus) {
    dotCss = statusCss;
  } else if (emp.checkOut) {
    dotCss = depStatus;
  } else {
    dotCss = arrStatus;
  }

  const shouldPulse = !emp.leaveStatus && !!emp.checkIn && !emp.checkOut;

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
            <StatusTag status={emp.leaveStatus} />
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
  onAction: (id: number, action: "edit" | UiStatus) => void;
  onClose: () => void;
}) {
  const emp    = employees.find(e => e.id === ctx.empId)!;
  const halfOk = canAssignHalfDay(emp, timing) || emp.leaveStatus === "half-day";
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── Keyboard navigation ──────────────────────────────────
     Items: 0=Edit  1=Leave  2=Unauthorized Leave  3=Half Day */
  const itemDisabled = [false, false, false, !halfOk] as const;
  const enabledIdxs  = itemDisabled.map((d, i) => (d ? -1 : i)).filter(i => i >= 0);
  const [kbdIdx, setKbdIdx] = useState(-1);
  const kbdIdxRef = useRef(-1);

  function moveFocus(delta: 1 | -1) {
    const pos  = enabledIdxs.indexOf(kbdIdxRef.current);
    const next = enabledIdxs[(pos + delta + enabledIdxs.length) % enabledIdxs.length];
    kbdIdxRef.current = next;
    setKbdIdx(next);
  }

  /* mousedown (bubble) fires after target handlers, avoids race with contextmenu */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (!isOpen) return;
      if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1);  return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); moveFocus(-1); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const idx = kbdIdxRef.current;
        if (idx < 0 || itemDisabled[idx as 0|1|2|3]) return;
        const actions = ["edit", "leave", "unauthorized-leave", "half-day"] as const;
        onAction(ctx.empId, actions[idx]);
        onClose();
      }
    }
    const onBlur     = () => onClose();
    const onResize   = () => onClose();
    const onPopState = () => onClose();

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown",   onKey);
    window.addEventListener("blur",        onBlur);
    window.addEventListener("resize",      onResize);
    window.addEventListener("popstate",    onPopState);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown",   onKey);
      window.removeEventListener("blur",        onBlur);
      window.removeEventListener("resize",      onResize);
      window.removeEventListener("popstate",    onPopState);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, ctx.empId]);

  useEffect(() => {
    if (isOpen) { kbdIdxRef.current = -1; setKbdIdx(-1); }
  }, [isOpen]);

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

// ── Main Dashboard ─────────────────────────────────────────────────────────

export function AdminDashboard({ onLogout, onAddEmployee }: { onLogout: () => void; onAddEmployee: () => void }) {
  /* ── DB data via React Query ─────────────────────────────────────────────
     employees is the authoritative list from Neon — never hardcoded locally.
     updateMutation sends PATCH /api/employees/:id/status with optimistic UI. */
  const { data: employees = [], isLoading, isError } = useEmployees();
  const updateMutation = useUpdateEmployeeStatus();

  const [activeNav,        setActiveNav]      = useState<NavItem>("dashboard");
  const [officeTiming,     setOfficeTiming]   = useState<OfficeTiming>({ start: "08:00 AM", end: "06:00 PM" });
  const [rawQuery,         setRawQuery]       = useState("");
  const [mobileSearchOpen, setMobileSearch]  = useState(false);
  const [logoutModalOpen,  setLogoutModal]   = useState(false);
  const [ctxMenu,          setCtxMenu]       = useState<CtxMenu | null>(null);
  const [editingId,        setEditingId]     = useState<number | null>(null);

  /* ── useDelayedUnmount ─────────────────────────────────────────────────────
     LogoutModal: 60 s default cache. ContextMenu: 220 ms for CSS exit animation. */
  const shouldRenderLogout = useDelayedUnmount(logoutModalOpen);
  const shouldRenderCtx    = useDelayedUnmount(!!ctxMenu, 220);

  /* ctxMenuData — ref so position is available during 220 ms exit window */
  const ctxMenuDataRef = useRef<CtxMenu | null>(null);
  if (ctxMenu) ctxMenuDataRef.current = ctxMenu;
  const ctxMenuData = ctxMenuDataRef.current;

  const debouncedQuery = useDebounce(rawQuery, 280);

  /* Search refs passed to Topbar — state (rawQuery) stays here, drives filtering */
  const searchRef       = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  /* Dismiss editing state whenever an update mutation fires */
  useEffect(() => {
    if (updateMutation.isPending) return;
    /* nothing extra needed — editingId is cleared in handleEditSave */
  }, [updateMutation.isPending]);

  const today        = getTodayStr();
  const presentCount = useMemo(() => employees.filter(e => !e.leaveStatus && e.checkIn).length, [employees]);
  const halfDayCount = useMemo(() => employees.filter(e => e.leaveStatus === "half-day").length, [employees]);
  const totalCount   = employees.length;

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

  const handleCtxAction = useCallback((empId: number, action: "edit" | UiStatus) => {
    if (action === "edit") {
      setEditingId(prev => prev === empId ? null : empId);
      return;
    }
    setEditingId(null);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const newStatus: UiStatus = emp.leaveStatus === action ? null : action;
    const clearTimes      = newStatus === "leave" || newStatus === "unauthorized-leave";
    const restoreDefaults = newStatus === null && !emp.checkIn && !emp.checkOut;

    updateMutation.mutate({
      eid: empId,
      payload: {
        sts: uiStatusToDb(newStatus), /* SSOT mapping from employee.service.ts */
        shift: clearTimes ? null : {
          in:  restoreDefaults ? officeTiming.start : (emp.checkIn  || null),
          out: restoreDefaults ? officeTiming.end   : (emp.checkOut || null),
        },
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, officeTiming, updateMutation.mutate]);

  const handleEditSave = useCallback((id: number, ci: string, co: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const conflictsWithTimes = emp.leaveStatus === "leave" || emp.leaveStatus === "unauthorized-leave";
    updateMutation.mutate({
      eid: id,
      payload: {
        shift: { in: ci || null, out: co || null },
        ...(conflictsWithTimes ? { sts: null } : {}),
      },
    });
    setEditingId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, updateMutation.mutate]);

  const sharedCardProps = {
    timing: officeTiming,
    query: debouncedQuery,
    onCtxMenu: (id: number, x: number, y: number) => setCtxMenu({ empId: id, x, y }),
    onLongPress: (id: number, x: number, y: number) => setCtxMenu({ empId: id, x, y }),
  };

  return (
    <div className="adm-root">

      {/* ── Desktop Sidebar + Mobile Bottom Nav ── */}
      <Navigation activeNav={activeNav} onNavChange={setActiveNav} />

      {/* ── Main content ── */}
      <main className="adm-main">

        {/* Desktop header + Mobile topbar — Topbar owns dropdown state */}
        <Topbar
          today={today}
          rawQuery={rawQuery}
          onQueryChange={setRawQuery}
          searchRef={searchRef}
          mobileSearchRef={mobileSearchRef}
          mobileSearchOpen={mobileSearchOpen}
          onOpenSearch={openSearch}
          onCloseSearch={closeSearch}
          onLogoutRequest={() => setLogoutModal(true)}
        />

        {/* Desktop stats bar — below header: pills left, Total right */}
        <div className="adm-desktop-stats">
          <span className="stat-pill adm-desktop-chip adm-desktop-chip-present">Present: {presentCount}</span>
          {halfDayCount > 0 && (
            <span className="stat-pill adm-desktop-chip adm-desktop-chip-half">Half Day: {halfDayCount}</span>
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
            <span className="stat-pill adm-mobile-chip">Present: {presentCount}</span>
            {halfDayCount > 0 && (
              <span className="stat-pill adm-mobile-chip adm-mobile-chip-half">Half Day: {halfDayCount}</span>
            )}
          </div>
        </div>

        {/* ── Content area ── */}
        <div key={activeNav} className="adm-content adm-content-enter">

          {activeNav === "leave" && (
            <OfficeTimingHeader timing={officeTiming} onUpdate={setOfficeTiming} />
          )}

          {/* Loading state — first fetch from DB */}
          {isLoading && (
            <div className="adm-empty">Loading employees…</div>
          )}

          {/* Error state — DB unreachable or auth failure */}
          {isError && !isLoading && (
            <div className="adm-empty">
              Could not load employees. Check your connection and try again.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="adm-empty">No employees match your search.</div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
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
        <button className="adm-fab" aria-label="Add" onClick={onAddEmployee}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

      </main>

      {/* Context menu — mounted while open or during 220 ms exit animation */}
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

    </div>
  );
}
