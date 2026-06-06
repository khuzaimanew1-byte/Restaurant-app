import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Colour helpers ─────────────────────────────────────────────── */
const gls = (dark: boolean, a = 0.08) =>
  dark ? `rgba(255,255,255,${a})` : `rgba(255,255,255,${a + 0.6})`;
const brd = (dark: boolean) =>
  dark ? "rgba(255,255,255,.11)" : "rgba(0,0,0,.06)";
const shd = (dark: boolean) =>
  dark ? "0 8px 32px rgba(0,0,0,.3)" : "0 8px 28px rgba(0,0,0,.07)";

const SIDE = "min(82vw, 340px)";

/* ─── Shared chip ────────────────────────────────────────────────── */
function Chip({
  dark, val, sub, an, delay, col, t, l, r, b,
}: {
  dark: boolean; val: string; sub: string; an: string; delay: string; col: string;
  t?: string; l?: string; r?: string; b?: string;
}) {
  return (
    <div style={{
      position: "absolute", top: t, left: l, right: r, bottom: b,
      width: "20%", minWidth: 52, aspectRatio: "1.15",
      background: col, backdropFilter: "blur(20px)",
      border: `1px solid ${brd(dark)}`, borderRadius: 14,
      boxShadow: shd(dark),
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
      animation: `${an} ${3 + parseFloat(delay) * 2}s ease-in-out infinite`,
      animationDelay: delay,
    }}>
      <span style={{ fontSize: "clamp(11px,3.2vw,15px)", fontWeight: 700, color: dark ? "rgba(255,255,255,.92)" : "rgba(0,0,0,.82)" }}>{val}</span>
      <span style={{ fontSize: "clamp(6px,1.6vw,8px)", fontWeight: 500, color: dark ? "rgba(255,255,255,.42)" : "rgba(0,0,0,.38)" }}>{sub}</span>
    </div>
  );
}

/* ─── Illustration 1 — Attendance ───────────────────────────────── */
function AttendanceIllus({ dark }: { dark: boolean }) {
  return (
    <div style={{ position: "relative", width: SIDE, height: SIDE }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,.16) 0%,transparent 70%)" }} />
      {[38, 55, 72].map((pct, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${pct}%`, height: `${pct}%`,
          top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
          borderRadius: "50%",
          border: `1.5px solid rgba(99,102,241,${.28 - i * .07})`,
          animation: `pulse-ring ${1.9 + i * .45}s ease-in-out infinite`,
          animationDelay: `${i * .28}s`,
        }} />
      ))}
      {/* Center card */}
      <div style={{
        position: "absolute", width: "36%", height: "48%", top: "26%", left: "32%",
        background: gls(dark, .08), backdropFilter: "blur(28px)",
        border: `1px solid ${brd(dark)}`, borderRadius: "18%",
        boxShadow: shd(dark),
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "7%",
      }}>
        <div style={{
          width: "38%", aspectRatio: "1", borderRadius: "50%",
          background: "rgba(99,102,241,.24)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: "60%" }}>
            <circle cx="12" cy="8" r="4" fill="rgba(180,183,255,.9)" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(180,183,255,.9)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ width: "72%", display: "flex", flexDirection: "column", gap: 4 }}>
          {[1, .7, .86].map((w, i) => (
            <div key={i} style={{ height: 3, borderRadius: 2, width: `${w * 100}%`, background: dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.1)" }} />
          ))}
        </div>
        <div style={{ padding: "3px 10px", borderRadius: 20, fontSize: "clamp(7px,1.8vw,9px)", fontWeight: 700, letterSpacing: .6, background: "rgba(99,102,241,.32)", color: "rgba(200,202,255,.95)" }}>CHECK IN</div>
      </div>
      <Chip dark={dark} val="98%" sub="On-Time"    t="12%" l="2%"  an="float-a" delay="0s"   col="rgba(99,102,241,.24)" />
      <Chip dark={dark} val="12"  sub="Checked in" t="28%" r="1%"  an="float-b" delay=".22s" col="rgba(16,185,129,.2)" />
      <Chip dark={dark} val="✓"   sub="Synced"     b="15%" l="6%"  an="float-c" delay=".44s" col="rgba(245,158,11,.2)" />
    </div>
  );
}

/* ─── Illustration 2 — Leave ─────────────────────────────────────── */
function LeaveIllus({ dark }: { dark: boolean }) {
  const leaveDays = new Set([10, 11, 12, 13, 14]);
  return (
    <div style={{ position: "relative", width: SIDE, height: SIDE }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 70%)" }} />
      {/* Calendar card */}
      <div style={{
        position: "absolute", width: "58%", height: "58%", top: "21%", left: "21%",
        background: gls(dark, .07), backdropFilter: "blur(28px)",
        border: `1px solid ${brd(dark)}`, borderRadius: "14%",
        boxShadow: shd(dark), padding: "4.5%",
        display: "flex", flexDirection: "column", gap: "3%",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "clamp(7px,1.9vw,9.5px)", fontWeight: 600, color: dark ? "rgba(255,255,255,.52)" : "rgba(0,0,0,.46)" }}>June 2025</span>
          <div style={{ padding: "2px 6px", borderRadius: 20, fontSize: "clamp(6px,1.6vw,8px)", fontWeight: 700, background: "rgba(16,185,129,.22)", color: "#10B981" }}>Approved</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: "clamp(6px,1.5vw,7.5px)", fontWeight: 600, color: dark ? "rgba(255,255,255,.24)" : "rgba(0,0,0,.24)" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, flex: 1 }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
            const leave = leaveDays.has(day), today = day === 6;
            return (
              <div key={day} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4, fontSize: "clamp(5.5px,1.4vw,7px)",
                fontWeight: leave || today ? 700 : 400,
                background: leave ? "rgba(16,185,129,.26)" : today ? "rgba(99,102,241,.3)" : "transparent",
                color: leave ? "rgba(110,231,183,.95)" : today ? "#b4b8ff" : dark ? "rgba(255,255,255,.36)" : "rgba(0,0,0,.36)",
              }}>{day}</div>
            );
          })}
        </div>
      </div>
      {/* Approval chip */}
      <div style={{
        position: "absolute", top: "6%", right: "2%",
        padding: "6px 10px", borderRadius: 13,
        background: gls(dark, .07), backdropFilter: "blur(20px)",
        border: `1px solid ${brd(dark)}`, boxShadow: shd(dark),
        display: "flex", alignItems: "center", gap: 5,
        animation: "float-b 3.5s ease-in-out infinite",
      }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(16,185,129,.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
        <span style={{ fontSize: "clamp(7px,1.9vw,9px)", fontWeight: 600, whiteSpace: "nowrap", color: dark ? "rgba(255,255,255,.8)" : "rgba(0,0,0,.72)" }}>Leave Approved</span>
      </div>
      {/* Pending pill */}
      <div style={{
        position: "absolute", bottom: "6%", left: "3%",
        padding: "7px 10px", borderRadius: 13,
        background: gls(dark, .06), backdropFilter: "blur(20px)",
        border: `1px solid ${brd(dark)}`, boxShadow: shd(dark),
        display: "flex", alignItems: "center", gap: 7,
        animation: "float-c 4s ease-in-out infinite", animationDelay: ".5s",
      }}>
        <div style={{ width: 3, height: 26, borderRadius: 2, flexShrink: 0, background: "linear-gradient(to bottom,rgba(99,102,241,.75),rgba(16,185,129,.5))" }} />
        <div>
          <div style={{ fontSize: "clamp(7px,1.9vw,9px)", fontWeight: 600, color: dark ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.65)" }}>2 requests</div>
          <div style={{ fontSize: "clamp(6px,1.6vw,8px)", color: dark ? "rgba(255,255,255,.32)" : "rgba(0,0,0,.3)" }}>pending review</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Illustration 3 — Analytics ─────────────────────────────────── */
function AnalyticsIllus({ dark }: { dark: boolean }) {
  const bars = [.65, .82, .58, .91, .74, .88, .96];
  return (
    <div style={{ position: "relative", width: SIDE, height: SIDE }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,.09) 0%,transparent 70%)" }} />
      {/* Chart card */}
      <div style={{
        position: "absolute", width: "66%", height: "54%", top: "23%", left: "17%",
        background: gls(dark, .07), backdropFilter: "blur(28px)",
        border: `1px solid ${brd(dark)}`, borderRadius: "14%",
        boxShadow: shd(dark), padding: "5% 5% 4%",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5%" }}>
          <span style={{ fontSize: "clamp(7px,1.9vw,9.5px)", fontWeight: 500, color: dark ? "rgba(255,255,255,.46)" : "rgba(0,0,0,.42)" }}>Attendance Score</span>
          <span style={{ fontSize: "clamp(12px,3.5vw,16px)", fontWeight: 700, color: dark ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.86)" }}>94%</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)", marginBottom: "8%" }}>
          <div style={{ height: "100%", width: "94%", borderRadius: 2, background: "linear-gradient(90deg,rgba(99,102,241,.88),rgba(99,102,241,.44))" }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3%", flex: 1 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h * 100}%`, borderRadius: 3,
              background: i === 6 ? "rgba(99,102,241,.72)" : dark ? "rgba(255,255,255,.13)" : "rgba(0,0,0,.1)",
              animation: `bar-grow .6s ease-out ${i * .07}s both`, transformOrigin: "bottom",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "4%" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "clamp(5.5px,1.4vw,7px)", color: dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.22)" }}>{d}</div>
          ))}
        </div>
      </div>
      {/* A+ badge */}
      <div style={{
        position: "absolute", top: "6%", right: "6%", width: "18%", aspectRatio: "1",
        background: "rgba(99,102,241,.18)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(99,102,241,.26)", borderRadius: "20%", boxShadow: shd(dark),
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "float-a 3.2s ease-in-out infinite",
      }}>
        <span style={{ fontSize: "clamp(12px,3.5vw,17px)", fontWeight: 700, color: "#b4b8ff" }}>A+</span>
        <span style={{ fontSize: "clamp(5.5px,1.5vw,7.5px)", color: dark ? "rgba(255,255,255,.38)" : "rgba(0,0,0,.34)" }}>Rating</span>
      </div>
      {/* Hours chip */}
      <div style={{
        position: "absolute", bottom: "6%", right: "4%", padding: "6px 11px", borderRadius: 13,
        background: "rgba(245,158,11,.12)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(245,158,11,.2)", boxShadow: shd(dark),
        animation: "float-b 3.8s ease-in-out infinite", animationDelay: ".4s",
      }}>
        <div style={{ fontSize: "clamp(11px,3.2vw,15px)", fontWeight: 700, color: "#fde68a" }}>42h</div>
        <div style={{ fontSize: "clamp(6px,1.6vw,8px)", color: dark ? "rgba(255,255,255,.36)" : "rgba(0,0,0,.34)" }}>This week</div>
      </div>
      {/* Punctual chip */}
      <div style={{
        position: "absolute", bottom: "7%", left: "3%", padding: "6px 10px", borderRadius: 13,
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(16,185,129,.12)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(16,185,129,.2)", boxShadow: shd(dark),
        animation: "float-c 4.2s ease-in-out infinite", animationDelay: ".7s",
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6ee7b7", flexShrink: 0 }} />
        <span style={{ fontSize: "clamp(7px,1.9vw,9px)", fontWeight: 600, color: "#6ee7b7", whiteSpace: "nowrap" }}>100% Punctual</span>
      </div>
    </div>
  );
}

/* ─── Pages config ───────────────────────────────────────────────── */
const PAGES = [
  {
    headline: "Attendance,\nSimplified",
    desc: "Track attendance securely through office Wi‑Fi with offline support and automatic synchronization.",
    Illus: AttendanceIllus,
  },
  {
    headline: "Manage Leave\nEffortlessly",
    desc: "Apply for leave, track requests, and receive approvals through a professional digital workflow.",
    Illus: LeaveIllus,
  },
  {
    headline: "Know Your\nProgress",
    desc: "Monitor attendance score, punctuality, working hours, and performance trends in one place.",
    Illus: AnalyticsIllus,
  },
];

/* ─── Transition phases ──────────────────────────────────────────── */
type Phase = "idle" | "exit" | "enter";

/* ─── Main Component ─────────────────────────────────────────────── */
export function OnboardingFlow({ onGetStarted }: { onGetStarted?: () => void }) {
  const [idx, setIdx]     = useState(0);
  const [dir, setDir]     = useState<"fwd" | "bwd">("fwd");
  const [phase, setPhase] = useState<Phase>("idle");
  const [dark, setDark]   = useState(true);
  const exitT  = useRef<ReturnType<typeof setTimeout>>();
  const enterT = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const goTo = useCallback((target: number) => {
    if (phase !== "idle" || target === idx) return;
    setDir(target > idx ? "fwd" : "bwd");
    setPhase("exit");
    clearTimeout(exitT.current);
    clearTimeout(enterT.current);
    exitT.current = setTimeout(() => {
      setIdx(target);
      setPhase("enter");
      enterT.current = setTimeout(() => setPhase("idle"), 500);
    }, 300);
  }, [phase, idx]);

  const isLast = idx === PAGES.length - 1;
  const page   = PAGES[idx];

  const illusClass = () => {
    if (phase === "exit")  return dir === "fwd" ? "illus-exit-left"  : "illus-exit-right";
    if (phase === "enter") return dir === "fwd" ? "illus-enter-right" : "illus-enter-left";
    return "";
  };
  const textClass = (stagger: string) => {
    if (phase === "exit")  return `text-exit-up ${stagger}`;
    if (phase === "enter") return `text-enter-up ${stagger}`;
    return "";
  };

  const bg    = dark ? "#0C0C14" : "#F4F4F8";
  const cPri  = dark ? "rgba(255,255,255,.93)" : "rgba(8,8,18,.88)";
  const cSec  = dark ? "rgba(255,255,255,.42)" : "rgba(8,8,18,.42)";
  const cSkip = dark ? "rgba(255,255,255,.3)"  : "rgba(8,8,18,.3)";
  const dotOn = dark ? "rgba(255,255,255,.86)" : "rgba(8,8,18,.8)";
  const dotOf = dark ? "rgba(255,255,255,.15)" : "rgba(8,8,18,.15)";
  const btnBg = dark ? "rgba(255,255,255,.93)" : "rgba(8,8,18,.88)";
  const btnTx = dark ? "#0A0A14" : "#fff";

  return (
    <div style={{
      width: "100vw", height: "100dvh", background: bg, overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
    }}>

      {/* Top bar */}
      <div className="top-enter" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "clamp(40px,10vw,56px) clamp(18px,5vw,24px) 0",
        flexShrink: 0,
      }}>
        <button onClick={() => setDark(d => !d)} style={{
          width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer",
          background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {dark
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="rgba(255,255,255,.55)" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="rgba(0,0,0,.45)" />
              </svg>
          }
        </button>
        {!isLast &&
          <button onClick={() => goTo(PAGES.length - 1)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "clamp(14px,4vw,16px)", fontWeight: 400, letterSpacing: -.15,
            color: cSkip, padding: "8px 6px",
          }}>Skip</button>
        }
      </div>

      {/* Illustration */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(8px,2vw,16px) 0", minHeight: 0,
      }}>
        <div key={idx} className={illusClass()} style={{ willChange: "transform, opacity" }}>
          <page.Illus dark={dark} />
        </div>
      </div>

      {/* Bottom content */}
      <div style={{
        padding: "0 clamp(20px,6vw,28px) clamp(28px,7vw,44px)",
        flexShrink: 0,
      }}>
        <h1 key={`h-${idx}`} className={textClass("stagger-1")} style={{
          fontSize: "clamp(26px,7.5vw,34px)", fontWeight: 800,
          lineHeight: 1.13, letterSpacing: "-.03em", color: cPri,
          whiteSpace: "pre-line", marginBottom: "clamp(8px,2.5vw,14px)",
        }}>{page.headline}</h1>

        <p key={`d-${idx}`} className={textClass("stagger-2")} style={{
          fontSize: "clamp(14px,4vw,16px)", lineHeight: 1.58,
          letterSpacing: "-.01em", color: cSec,
          marginBottom: "clamp(20px,5.5vw,30px)",
        }}>{page.desc}</p>

        {/* Dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "clamp(18px,5vw,26px)" }}>
          {PAGES.map((_, i) => (
            <button key={i} className="dot" onClick={() => goTo(i)} style={{
              height: 6, borderRadius: 3, border: "none", cursor: "pointer", padding: 0,
              background: i === idx ? dotOn : dotOf,
              width: i === idx ? 24 : 6,
            }} />
          ))}
        </div>

        {/* CTA button */}
        <button
          onPointerDown={e => (e.currentTarget.style.transform = "scale(.965)")}
          onPointerUp={e => {
            e.currentTarget.style.transform = "";
            if (isLast) onGetStarted?.();
            else goTo(idx + 1);
          }}
          onPointerLeave={e => (e.currentTarget.style.transform = "")}
          style={{
            width: "100%", height: "clamp(50px,13vw,58px)",
            borderRadius: "clamp(14px,4vw,18px)",
            border: "none", cursor: "pointer",
            background: btnBg, color: btnTx,
            fontSize: "clamp(14px,4vw,16px)", fontWeight: 700, letterSpacing: "-.02em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: dark
              ? "0 2px 24px rgba(255,255,255,.06),0 1px 2px rgba(0,0,0,.3)"
              : "0 2px 24px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.06)",
            transition: "transform .12s",
            willChange: "transform",
          }}>
          {isLast ? "Get Started" : "Continue"}
          {!isLast &&
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={btnTx} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        </button>
      </div>
    </div>
  );
}
