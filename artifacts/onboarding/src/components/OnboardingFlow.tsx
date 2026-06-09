import { useState, useRef, useCallback, useEffect } from "react";
import { getTokens, type ColorTokens } from "../lib/colors";
import { useDarkMode } from "../lib/shared";

const SIDE = "min(82vw, 340px)";

function Chip({
  t, val, sub, an, delay, chipColor,
  top, left, right, bottom,
}: {
  t: ColorTokens; val: string; sub: string; an: string; delay: string; chipColor: string;
  top?: string; left?: string; right?: string; bottom?: string;
}) {
  return (
    <div style={{
      position: "absolute", top, left, right, bottom,
      width: "20%", minWidth: 52, aspectRatio: "1.15",
      background: chipColor, backdropFilter: "blur(20px)",
      border: `1px solid ${t.glassBorder}`, borderRadius: 14,
      boxShadow: t.glassShadow,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
      animation: `${an} ${3 + parseFloat(delay) * 2}s ease-in-out infinite`,
      animationDelay: delay,
    }}>
      <span style={{ fontSize: "clamp(11px,3.2vw,15px)", fontWeight: 700, color: t.illusText }}>{val}</span>
      <span style={{ fontSize: "clamp(6px,1.6vw,8px)", fontWeight: 500, color: t.illusTextSub }}>{sub}</span>
    </div>
  );
}

function AttendanceIllus({ t }: { t: ColorTokens }) {
  return (
    <div style={{ position: "relative", width: SIDE, height: SIDE }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: t.radialGlow }} />
      {[38, 55, 72].map((pct, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${pct}%`, height: `${pct}%`,
          top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
          borderRadius: "50%",
          border: `1.5px solid ${t.accentBorder.replace(/[\d.]+\)$/, `${0.28 - i * 0.07})`)}`,
          animation: `pulse-ring ${1.9 + i * .45}s ease-in-out infinite`,
          animationDelay: `${i * .28}s`,
        }} />
      ))}
      <div style={{
        position: "absolute", width: "36%", height: "48%", top: "26%", left: "32%",
        background: t.glassCard, backdropFilter: "blur(28px)",
        border: `1px solid ${t.glassBorder}`, borderRadius: "18%",
        boxShadow: t.glassShadow,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "7%",
      }}>
        <div style={{
          width: "38%", aspectRatio: "1", borderRadius: "50%",
          background: t.accentLight,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: "60%" }}>
            <circle cx="12" cy="8" r="4" fill={t.illusBadgeText} />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={t.illusBadgeText} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ width: "72%", display: "flex", flexDirection: "column", gap: 4 }}>
          {[1, .7, .86].map((w, i) => (
            <div key={i} style={{ height: 3, borderRadius: 2, width: `${w * 100}%`, background: t.illusBarRest }} />
          ))}
        </div>
        <div style={{
          padding: "3px 10px", borderRadius: 20,
          fontSize: "clamp(7px,1.8vw,9px)", fontWeight: 700, letterSpacing: 0.6,
          background: t.chipA, color: t.illusBadgeText,
        }}>CHECK IN</div>
      </div>
      <Chip t={t} val="98%" sub="On-Time"    top="12%" left="2%"   an="float-a" delay="0s"   chipColor={t.chipA} />
      <Chip t={t} val="12"  sub="Checked in" top="28%" right="1%"  an="float-b" delay=".22s" chipColor={t.chipB} />
      <Chip t={t} val="✓"   sub="Synced"     bottom="15%" left="6%" an="float-c" delay=".44s" chipColor={t.chipC} />
    </div>
  );
}

function LeaveIllus({ t }: { t: ColorTokens }) {
  const leaveDays = new Set([10, 11, 12, 13, 14]);
  return (
    <div style={{ position: "relative", width: SIDE, height: SIDE }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: t.radialGlow }} />
      <div style={{
        position: "absolute", width: "58%", height: "58%", top: "21%", left: "21%",
        background: t.glassCard, backdropFilter: "blur(28px)",
        border: `1px solid ${t.glassBorder}`, borderRadius: "14%",
        boxShadow: t.glassShadow, padding: "4.5%",
        display: "flex", flexDirection: "column", gap: "3%",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "clamp(7px,1.9vw,9.5px)", fontWeight: 600, color: t.illusTextSub }}>June 2025</span>
          <div style={{
            padding: "2px 6px", borderRadius: 20,
            fontSize: "clamp(6px,1.6vw,8px)", fontWeight: 700,
            background: t.chipB, color: t.illusBadgeText,
          }}>Approved</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: "clamp(6px,1.5vw,7.5px)", fontWeight: 600, color: t.illusTextSub }}>{d}</div>
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
                background: leave ? t.chipB : today ? t.chipA : "transparent",
                color: leave || today ? t.illusBadgeText : t.illusTextSub,
              }}>{day}</div>
            );
          })}
        </div>
      </div>
      <div style={{
        position: "absolute", top: "6%", right: "2%",
        padding: "6px 10px", borderRadius: 13,
        background: t.glassCard, backdropFilter: "blur(20px)",
        border: `1px solid ${t.glassBorder}`, boxShadow: t.glassShadow,
        display: "flex", alignItems: "center", gap: 5,
        animation: "float-b 3.5s ease-in-out infinite",
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          background: t.chipB,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: "clamp(7px,1.9vw,9px)", fontWeight: 600, whiteSpace: "nowrap", color: t.illusText }}>Leave Approved</span>
      </div>
      <div style={{
        position: "absolute", bottom: "6%", left: "3%",
        padding: "7px 10px", borderRadius: 13,
        background: t.glassCard, backdropFilter: "blur(20px)",
        border: `1px solid ${t.glassBorder}`, boxShadow: t.glassShadow,
        display: "flex", alignItems: "center", gap: 7,
        animation: "float-c 4s ease-in-out infinite", animationDelay: ".5s",
      }}>
        <div style={{ width: 3, height: 26, borderRadius: 2, flexShrink: 0, background: `linear-gradient(to bottom,${t.accent},${t.accentLight})` }} />
        <div>
          <div style={{ fontSize: "clamp(7px,1.9vw,9px)", fontWeight: 600, color: t.illusText }}>2 requests</div>
          <div style={{ fontSize: "clamp(6px,1.6vw,8px)", color: t.illusTextSub }}>pending review</div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsIllus({ t }: { t: ColorTokens }) {
  const bars = [.65, .82, .58, .91, .74, .88, .96];
  return (
    <div style={{ position: "relative", width: SIDE, height: SIDE }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: t.radialGlow }} />
      <div style={{
        position: "absolute", width: "66%", height: "54%", top: "23%", left: "17%",
        background: t.glassCard, backdropFilter: "blur(28px)",
        border: `1px solid ${t.glassBorder}`, borderRadius: "14%",
        boxShadow: t.glassShadow, padding: "5% 5% 4%",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5%" }}>
          <span style={{ fontSize: "clamp(7px,1.9vw,9.5px)", fontWeight: 500, color: t.illusTextSub }}>Attendance Score</span>
          <span style={{ fontSize: "clamp(12px,3.5vw,16px)", fontWeight: 700, color: t.illusText }}>94%</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: t.illusBarRest, marginBottom: "8%" }}>
          <div style={{ height: "100%", width: "94%", borderRadius: 2, background: `linear-gradient(90deg,${t.accent},${t.accentLight})` }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3%", flex: 1 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h * 100}%`, borderRadius: 3,
              background: i === 6 ? t.illusBarActive : t.illusBarRest,
              animation: `bar-grow .6s ease-out ${i * .07}s both`, transformOrigin: "bottom",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "4%" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "clamp(5.5px,1.4vw,7px)", color: t.illusTextSub }}>{d}</div>
          ))}
        </div>
      </div>
      <div style={{
        position: "absolute", top: "6%", right: "6%", width: "18%", aspectRatio: "1",
        background: t.chipA, backdropFilter: "blur(16px)",
        border: `1px solid ${t.accentBorder}`, borderRadius: "20%", boxShadow: t.glassShadow,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "float-a 3.2s ease-in-out infinite",
      }}>
        <span style={{ fontSize: "clamp(12px,3.5vw,17px)", fontWeight: 700, color: t.illusBadgeText }}>A+</span>
        <span style={{ fontSize: "clamp(5.5px,1.5vw,7.5px)", color: t.illusTextSub }}>Rating</span>
      </div>
      <div style={{
        position: "absolute", bottom: "6%", right: "4%", padding: "6px 11px", borderRadius: 13,
        background: t.chipC, backdropFilter: "blur(16px)",
        border: `1px solid ${t.glassBorder}`, boxShadow: t.glassShadow,
        animation: "float-b 3.8s ease-in-out infinite", animationDelay: ".4s",
      }}>
        <div style={{ fontSize: "clamp(11px,3.2vw,15px)", fontWeight: 700, color: t.illusBadgeText }}>42h</div>
        <div style={{ fontSize: "clamp(6px,1.6vw,8px)", color: t.illusTextSub }}>This week</div>
      </div>
      <div style={{
        position: "absolute", bottom: "7%", left: "3%", padding: "6px 10px", borderRadius: 13,
        display: "flex", alignItems: "center", gap: 6,
        background: t.chipB, backdropFilter: "blur(16px)",
        border: `1px solid ${t.glassBorder}`, boxShadow: t.glassShadow,
        animation: "float-c 4.2s ease-in-out infinite", animationDelay: ".7s",
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
        <span style={{ fontSize: "clamp(7px,1.9vw,9px)", fontWeight: 600, color: t.illusBadgeText, whiteSpace: "nowrap" }}>100% Punctual</span>
      </div>
    </div>
  );
}

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

type Phase = "idle" | "exit" | "enter";

interface OnboardingFlowProps {
  onGetStarted?: () => void;
  initialSlide?: number;
  onSlideChange?: (n: number) => void;
}

export function OnboardingFlow({ onGetStarted, initialSlide = 0, onSlideChange }: OnboardingFlowProps) {
  const [idx, setIdx]     = useState(() => Math.max(0, Math.min(initialSlide, PAGES.length - 1)));
  const [dir, setDir]     = useState<"fwd" | "bwd">("fwd");
  const [phase, setPhase] = useState<Phase>("idle");
  const [dark, setDark]   = useDarkMode();
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
      enterT.current = setTimeout(() => setPhase("idle"), 500);
    }, 300);
  }, [phase, idx, onSlideChange]);

  const isLast = idx === PAGES.length - 1;
  const page   = PAGES[idx];
  const t      = getTokens(dark);

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

  return (
    <div style={{
      width: "100vw", height: "100dvh", background: t.bg, overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 55% at 50% 5%, ${dark ? "rgba(79,70,229,0.2)" : "rgba(79,70,229,0.08)"} 0%, transparent 65%)`,
      }} />

      <div className="top-enter" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "clamp(40px,10vw,56px) clamp(18px,5vw,24px) 0",
        flexShrink: 0, position: "relative", zIndex: 1,
      }}>
        <button onClick={() => setDark(d => !d)} style={{
          width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer",
          background: t.fieldBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>
          {dark
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill={t.textSub} />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={t.textSub} strokeWidth="2" strokeLinecap="round" />
              </svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={t.textSub} />
              </svg>
          }
        </button>
        {!isLast &&
          <button onClick={() => goTo(PAGES.length - 1)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "clamp(14px,4vw,16px)", fontWeight: 400, letterSpacing: -.15,
            color: t.textTer, padding: "8px 6px",
            fontFamily: "inherit",
          }}>Skip</button>
        }
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(8px,2vw,16px) 0", minHeight: 0,
        position: "relative", zIndex: 1,
      }}>
        <div key={idx} className={illusClass()} style={{ willChange: "transform, opacity" }}>
          <page.Illus t={t} />
        </div>
      </div>

      <div style={{
        padding: "0 clamp(20px,6vw,28px) clamp(28px,7vw,44px)",
        flexShrink: 0, position: "relative", zIndex: 1,
      }}>
        <h1 key={`h-${idx}`} className={textClass("stagger-1")} style={{
          fontSize: "clamp(26px,7.5vw,34px)", fontWeight: 800,
          lineHeight: 1.13, letterSpacing: "-.03em", color: t.text,
          whiteSpace: "pre-line", marginBottom: "clamp(8px,2.5vw,14px)",
        }}>{page.headline}</h1>

        <p key={`d-${idx}`} className={textClass("stagger-2")} style={{
          fontSize: "clamp(14px,4vw,16px)", lineHeight: 1.58,
          letterSpacing: "-.01em", color: t.textSub,
          marginBottom: "clamp(20px,5.5vw,30px)",
        }}>{page.desc}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "clamp(18px,5vw,26px)" }}>
          {PAGES.map((_, i) => (
            <button key={i} className="dot" onClick={() => goTo(i)} style={{
              height: 6, borderRadius: 3, border: "none", cursor: "pointer", padding: 0,
              background: i === idx ? t.accent : t.dotOff,
              width: i === idx ? 24 : 6,
            }} />
          ))}
        </div>

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
            background: t.accent, color: t.accentText,
            fontSize: "clamp(14px,4vw,16px)", fontWeight: 700, letterSpacing: "-.02em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: `0 4px 24px ${dark ? "rgba(79,70,229,0.45)" : "rgba(79,70,229,0.3)"}`,
            transition: "transform .12s", willChange: "transform",
            fontFamily: "inherit",
          }}>
          {isLast ? "Get Started" : "Continue"}
          {!isLast &&
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={t.accentText} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        </button>
      </div>
    </div>
  );
}
