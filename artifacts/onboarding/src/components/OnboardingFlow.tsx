import { useState, useRef, useCallback, useEffect } from "react";

/* ── Types ─────────────────────────────────────────────────── */
type ChipVariant = "a" | "b" | "c";
type Phase       = "idle" | "exit" | "enter";
type Dir         = "fwd" | "bwd";

interface ChipPos {
  top?: string; left?: string;
  right?: string; bottom?: string;
}

/* ── Chip — floating stat badge (shared) ───────────────────── */
function Chip({ val, sub, variant, delay, pos }: {
  val: string; sub: string;
  variant: ChipVariant; delay: string; pos: ChipPos;
}) {
  return (
    <div className={`chip chip--${variant}`} style={{ ...pos, animationDelay: delay }}>
      <span className="chip__val">{val}</span>
      <span className="chip__sub">{sub}</span>
    </div>
  );
}

/* ── Attendance Illustration ───────────────────────────────── */
function AttendanceIllus() {
  return (
    <div className="illus">
      <div className="illus__glow" />

      <div className="rings">
        {([38, 55, 72] as const).map((pct, i) => (
          <div
            key={i}
            className={`ring ring--${i + 1}`}
            style={{ "--ring-size": `${pct}%` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="att-card glass-card">
        <div className="att-card__avatar">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" className="att-icon-fill" />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              className="att-icon-stroke"
              strokeWidth="2" strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="att-card__lines">
          {[100, 70, 86].map((w, i) => (
            <div key={i} className="att-card__line" style={{ width: `${w}%` }} />
          ))}
        </div>

        <div className="badge-label">CHECK IN</div>
      </div>

      <Chip val="98%" sub="On-Time"    variant="a" delay="0s"   pos={{ top: "12%", left: "2%" }} />
      <Chip val="12"  sub="Checked in" variant="b" delay=".22s" pos={{ top: "28%", right: "1%" }} />
      <Chip val="✓"   sub="Synced"     variant="c" delay=".44s" pos={{ bottom: "15%", left: "6%" }} />
    </div>
  );
}

/* ── Leave Illustration ─────────────────────────────────────── */
const LEAVE_DAYS = new Set([10, 11, 12, 13, 14]);
const WEEK_DAYS  = ["M","T","W","T","F","S","S"];
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

function LeaveIllus() {
  return (
    <div className="illus">
      <div className="illus__glow" />

      <div className="cal-card glass-card">
        <div className="cal-header">
          <span className="cal-month">June 2025</span>
          <div className="cal-status">Approved</div>
        </div>

        <div className="cal-days-header">
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className="cal-day-name">{d}</div>
          ))}
        </div>

        <div className="cal-grid">
          {MONTH_DAYS.map(day => {
            const leave = LEAVE_DAYS.has(day), today = day === 6;
            const mod   = leave ? " cal-day--leave" : today ? " cal-day--today" : "";
            return <div key={day} className={`cal-day${mod}`}>{day}</div>;
          })}
        </div>
      </div>

      <div className="notif-bubble notif-bubble--top-right glass-card">
        <div className="notif-icon">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" className="notif-icon-check" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="notif-title">Leave Approved</span>
      </div>

      <div className="notif-bubble notif-bubble--bottom-left glass-card">
        <div className="notif-bar" />
        <div>
          <div className="notif-title">2 requests</div>
          <div className="notif-detail">pending review</div>
        </div>
      </div>
    </div>
  );
}

/* ── Analytics Illustration ─────────────────────────────────── */
const BARS = [0.65, 0.82, 0.58, 0.91, 0.74, 0.88, 0.96];

function AnalyticsIllus() {
  return (
    <div className="illus">
      <div className="illus__glow" />

      <div className="chart-card glass-card">
        <div className="chart-header">
          <span className="chart-label">Attendance Score</span>
          <span className="chart-score">94%</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: "94%" }} />
        </div>

        <div className="bar-group">
          {BARS.map((h, i) => (
            <div
              key={i}
              className={`bar${i === BARS.length - 1 ? " bar--active" : ""}`}
              style={{ "--bar-h": `${h * 100}%`, animationDelay: `${i * 0.07}s` } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="chart-days">
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className="chart-day">{d}</div>
          ))}
        </div>
      </div>

      <div className="rating-badge">
        <span className="rating-badge__val">A+</span>
        <span className="rating-badge__sub">Rating</span>
      </div>

      <div className="hours-badge">
        <div className="hours-badge__val">42h</div>
        <div className="hours-badge__sub">This week</div>
      </div>

      <div className="punctual-badge">
        <div className="punctual-badge__dot" />
        <span className="punctual-badge__text">100% Punctual</span>
      </div>
    </div>
  );
}

/* ── Slide data ─────────────────────────────────────────────── */
const PAGES = [
  {
    headline: "Attendance,\nSimplified",
    desc:     "Track attendance securely through office Wi‑Fi with offline support and automatic synchronization.",
    Illus:    AttendanceIllus,
  },
  {
    headline: "Manage Leave\nEffortlessly",
    desc:     "Apply for leave, track requests, and receive approvals through a professional digital workflow.",
    Illus:    LeaveIllus,
  },
  {
    headline: "Know Your\nProgress",
    desc:     "Monitor attendance score, punctuality, working hours, and performance trends in one place.",
    Illus:    AnalyticsIllus,
  },
] as const;

/* ── OnboardingFlow ─────────────────────────────────────────── */
export interface OnboardingFlowProps {
  onGetStarted?: () => void;
  initialSlide?: number;
  onSlideChange?: (n: number) => void;
}

export function OnboardingFlow({ onGetStarted, initialSlide = 0, onSlideChange }: OnboardingFlowProps) {
  const [idx,   setIdx]   = useState(() => Math.max(0, Math.min(initialSlide, PAGES.length - 1)));
  const [dir,   setDir]   = useState<Dir>("fwd");
  const [phase, setPhase] = useState<Phase>("idle");
  const exitT  = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enterT = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    history.replaceState(null, "", `/onboarding/${idx}`);
  }, []);

  const goTo = useCallback((target: number) => {
    if (phase !== "idle" || target === idx) return;
    history.replaceState(null, "", `/onboarding/${target}`);
    setDir(target > idx ? "fwd" : "bwd");
    setPhase("exit");
    clearTimeout(exitT.current);
    clearTimeout(enterT.current);
    exitT.current = setTimeout(() => {
      setIdx(target);
      onSlideChange?.(target);
      setPhase("enter");
      enterT.current = setTimeout(() => setPhase("idle"), 520);
    }, 220);
  }, [phase, idx, onSlideChange]);

  const isLast = idx === PAGES.length - 1;
  const page   = PAGES[idx];

  const illusCls = phase === "exit"
    ? (dir === "fwd" ? "illus-exit-left"  : "illus-exit-right")
    : phase === "enter"
    ? (dir === "fwd" ? "illus-enter-right" : "illus-enter-left")
    : "";

  const textCls = (stagger: string) =>
    phase === "exit"  ? `text-exit-up ${stagger}`  :
    phase === "enter" ? `text-enter-up ${stagger}` : "";

  return (
    <div className="ob">
      <div className="ob__bg-glow" />

      {!isLast && (
        <button className="skip-btn top-enter" onClick={() => goTo(PAGES.length - 1)}>
          Skip
        </button>
      )}

      <div className="ob__illus-wrap">
        <div key={idx} className={`ob__illus ${illusCls}`}>
          <page.Illus />
        </div>
      </div>

      <div className="ob__content">
        <h1 key={`h-${idx}`} className={`ob__headline ${textCls("stagger-1")}`}>
          {page.headline}
        </h1>

        <p key={`d-${idx}`} className={`ob__desc ${textCls("stagger-2")}`}>
          {page.desc}
        </p>

        <div className="ob__dots">
          {PAGES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === idx ? "dot--on" : "dot--off"}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="cta-btn"
          onClick={() => { if (isLast) onGetStarted?.(); else goTo(idx + 1); }}
        >
          {isLast ? "Get Started" : "Continue"}
          {!isLast && (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                className="cta-btn__arrow"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
