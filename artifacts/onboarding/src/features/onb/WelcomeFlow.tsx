import { useState, useRef, useCallback } from "react";
import "./welcome-flow.css";
import { WelcomeBg } from "./WelcomeBg";

type ChipVariant = "a" | "b" | "c";
type Phase       = "idle" | "exit" | "enter";
type Dir         = "fwd" | "bwd";

interface ChipPos {
  top?: string; left?: string;
  right?: string; bottom?: string;
}

function Chip({ val, sub, variant, delay, pos }: {
  val: string; sub: string;
  variant: ChipVariant; delay: string; pos: ChipPos;
}) {
  return (
    <div className={`chip chip--${variant}`} style={{ ...pos, animationDelay: delay }}>
      <span className="ch-v">{val}</span>
      <span className="ch-s1">{sub}</span>
    </div>
  );
}

function AttendanceIllus() {
  return (
    <div className="illus">
      <div className="il-g" />

      <div className="rings">
        {([38, 55, 72] as const).map((pct, i) => (
          <div
            key={pct}
            className={`ring ring--${i + 1}`}
            style={{ "--ring-size": `${pct}%` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="at-c gl-c">
        <div className="at-ca">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" className="at-if" />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              className="at-is"
              strokeWidth="2" strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="at-cl1">
          {[100, 70, 86].map((w) => (
            <div key={w} className="at-cl" style={{ width: `${w}%` }} />
          ))}
        </div>

        <div className="ba-l">CHECK IN</div>
      </div>

      <Chip val="98%" sub="On-Time"    variant="a" delay="0s"   pos={{ top: "12%", left: "2%" }} />
      <Chip val="12"  sub="Checked in" variant="b" delay=".22s" pos={{ top: "28%", right: "1%" }} />
      <Chip val="✓"   sub="Synced"     variant="c" delay=".44s" pos={{ bottom: "15%", left: "6%" }} />
    </div>
  );
}

const LEAVE_DAYS = new Set([10, 11, 12, 13, 14]);
const WEEK_DAYS  = ["M","T","W","T","F","S","S"] as const;
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

function LeaveIllus() {
  return (
    <div className="illus">
      <div className="il-g" />

      <div className="ca-c gl-c">
        <div className="ca-h">
          <span className="ca-m">June 2025</span>
          <div className="ca-s">Approved</div>
        </div>

        <div className="ca-dh">
          {WEEK_DAYS.map((d, i) => (
            <div key={`wd-${i}-${d}`} className="ca-dn">{d}</div>
          ))}
        </div>

        <div className="ca-g">
          {MONTH_DAYS.map(day => {
            const leave = LEAVE_DAYS.has(day), today = day === 6;
            const mod   = leave ? " ca-dl" : today ? " ca-dt" : "";
            return <div key={day} className={`ca-d${mod}`}>{day}</div>;
          })}
        </div>
      </div>

      <div className="no-b1 no-btr gl-c">
        <div className="no-i">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" className="no-ic" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="no-t">Leave Approved</span>
      </div>

      <div className="no-b1 no-bbl gl-c">
        <div className="no-b" />
        <div>
          <div className="no-t">2 requests</div>
          <div className="no-d">pending review</div>
        </div>
      </div>
    </div>
  );
}

const BARS = [0.65, 0.82, 0.58, 0.91, 0.74, 0.88, 0.96];

function AnalyticsIllus() {
  return (
    <div className="illus">
      <div className="il-g" />

      <div className="ch-c gl-c">
        <div className="ch-h">
          <span className="ch-l">Attendance Score</span>
          <span className="ch-s">94%</span>
        </div>

        <div className="pr-t">
          <div className="pr-f" style={{ width: "94%" }} />
        </div>

        <div className="ba-g">
          {BARS.map((h, i) => (
            <div
              key={h}
              className={`bar${i === BARS.length - 1 ? " ba-a" : ""}`}
              style={{ "--bar-h": `${h * 100}%`, animationDelay: `${i * 0.07}s` } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="ch-d1">
          {WEEK_DAYS.map((d, i) => (
            <div key={`cd-${i}-${d}`} className="ch-d">{d}</div>
          ))}
        </div>
      </div>

      <div className="ra-b">
        <span className="ra-bv">A+</span>
        <span className="ra-bs">Rating</span>
      </div>

      <div className="ho-b">
        <div className="ho-bv">42h</div>
        <div className="ho-bs">This week</div>
      </div>

      <div className="pu-b">
        <div className="pu-bd" />
        <span className="pu-bt">100% Punctual</span>
      </div>
    </div>
  );
}

const PAGES = [
  {
    id: "att",
    headline: "Attendance,\nSimplified",
    desc:     "Track attendance securely through office Wi‑Fi with offline support and automatic synchronization.",
    Illus:    AttendanceIllus,
  },
  {
    id: "lev",
    headline: "Manage Leave\nEffortlessly",
    desc:     "Apply for leave, track requests, and receive approvals through a professional digital workflow.",
    Illus:    LeaveIllus,
  },
  {
    id: "prg",
    headline: "Know Your\nProgress",
    desc:     "Monitor attendance score, punctuality, working hours, and performance trends in one place.",
    Illus:    AnalyticsIllus,
  },
] as const;
export interface WelcomeFlowProps {
  onGetStarted?: () => void;
  initialSlide?: number;
  onSlideChange?: (n: number) => void;
}

export function WelcomeFlow({ onGetStarted, initialSlide = 0, onSlideChange }: WelcomeFlowProps) {
  const [idx,   setIdx]   = useState(() => Math.max(0, Math.min(initialSlide, PAGES.length - 1)));
  const [dir,   setDir]   = useState<Dir>("fwd");
  const [phase, setPhase] = useState<Phase>("idle");
  const exitT  = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enterT = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    ? (dir === "fwd" ? "il-el1"  : "il-er1")
    : phase === "enter"
    ? (dir === "fwd" ? "il-er" : "il-el")
    : "";

  const textCls = (stagger: string) =>
    phase === "exit"  ? `te-eu1 ${stagger}`  :
    phase === "enter" ? `te-eu ${stagger}` : "";

  return (
    <div className="ob">
      <WelcomeBg />

      {!isLast && (
        <button className="sk-b to-e" onClick={() => goTo(PAGES.length - 1)}>
          Skip
        </button>
      )}

      <div className="ob-iw">
        <div key={page.id} className={`ob-i ${illusCls}`}>
          <page.Illus />
        </div>
      </div>

      <div className="ob-c">
        <h1 key={`h-${page.id}`} className={`ob-h ${textCls("st-1")}`}>
          {page.headline}
        </h1>

        <p key={`d-${page.id}`} className={`ob-d ${textCls("st-2")}`}>
          {page.desc}
        </p>

        <div className="ob-d1">
          {PAGES.map((pg, i) => (
            <button
              key={`dot-${pg.id}`}
              className={`dot ${pg.id === page.id ? "do-o1" : "do-o"}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="ct-b"
          onClick={() => { if (isLast) onGetStarted?.(); else goTo(idx + 1); }}
        >
          {isLast ? "Get Started" : "Continue"}
          {!isLast && (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                className="ct-ba"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

