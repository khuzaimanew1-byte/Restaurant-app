import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Keyframes injected once ─────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body, html { width: 100%; height: 100%; overflow: hidden; }

  @keyframes pulse-ring {
    0%,100% { opacity:.45; transform:translate(-50%,-50%) scale(1); }
    50%      { opacity:.9;  transform:translate(-50%,-50%) scale(1.055); }
  }
  @keyframes float0 {
    0%,100% { transform:translateY(0px); }
    50%     { transform:translateY(-7px); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0px); }
    50%     { transform:translateY(-5px); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0px); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes bar-grow {
    from { transform:scaleY(0); transform-origin:bottom; opacity:0; }
    to   { transform:scaleY(1); transform-origin:bottom; opacity:1; }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-down {
    from { opacity:0; transform:translateY(-14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes scale-in {
    from { opacity:0; transform:scale(.86); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes btn-tap {
    0%  { transform:scale(1); }
    40% { transform:scale(.955); }
    100%{ transform:scale(1); }
  }
  .illus-enter  { animation: scale-in .44s cubic-bezier(.22,1,.36,1) both; }
  .text-enter   { animation: fade-up  .38s cubic-bezier(.22,1,.36,1) both; }
  .top-enter    { animation: fade-down .45s cubic-bezier(.22,1,.36,1) both; }
  .btn-tap      { animation: btn-tap  .16s ease both; }
`;

/* ─── Tiny helpers ──────────────────────────────────────────────── */
const glass = (dark: boolean, alpha = 0.07) =>
  dark ? `rgba(255,255,255,${alpha})` : `rgba(255,255,255,${alpha + 0.55})`;

const border = (dark: boolean) =>
  dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.055)";

const shadow = (dark: boolean) =>
  dark ? "0 8px 32px rgba(0,0,0,.28)" : "0 8px 32px rgba(0,0,0,.07)";

/* ─── Illustrations ─────────────────────────────────────────────── */
function AttendanceIllustration({ dark }: { dark: boolean }) {
  const indigo = "#6366F1";
  const rings = [80, 128, 176];

  return (
    <div style={{ position: "relative", width: 260, height: 260, margin: "auto" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(99,102,241,.14) 0%, transparent 72%)`
      }} />

      {/* Rings */}
      {rings.map((size, i) => (
        <div key={i} style={{
          position: "absolute",
          width: size, height: size,
          left: "50%", top: "50%",
          border: `1.5px solid rgba(99,102,241,${.22 - i * .055})`,
          borderRadius: "50%",
          animation: `pulse-ring ${1.9 + i * .45}s ease-in-out infinite`,
          animationDelay: `${i * .28}s`,
        }} />
      ))}

      {/* Center card */}
      <div style={{
        position: "absolute",
        width: 104, height: 136,
        left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        background: glass(dark, .08),
        backdropFilter: "blur(28px)",
        border: `1px solid ${border(dark)}`,
        borderRadius: 22,
        boxShadow: shadow(dark),
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: `rgba(99,102,241,.22)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="rgba(180,183,255,.92)" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(180,183,255,.92)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ width: "72%", display: "flex", flexDirection: "column", gap: 4 }}>
          {[1, .72, .88].map((w, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 2, width: `${w * 100}%`,
              background: dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.1)"
            }} />
          ))}
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: 20,
          background: `rgba(99,102,241,.32)`,
          fontSize: 7, fontWeight: 700, letterSpacing: .7,
          color: "rgba(200,202,255,.95)",
        }}>CHECK IN</div>
      </div>

      {/* Float chips */}
      <FloatChip dark={dark} val="98%" sub="On-Time" top={6} left={-4} delay={0} color="rgba(99,102,241,.22)" />
      <FloatChip dark={dark} val="12"  sub="Checked in" top={52} right={-10} delay={.22} color="rgba(16,185,129,.18)" />
      <FloatChip dark={dark} val="✓"  sub="Synced" bottom={28} left={4} delay={.44} color="rgba(245,158,11,.18)" />
    </div>
  );
}

function FloatChip({ dark, val, sub, top, left, right, bottom, delay, color }: {
  dark: boolean; val: string; sub: string; delay: number; color: string;
  top?: number; left?: number; right?: number; bottom?: number;
}) {
  const idx = Math.round(delay * 2);
  return (
    <div style={{
      position: "absolute", top, left, right, bottom,
      width: 60, height: 50, borderRadius: 16,
      background: color, backdropFilter: "blur(20px)",
      border: `1px solid ${border(dark)}`,
      boxShadow: shadow(dark),
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
      animation: `float${idx} ${3.2 + idx * .4}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: dark ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.8)" }}>{val}</span>
      <span style={{ fontSize: 7, fontWeight: 500, color: dark ? "rgba(255,255,255,.42)" : "rgba(0,0,0,.38)" }}>{sub}</span>
    </div>
  );
}

function LeaveIllustration({ dark }: { dark: boolean }) {
  const emerald = "#10B981";
  const indigo = "#6366F1";
  const leaveDays = new Set([10, 11, 12, 13, 14]);

  return (
    <div style={{ position: "relative", width: 260, height: 260, margin: "auto" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(16,185,129,.09) 0%, transparent 70%)`
      }} />

      {/* Calendar card */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        width: 156, height: 156,
        background: glass(dark, .07),
        backdropFilter: "blur(28px)",
        border: `1px solid ${border(dark)}`,
        borderRadius: 22, boxShadow: shadow(dark),
        padding: 12, display: "flex", flexDirection: "column", gap: 5,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 8.5, fontWeight: 600, color: dark ? "rgba(255,255,255,.52)" : "rgba(0,0,0,.46)" }}>June 2025</span>
          <div style={{
            padding: "2px 6px", borderRadius: 20, fontSize: 7, fontWeight: 700,
            background: `rgba(16,185,129,.22)`, color: emerald,
          }}>Approved</div>
        </div>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 6.5, fontWeight: 600, color: dark ? "rgba(255,255,255,.24)" : "rgba(0,0,0,.24)" }}>{d}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, flex: 1 }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
            const leave = leaveDays.has(day);
            const today = day === 6;
            return (
              <div key={day} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4, fontSize: 6.5,
                fontWeight: leave || today ? 700 : 400,
                background: leave ? `rgba(16,185,129,.26)` : today ? `rgba(99,102,241,.3)` : "transparent",
                color: leave ? `rgba(110,231,183,.95)` : today ? "#b4b8ff" : dark ? "rgba(255,255,255,.36)" : "rgba(0,0,0,.36)",
              }}>{day}</div>
            );
          })}
        </div>
      </div>

      {/* Approval chip */}
      <div style={{
        position: "absolute", top: 10, right: -6,
        padding: "7px 10px", borderRadius: 14,
        background: glass(dark, .07), backdropFilter: "blur(20px)",
        border: `1px solid ${border(dark)}`, boxShadow: shadow(dark),
        display: "flex", alignItems: "center", gap: 5,
        animation: "float1 3.5s ease-in-out infinite",
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          background: `rgba(16,185,129,.22)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke={emerald} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: 8, fontWeight: 600, color: dark ? "rgba(255,255,255,.78)" : "rgba(0,0,0,.72)" }}>Leave Approved</span>
      </div>

      {/* Timeline */}
      <div style={{
        position: "absolute", bottom: 18, left: -10,
        padding: "7px 10px", borderRadius: 14,
        background: glass(dark, .07), backdropFilter: "blur(20px)",
        border: `1px solid ${border(dark)}`, boxShadow: shadow(dark),
        display: "flex", alignItems: "center", gap: 7,
        animation: "float2 4s ease-in-out infinite", animationDelay: ".5s",
      }}>
        <div style={{
          width: 3, height: 26, borderRadius: 2,
          background: `linear-gradient(to bottom, rgba(99,102,241,.72), rgba(16,185,129,.5))`,
        }} />
        <div>
          <div style={{ fontSize: 8, fontWeight: 600, color: dark ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.65)" }}>2 requests</div>
          <div style={{ fontSize: 7, color: dark ? "rgba(255,255,255,.32)" : "rgba(0,0,0,.3)" }}>pending review</div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsIllustration({ dark }: { dark: boolean }) {
  const bars = [65, 82, 58, 91, 74, 88, 96];
  const indigo = "#6366F1";

  return (
    <div style={{ position: "relative", width: 260, height: 260, margin: "auto" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 70%)`
      }} />

      {/* Main card */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        width: 180, height: 148,
        background: glass(dark, .07),
        backdropFilter: "blur(28px)",
        border: `1px solid ${border(dark)}`,
        borderRadius: 22, boxShadow: shadow(dark),
        padding: "14px 14px 10px",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span style={{ fontSize: 8.5, fontWeight: 500, color: dark ? "rgba(255,255,255,.46)" : "rgba(0,0,0,.42)" }}>Attendance Score</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: dark ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.85)" }}>94%</span>
        </div>
        {/* Progress */}
        <div style={{ height: 3, borderRadius: 2, background: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)", marginBottom: 10 }}>
          <div style={{ height: "100%", width: "94%", borderRadius: 2, background: `linear-gradient(90deg, rgba(99,102,241,.85), rgba(99,102,241,.42))` }} />
        </div>
        {/* Bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, flex: 1 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3,
              background: i === 6 ? "rgba(99,102,241,.72)" : dark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)",
              animation: `bar-grow .6s ease-out ${i * .07}s both`,
            }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 3 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 6, color: dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.22)" }}>{d}</div>
          ))}
        </div>
      </div>

      {/* A+ badge */}
      <div style={{
        position: "absolute", top: 6, right: 4,
        width: 54, height: 54, borderRadius: 18,
        background: `rgba(99,102,241,.18)`, backdropFilter: "blur(16px)",
        border: `1px solid rgba(99,102,241,.24)`, boxShadow: shadow(dark),
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "float0 3.2s ease-in-out infinite",
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#b4b8ff" }}>A+</span>
        <span style={{ fontSize: 7, color: dark ? "rgba(255,255,255,.38)" : "rgba(0,0,0,.34)" }}>Rating</span>
      </div>

      {/* Hours */}
      <div style={{
        position: "absolute", bottom: 14, right: -2,
        padding: "7px 11px", borderRadius: 14,
        background: `rgba(245,158,11,.12)`, backdropFilter: "blur(16px)",
        border: `1px solid rgba(245,158,11,.18)`, boxShadow: shadow(dark),
        animation: "float1 3.8s ease-in-out infinite", animationDelay: ".4s",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fde68a" }}>42h</div>
        <div style={{ fontSize: 7, color: dark ? "rgba(255,255,255,.36)" : "rgba(0,0,0,.34)" }}>This week</div>
      </div>

      {/* Punctuality */}
      <div style={{
        position: "absolute", bottom: 20, left: -6,
        padding: "7px 10px", borderRadius: 14, display: "flex", alignItems: "center", gap: 6,
        background: `rgba(16,185,129,.11)`, backdropFilter: "blur(16px)",
        border: `1px solid rgba(16,185,129,.18)`, boxShadow: shadow(dark),
        animation: "float2 4.2s ease-in-out infinite", animationDelay: ".7s",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7" }} />
        <span style={{ fontSize: 8, fontWeight: 600, color: "#6ee7b7" }}>100% Punctual</span>
      </div>
    </div>
  );
}

/* ─── Page data ─────────────────────────────────────────────────── */
const PAGES = [
  {
    headline: "Attendance,\nSimplified",
    desc: "Track attendance securely through office Wi-Fi with offline support and automatic synchronization.",
    Illus: AttendanceIllustration,
  },
  {
    headline: "Manage Leave\nEffortlessly",
    desc: "Apply for leave, track requests, and receive approvals through a professional digital workflow.",
    Illus: LeaveIllustration,
  },
  {
    headline: "Know Your\nProgress",
    desc: "Monitor attendance score, punctuality, working hours, and performance trends in one place.",
    Illus: AnalyticsIllustration,
  },
];

/* ─── Main component ────────────────────────────────────────────── */
export function OnboardingFlow() {
  const [idx, setIdx]           = useState(0);
  const [busy, setBusy]         = useState(false);
  const [illusKey, setIllusKey] = useState(0);
  const [textKey, setTextKey]   = useState(0);
  const [dark, setDark]         = useState(true);
  const [btnTap, setBtnTap]     = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Listen to system dark-mode too
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);

  const goTo = useCallback((next: number) => {
    if (busy || next === idx) return;
    setBusy(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIdx(next);
      setIllusKey(k => k + 1);
      setTimeout(() => setTextKey(k => k + 1), 55);
      setTimeout(() => setBusy(false), 420);
    }, 260);
  }, [busy, idx]);

  const page = PAGES[idx];
  const isLast = idx === PAGES.length - 1;

  /* ── colours ── */
  const bg      = dark ? "#0C0C14" : "#F5F5F9";
  const cPri    = dark ? "rgba(255,255,255,.92)" : "rgba(10,10,20,.88)";
  const cSec    = dark ? "rgba(255,255,255,.4)"  : "rgba(10,10,20,.4)";
  const cSkip   = dark ? "rgba(255,255,255,.3)"  : "rgba(10,10,20,.3)";
  const dotOn   = dark ? "rgba(255,255,255,.85)" : "rgba(10,10,20,.8)";
  const dotOff  = dark ? "rgba(255,255,255,.16)" : "rgba(10,10,20,.16)";
  const btnBg   = dark ? "rgba(255,255,255,.93)" : "rgba(10,10,20,.88)";
  const btnTxt  = dark ? "#0A0A14"               : "#ffffff";

  return (
    <>
      <style>{CSS}</style>
      {/* Full-bleed wrapper — fills whatever the iframe gives us */}
      <div style={{
        width: "100vw", height: "100dvh",
        background: bg,
        display: "flex", flexDirection: "column",
        fontFamily: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}>

        {/* ── Status-bar spacer + top row ─────────────────────── */}
        <div className="top-enter" style={{ padding: "52px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Theme toggle */}
          <button onClick={() => setDark(d => !d)}
            style={{
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

          {!isLast && (
            <button onClick={() => goTo(PAGES.length - 1)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 400, letterSpacing: -.15,
                color: cSkip, padding: "8px 8px",
              }}>Skip</button>
          )}
        </div>

        {/* ── Illustration (flex: 1) ─────────────────────────── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <div key={illusKey} className="illus-enter" style={{ width: "100%", maxWidth: 320 }}>
            <page.Illus dark={dark} />
          </div>
        </div>

        {/* ── Bottom content ─────────────────────────────────── */}
        <div style={{ padding: "0 26px 42px", flexShrink: 0 }}>
          <div key={textKey} className="text-enter">
            {/* Headline */}
            <h1 style={{
              fontSize: 32, fontWeight: 800,
              lineHeight: 1.13, letterSpacing: -.9,
              color: cPri, whiteSpace: "pre-line",
              marginBottom: 12,
            }}>{page.headline}</h1>

            {/* Description */}
            <p style={{
              fontSize: 15.5, lineHeight: 1.58,
              letterSpacing: -.1, color: cSec,
              marginBottom: 28,
            }}>{page.desc}</p>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 26 }}>
            {PAGES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  height: 6, borderRadius: 3, border: "none", cursor: "pointer",
                  background: i === idx ? dotOn : dotOff,
                  padding: 0,
                  transition: "width .38s cubic-bezier(.22,1,.36,1), background .3s",
                  width: i === idx ? 24 : 6,
                }} />
            ))}
          </div>

          {/* CTA */}
          <button
            className={btnTap ? "btn-tap" : ""}
            onMouseDown={() => setBtnTap(false)}
            onPointerDown={() => setBtnTap(true)}
            onPointerUp={() => { setBtnTap(false); !isLast ? goTo(idx + 1) : undefined; }}
            onPointerLeave={() => setBtnTap(false)}
            style={{
              width: "100%", height: 56,
              borderRadius: 18, border: "none", cursor: "pointer",
              background: btnBg, color: btnTxt,
              fontSize: 16, fontWeight: 650, letterSpacing: -.3,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: dark
                ? "0 2px 24px rgba(255,255,255,.06), 0 1px 2px rgba(0,0,0,.28)"
                : "0 2px 24px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.06)",
              transition: "transform .12s",
            }}>
            {isLast ? "Get Started" : "Continue"}
            {!isLast && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke={btnTxt} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
