import { memo, useEffect, useRef } from "react";
import type { EmployeeProfile } from "../../../services/employee.service";
import { parseMins } from "../../../services/shift-timing";
import { Avatar } from "../Avatar";
import "./employee-modal-bg.css";
import "./employee-modal.css";

// ── Pure helpers ───────────────────────────────────────────────────────────

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}

function fmtExp(exp: { y?: number; m?: number } | null): string {
  if (!exp) return "";
  const parts: string[] = [];
  if (exp.y) parts.push(`${exp.y} YRS`);
  if (exp.m) parts.push(`${exp.m} MO`);
  return parts.join(" ");
}

function shiftLabel(inTime: string | null | undefined): string {
  if (!inTime) return "—";
  const m = parseMins(inTime);
  if (m < 0)         return "—";
  if (m < 12 * 60)   return "MORNING SHIFT";
  if (m < 17 * 60)   return "AFTERNOON SHIFT";
  if (m < 21 * 60)   return "EVENING SHIFT";
  return "NIGHT SHIFT";
}

function fmtSal(sal: number | null): string {
  if (!sal) return "";
  return `PKR ${sal.toLocaleString()} / MO`;
}

function empIdLabel(id: number): string {
  return `EMP-${String(id).padStart(4, "0")}`;
}

function fmtCnic(cnic: string): string {
  if (cnic.length === 13) return `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic[12]}`;
  return cnic;
}

// ── Inline SVG icons ───────────────────────────────────────────────────────

const IcoGender = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M12 12v9M9 18h6"/>
  </svg>
);
const IcoCnic = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);
const IcoLang = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IcoPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IcoEmail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
  </svg>
);
const IcoAddr = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IcoEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────

export const EmployeeModal = memo(function EmployeeModal({
  profile, isOpen, onClose, onEditEmployee, isLoading = false,
}: {
  profile:          EmployeeProfile | null;
  isOpen:           boolean;
  onClose:          () => void;
  onEditEmployee?:  (p: EmployeeProfile) => void;
  isLoading?:       boolean;
}) {
  /* Lock background scroll */
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Close on ESC */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Retain profile during exit animation */
  const profileRef = useRef<EmployeeProfile | null>(null);
  if (profile) profileRef.current = profile;
  const p = profileRef.current;

  /* Loading skeleton — shown while fetching, before first data arrives */
  if (!p) {
    if (!isOpen) return null;
    return (
      <div className="em-overlay" data-closing={!isOpen ? "" : undefined} onClick={onClose}>
        <div
          className="em-panel em-panel-loading"
          data-closing={!isOpen ? "" : undefined}
          onClick={e => e.stopPropagation()}
          role="dialog" aria-modal="true" aria-label="Loading profile"
        >
          <span className="em-corner em-corner-tl" aria-hidden />
          <span className="em-corner em-corner-tr" aria-hidden />
          <span className="em-corner em-corner-bl" aria-hidden />
          <span className="em-corner em-corner-br" aria-hidden />
          <button className="em-close pg-icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          {isLoading && <div className="em-skel" />}
        </div>
      </div>
    );
  }

  /* ── Computed values ──────────────────────────────────────── */
  const age    = calcAge(p.dob);
  const expStr = fmtExp(p.exp);
  const salStr = fmtSal(p.sal);
  const eid    = empIdLabel(p.id);

  /* Tag pills — always 4, fallback "—" for missing data */
  const shiftRange = (() => {
    const i = p.shift?.in, o = p.shift?.out;
    if (i && o) return `${i} – ${o}`;
    if (i)      return i;
    return "—";
  })();
  const shiftLbl = shiftLabel(p.shift?.in);
  const expYrs   = p.exp?.y
    ? `${p.exp.y} YRS EXP`
    : p.exp?.m ? `${p.exp.m} MO EXP` : "—";

  const isDash = (v: string) => v === "—";

  const hasContact = !!(p.gen || p.cnic || p.lang.length || p.ph || p.email || p.addr);
  const hasTasks   = p.task.length > 0;
  const hasCaps    = p.cap.length > 0;
  const hasSpec    = p.spec.length > 0;

  return (
    <div
      className="em-overlay"
      data-closing={!isOpen ? "" : undefined}
      onClick={onClose}
    >
      <div
        ref={undefined}
        className="em-panel"
        data-closing={!isOpen ? "" : undefined}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${p.name} profile`}
      >
        {/* Decorative corners */}
        <span className="em-corner em-corner-tl" aria-hidden />
        <span className="em-corner em-corner-tr" aria-hidden />
        <span className="em-corner em-corner-bl" aria-hidden />
        <span className="em-corner em-corner-br" aria-hidden />

        {/* Edit */}
        {onEditEmployee && (
          <button className="em-edit pg-icon-btn" onClick={() => onEditEmployee(p)} aria-label="Edit employee">
            <IcoEdit />
          </button>
        )}

        {/* Close */}
        <button className="em-close pg-icon-btn" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="em-hdr">
          <Avatar initials={p.initials} color={p.color} img={p.img} name={p.name} variant="modal" />

          <div className="em-hdr-info">
            <h2 className="em-name">{p.name.toUpperCase()}</h2>

            {(age !== null || p.dob) ? (
              <p className="em-sub ty-cap">
                {age !== null && <span>{age} YRS</span>}
                {age !== null && p.dob && <span className="em-sub-dot">·</span>}
                {p.dob && <span>{p.dob.toUpperCase()}</span>}
              </p>
            ) : (
              <p className="em-sub ty-cap em-empty-val">Age · Date of birth not set</p>
            )}

            <div className="em-role-row">
              <span className="stat-pill em-pill em-pill-role">{p.role.toUpperCase()}</span>
              {expStr && <span className="em-exp-txt">{expStr}</span>}
              {p.hire && <span className="em-hire-txt ty-cap">· Hired: {p.hire}</span>}
            </div>
          </div>

          {salStr && (
            <div className="em-sal-wrap">
              <span className="stat-pill em-pill em-pill-sal">{salStr}</span>
            </div>
          )}
        </div>

        {/* ── Tag pills ────────────────────────────────────────── */}
        <div className="em-tags">
          <span className="stat-pill em-pill em-pill-tag">{eid}</span>
          <span className={`stat-pill em-pill em-pill-tag${isDash(shiftRange) ? " em-pill-tag--dash" : ""}`}>{shiftRange}</span>
          <span className={`stat-pill em-pill em-pill-tag${isDash(shiftLbl)   ? " em-pill-tag--dash" : ""}`}>{shiftLbl}</span>
          <span className={`stat-pill em-pill em-pill-tag${isDash(expYrs)     ? " em-pill-tag--dash" : ""}`}>{expYrs}</span>
        </div>

        <div className="em-divider" />

        {/* ── Tasks + Capabilities ─────────────────────────────── */}
        {(hasTasks || hasCaps) && (
          <div className="em-cols">
            {hasTasks && (
              <div>
                <h4 className="ty-lbl em-col-hdr-wrap">ASSIGNED TASKS</h4>
                <ul className="em-bullet-list">
                  {p.task.map(t => (
                    <li key={t} className="em-bullet-item ty-body">
                      <span className="em-bullet-dot" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasCaps && (
              <div>
                <h4 className="ty-lbl em-col-hdr-wrap">WORK CAPABILITIES</h4>
                <ul className="em-bullet-list">
                  {p.cap.map(c => (
                    <li key={c} className="em-bullet-item ty-body">
                      <span className="em-bullet-dot" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Speciality ───────────────────────────────────────── */}
        {hasSpec && (
          <div className="em-spec-section">
            <h4 className="ty-lbl em-col-hdr-wrap">SPECIALITY</h4>
            <p className="em-spec-list">{p.spec.join(" · ")}</p>
          </div>
        )}

        {/* ── Contact — 3-column grid ──────────────────────────── */}
        {hasContact && (
          <>
            <div className="em-divider" />
            <div className="em-contact">
              {p.gen   && <span className="em-ci"><IcoGender />{p.gen}</span>}
              {p.cnic  && <span className="em-ci"><IcoCnic />{fmtCnic(p.cnic)}</span>}
              {p.lang.length > 0 && <span className="em-ci"><IcoLang />{p.lang.join(" · ")}</span>}
              {p.ph    && <span className="em-ci"><IcoPhone />{p.ph}</span>}
              {p.email && <span className="em-ci"><IcoEmail />{p.email}</span>}
              {p.addr  && <span className="em-ci em-ci--full"><IcoAddr />{p.addr}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
});
