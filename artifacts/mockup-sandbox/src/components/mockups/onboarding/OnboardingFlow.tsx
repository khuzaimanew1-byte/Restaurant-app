import { useState, useEffect, useRef } from "react";

interface Page {
  id: number;
  headline: string;
  description: string;
  illustration: React.ReactNode;
}

function AttendanceIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-72 h-72">
        {/* Soft glow background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 60%, transparent 80%)",
          }}
        />

        {/* Center device card */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-40 rounded-2xl flex flex-col items-center justify-center gap-2"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="rgba(180,185,255,0.9)" />
              <path
                d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                stroke="rgba(180,185,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="space-y-1 w-full px-3">
            <div
              className="h-1.5 rounded-full w-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div
              className="h-1.5 rounded-full w-3/4"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
            <div
              className="h-1.5 rounded-full w-5/6"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
          </div>
          <div
            className="w-12 h-5 rounded-full flex items-center justify-center mt-1"
            style={{ background: "rgba(99,102,241,0.35)" }}
          >
            <span className="text-[8px] font-semibold text-indigo-200">
              CHECK IN
            </span>
          </div>
        </div>

        {/* Wi-Fi arcs */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${72 + i * 52}px`,
              height: `${72 + i * 52}px`,
              borderColor: `rgba(99,102,241,${0.18 - i * 0.04})`,
              animation: `pulseRing ${1.8 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* Floating stat cards */}
        <StatCard
          value="98%"
          label="On-Time"
          top="4px"
          left="0px"
          delay="0s"
          color="rgba(99,102,241,0.25)"
        />
        <StatCard
          value="12"
          label="Checked in"
          top="40px"
          right="0px"
          delay="0.2s"
          color="rgba(16,185,129,0.2)"
        />
        <StatCard
          value="✓"
          label="Synced"
          bottom="32px"
          left="8px"
          delay="0.4s"
          color="rgba(245,158,11,0.2)"
        />
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  top,
  left,
  right,
  bottom,
  delay,
  color,
}: {
  value: string;
  label: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: string;
  color: string;
}) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center w-16 h-14 rounded-xl"
      style={{
        top,
        left,
        right,
        bottom,
        background: color,
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
        animation: `floatCard 3s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <span className="text-sm font-bold text-white/90">{value}</span>
      <span className="text-[9px] text-white/50 font-medium">{label}</span>
    </div>
  );
}

function LeaveIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-72 h-72">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Calendar card */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-3xl p-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-white/60">
              June 2025
            </span>
            <div
              className="px-2 py-0.5 rounded-full text-[8px] font-medium"
              style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7" }}
            >
              Approved
            </div>
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
              <div
                key={d}
                className="text-center text-[7px] text-white/30 font-medium"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const isLeave = [10, 11, 12, 13, 14].includes(day);
              const isToday = day === 6;
              return (
                <div
                  key={day}
                  className="aspect-square flex items-center justify-center rounded-md text-[7px] font-medium"
                  style={{
                    background: isLeave
                      ? "rgba(16,185,129,0.3)"
                      : isToday
                        ? "rgba(99,102,241,0.35)"
                        : "transparent",
                    color: isLeave
                      ? "#6ee7b7"
                      : isToday
                        ? "rgba(200,203,255,0.95)"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave request card */}
        <div
          className="absolute flex flex-col gap-1 px-3 py-2 rounded-xl w-36"
          style={{
            top: "8px",
            right: "-4px",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            animation: "floatCard 3.5s ease-in-out infinite",
            animationDelay: "0.3s",
          }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.25)" }}
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5l2.5 2.5L8 3"
                  stroke="#6ee7b7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[9px] font-semibold text-white/80">
              Leave Approved
            </span>
          </div>
          <span className="text-[8px] text-white/40">
            Annual Leave · Jun 10–14
          </span>
        </div>

        {/* Timeline item */}
        <div
          className="absolute flex items-center gap-2 px-3 py-2 rounded-xl w-32"
          style={{
            bottom: "16px",
            left: "-8px",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.09)",
            animation: "floatCard 4s ease-in-out infinite",
            animationDelay: "0.8s",
          }}
        >
          <div
            className="w-1.5 h-8 rounded-full"
            style={{
              background:
                "linear-gradient(to bottom, rgba(99,102,241,0.7), rgba(16,185,129,0.5))",
            }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-semibold text-white/70">
              2 requests
            </span>
            <span className="text-[7px] text-white/35">pending review</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsIllustration() {
  const bars = [65, 82, 58, 91, 74, 88, 96];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-72 h-72">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.09) 0%, transparent 70%)",
          }}
        />

        {/* Main analytics card */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-40 rounded-3xl p-4"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-semibold text-white/50">
              Attendance Score
            </span>
            <span className="text-sm font-bold text-white/90">94%</span>
          </div>

          {/* Progress arc — simplified as bar */}
          <div
            className="w-full h-1 rounded-full mb-3"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: "94%",
                background:
                  "linear-gradient(to right, rgba(99,102,241,0.8), rgba(99,102,241,0.4))",
              }}
            />
          </div>

          {/* Mini bar chart */}
          <div className="flex items-end gap-1 h-12">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background:
                    i === 6
                      ? "rgba(99,102,241,0.7)"
                      : "rgba(255,255,255,0.12)",
                  animation: `barGrow 0.6s ease-out both`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
              <span key={d} className="text-[6px] text-white/25 flex-1 text-center">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Score badge */}
        <div
          className="absolute flex flex-col items-center justify-center w-16 h-16 rounded-2xl"
          style={{
            top: "8px",
            right: "8px",
            background: "rgba(99,102,241,0.18)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(99,102,241,0.25)",
            animation: "floatCard 3.2s ease-in-out infinite",
            animationDelay: "0.1s",
          }}
        >
          <span className="text-base font-bold text-indigo-300">A+</span>
          <span className="text-[7px] text-white/40">Rating</span>
        </div>

        {/* Hours card */}
        <div
          className="absolute flex flex-col gap-0.5 px-3 py-2 rounded-xl"
          style={{
            bottom: "16px",
            right: "0px",
            background: "rgba(245,158,11,0.12)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(245,158,11,0.18)",
            animation: "floatCard 3.8s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        >
          <span className="text-sm font-bold text-amber-200">42h</span>
          <span className="text-[8px] text-white/40">This week</span>
        </div>

        {/* Punctuality tag */}
        <div
          className="absolute flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{
            bottom: "24px",
            left: "-4px",
            background: "rgba(16,185,129,0.12)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(16,185,129,0.18)",
            animation: "floatCard 4.2s ease-in-out infinite",
            animationDelay: "0.7s",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#6ee7b7" }}
          />
          <span className="text-[8px] font-medium text-emerald-300">
            100% Punctual
          </span>
        </div>
      </div>
    </div>
  );
}

const PAGES: Page[] = [
  {
    id: 0,
    headline: "Attendance, Simplified",
    description:
      "Track attendance securely through office Wi-Fi with offline support and automatic synchronization.",
    illustration: <AttendanceIllustration />,
  },
  {
    id: 1,
    headline: "Manage Leave Effortlessly",
    description:
      "Apply for leave, track requests, and receive approvals through a professional digital workflow.",
    illustration: <LeaveIllustration />,
  },
  {
    id: 2,
    headline: "Know Your Progress",
    description:
      "Monitor attendance score, punctuality, working hours, and performance trends in one place.",
    illustration: <AnalyticsIllustration />,
  },
];

export function OnboardingFlow() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [visible, setVisible] = useState(true);
  const [dark, setDark] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = (idx: number, dir: "next" | "prev" = "next") => {
    if (animating || idx === current) return;
    setDirection(dir);
    setAnimating(true);
    setVisible(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
      setTimeout(() => setAnimating(false), 420);
    }, 300);
  };

  const handleNext = () => {
    if (current < PAGES.length - 1) goTo(current + 1, "next");
  };

  const handleSkip = () => goTo(PAGES.length - 1, "next");

  const page = PAGES[current];

  const bg = dark
    ? "linear-gradient(165deg, #0c0c14 0%, #10101e 50%, #0a0a10 100%)"
    : "linear-gradient(165deg, #f5f5f9 0%, #f0f0f5 50%, #ebebf0 100%)";

  const textPrimary = dark ? "rgba(255,255,255,0.92)" : "rgba(10,10,20,0.88)";
  const textSecondary = dark ? "rgba(255,255,255,0.42)" : "rgba(10,10,20,0.42)";
  const textSkip = dark ? "rgba(255,255,255,0.35)" : "rgba(10,10,20,0.35)";
  const dotActive = dark ? "rgba(255,255,255,0.85)" : "rgba(20,20,40,0.8)";
  const dotInactive = dark ? "rgba(255,255,255,0.18)" : "rgba(20,20,40,0.18)";
  const btnBg = dark ? "rgba(255,255,255,0.92)" : "rgba(10,10,20,0.88)";
  const btnText = dark ? "#0a0a14" : "#ffffff";

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      style={{ background: bg, fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif" }}
    >
      <style>{`
        @keyframes pulseRing {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes btnPress {
          0% { transform: scale(1); }
          50% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        .btn-press:active { animation: btnPress 0.15s ease; }
        .slide-enter-next { animation: fadeSlideUp 0.38s cubic-bezier(.22,1,.36,1) both; }
        .slide-enter-prev { animation: fadeSlideDown 0.38s cubic-bezier(.22,1,.36,1) both; }
        .illus-enter { animation: scaleIn 0.42s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 pt-14 pb-2"
        style={{ animation: "fadeSlideDown 0.5s ease both" }}
      >
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          }}
        >
          {dark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill="rgba(255,255,255,0.5)" />
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="rgba(0,0,0,0.4)" />
            </svg>
          )}
        </button>

        {current < PAGES.length - 1 && (
          <button
            onClick={handleSkip}
            className="btn-press px-4 py-2 rounded-full text-sm font-medium"
            style={{
              color: textSkip,
              letterSpacing: "-0.01em",
            }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Illustration area */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div
          key={`illus-${current}`}
          className="w-full h-full illus-enter"
          style={{ maxHeight: "340px" }}
        >
          {page.illustration}
        </div>
      </div>

      {/* Bottom content */}
      <div
        className="px-7 pb-12"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 48px)" }}
      >
        {/* Text block */}
        <div
          key={`text-${current}`}
          className={direction === "next" ? "slide-enter-next" : "slide-enter-prev"}
        >
          <h1
            className="text-3xl font-bold mb-3 leading-tight"
            style={{
              color: textPrimary,
              letterSpacing: "-0.03em",
              lineHeight: "1.15",
            }}
          >
            {page.headline}
          </h1>
          <p
            className="text-base leading-relaxed mb-6"
            style={{
              color: textSecondary,
              letterSpacing: "-0.005em",
              lineHeight: "1.55",
            }}
          >
            {page.description}
          </p>
        </div>

        {/* Page dots */}
        <div className="flex items-center gap-2 mb-7">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === current ? "24px" : "6px",
                height: "6px",
                background: i === current ? dotActive : dotInactive,
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={handleNext}
          className="btn-press w-full h-14 rounded-2xl flex items-center justify-center font-semibold text-base transition-transform"
          style={{
            background: btnBg,
            color: btnText,
            letterSpacing: "-0.02em",
            boxShadow: dark
              ? "0 2px 24px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.3)"
              : "0 2px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          {current === PAGES.length - 1 ? "Get Started" : "Continue"}
          {current < PAGES.length - 1 && (
            <svg
              className="ml-2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke={btnText}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
