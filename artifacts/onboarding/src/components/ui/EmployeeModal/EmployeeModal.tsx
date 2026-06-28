import { memo, useEffect, useRef } from "react";
import type { EmployeeProfile } from "../../../services/employee.service";
import { parseMins } from "../../../services/shift-timing";
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

function shiftName(inTime: string | null | undefined): string {
  if (!inTime) return "";
  const m = parseMins(inTime);
  if (m < 0) return "";
  if (m < 12 * 60) return "Morning Shift";
  if (m < 17 * 60) return "Afternoon Shift";
  if (m < 21 * 60) return "Evening Shift";
  return "Night Shift";
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

// ── Inline SVG atoms ───────────────────────────────────────────────────────

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
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────

const AvatarBlock = memo(function AvatarBlock({ p }: { p: EmployeeProfile }) {
  return (
    <div className="em-avatar" style={{ backgroundColor: p.color }}>
      {p.img
        ? <img src={p.img} alt={p.name} className="em-avatar-img" loading="lazy" />
        : <span className="em-avatar-initials">{p.initials}</span>
      }
    </div>
  );
});

const Pill = memo(function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`stat-pill em-pill${className ? ` ${className}` : ""}`}>{children}</span>;
});

// ── Main component ─────────────────────────────────────────────────────────

export const EmployeeModal = memo(function EmployeeModal({
  profile,
  isOpen,
  onClose,
}: {
  profile: EmployeeProfile | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  /* Keep previous profile visible during exit animation */
  const profileRef = useRef<EmployeeProfile | null>(null);
  if (profile) profileRef.current = profile;
  const p = profileRef.current;
  if (!p) return null;

  const age       = calcAge(p.dob);
  const expStr    = fmtExp(p.exp);
  const salStr    = fmtSal(p.sal);
  const sName     = shiftName(p.shift?.in);
  const expYrs    = p.exp?.y ? `${p.exp.y} YRS EXP` : "";
  const eid       = empIdLabel(p.id);

  const shiftRange = (() => {
    const i = p.shift?.in;
    const o = p.shift?.out;
    if (i && o) return `${i} – ${o}`;
    if (i)      return i;
    return "";
  })();

  return (
    <div
      className="em-overlay"
      data-open={isOpen ? "" : undefined}
      data-closing={!isOpen ? "" : undefined}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="em-panel"
        data-open={isOpen ? "" : undefined}
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

        {/* Close */}
        <button className="em-close pg-icon-btn" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="em-hdr">
          <AvatarBlock p={p} />

          <div className="em-hdr-info">
            <h2 className="em-name">{p.name.toUpperCase()}</h2>

            {(age !== null || p.dob) && (
              <p className="em-sub">
                {age !== null && <span>{age} YRS</span>}
                {age !== null && p.dob && <span className="em-sub-dot">·</span>}
                {p.dob && <span>{p.dob.toUpperCase()}</span>}
              </p>
            )}

            <div className="em-role-row">
              <Pill className="em-pill-role">{p.role.toUpperCase()}</Pill>
              {expStr && <span className="em-exp-txt">{expStr}</span>}
              {p.hire && <span className="em-hire-txt">· Hired: {p.hire}</span>}
            </div>
          </div>

          {salStr && (
            <div className="em-sal-wrap">
              <Pill className="em-pill-sal">{salStr}</Pill>
            </div>
          )}
        </div>

        {/* ── Tag pills row ───────────────────────────────────── */}
        <div className="em-tags">
          <Pill className="em-pill-tag">{eid}</Pill>
          {shiftRange && <Pill className="em-pill-tag">{shiftRange}</Pill>}
          {sName      && <Pill className="em-pill-tag">{sName.toUpperCase()}</Pill>}
          {expYrs     && <Pill className="em-pill-tag">{expYrs}</Pill>}
        </div>

        <div className="em-divider" />

        {/* ── Tasks + Capabilities ────────────────────────────── */}
        {(p.task.length > 0 || p.cap.length > 0) && (
          <div className="em-cols">
            {p.task.length > 0 && (
              <div className="em-col">
                <h4 className="em-col-hdr">Assigned Tasks</h4>
                <ul className="em-bullet-list">
                  {p.task.map(t => (
                    <li key={t} className="em-bullet-item">
                      <span className="em-bullet-dot" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.cap.length > 0 && (
              <div className="em-col">
                <h4 className="em-col-hdr">Work Capabilities</h4>
                <ul className="em-bullet-list">
                  {p.cap.map(c => (
                    <li key={c} className="em-bullet-item">
                      <span className="em-bullet-dot" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Speciality ──────────────────────────────────────── */}
        {p.spec.length > 0 && (
          <div className="em-spec-section">
            <h4 className="em-col-hdr">Speciality</h4>
            <p className="em-spec-list">{p.spec.join(" · ")}</p>
          </div>
        )}

        <div className="em-divider" />

        {/* ── Contact footer ──────────────────────────────────── */}
        <div className="em-contact">
          <div className="em-contact-row">
            {p.gen && (
              <span className="em-contact-item"><IcoGender />{p.gen}</span>
            )}
            {p.cnic && (
              <span className="em-contact-item"><IcoCnic />{fmtCnic(p.cnic)}</span>
            )}
            {p.lang.length > 0 && (
              <span className="em-contact-item"><IcoLang />{p.lang.join(" · ")}</span>
            )}
          </div>
          {(p.ph || p.email) && (
            <div className="em-contact-row">
              {p.ph    && <span className="em-contact-item"><IcoPhone />{p.ph}</span>}
              {p.email && <span className="em-contact-item"><IcoEmail />{p.email}</span>}
            </div>
          )}
          {p.addr && (
            <div className="em-contact-row">
              <span className="em-contact-item"><IcoAddr />{p.addr}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
