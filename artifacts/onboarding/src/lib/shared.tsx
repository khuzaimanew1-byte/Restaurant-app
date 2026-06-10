import { useState, useEffect, useRef, useCallback } from "react";

// ─── Password complexity ─────────────────────────────────────────────────────

export const PW_NUM     = /[0-9]/;
export const PW_UPPER   = /[A-Z]/;
export const PW_SPECIAL = /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/;

export function validatePwComplexity(pw: string): string | null {
  if (!pw)                  return "Password is required.";
  if (pw.length < 8)        return "Password must be at least 8 characters.";
  if (!PW_UPPER.test(pw))   return "Password must contain at least one uppercase letter.";
  if (!PW_NUM.test(pw))     return "Password must contain at least one number.";
  if (!PW_SPECIAL.test(pw)) return "Password must contain at least one special character.";
  return null;
}

export function PwRequirements({ pw, dark }: { pw: string; dark: boolean }) {
  if (!pw) return null;
  const ok  = dark ? "#34D399" : "#059669";
  const err = dark ? "#F87171" : "#DC2626";
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", gap: "4px 10px", marginTop: 8 }}>
      {[
        { met: pw.length >= 8,      label: "8+ chars"  },
        { met: PW_UPPER.test(pw),   label: "Uppercase" },
        { met: PW_NUM.test(pw),     label: "Number"    },
        { met: PW_SPECIAL.test(pw), label: "Special"   },
      ].map(({ met, label }) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 500, color: met ? ok : err }}>
          <span style={{ fontSize: 13 }}>{met ? "✓" : "✗"}</span>{label}
        </span>
      ))}
    </div>
  );
}

// ─── Dark mode ───────────────────────────────────────────────────────────────

export function useDarkMode(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme:dark)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-dark", dark ? "" : "false");
  }, [dark]);
  return [dark, setDark];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Counts down from `expiresAt` (ms epoch). Pass null to pause / return 0. */
export function useCountdown(expiresAt: number | null): number {
  const [ms, setMs] = useState(() =>
    expiresAt ? Math.max(0, expiresAt - Date.now()) : 0
  );
  useEffect(() => {
    if (!expiresAt) { setMs(0); return; }
    setMs(Math.max(0, expiresAt - Date.now()));
    const id = setInterval(() => setMs(Math.max(0, expiresAt - Date.now())), 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return ms;
}

/** Returns [isShaking, triggerShake]. Resets & re-fires the CSS `.shake` class. */
export function useShake(duration = 480): [boolean, () => void] {
  const [shaking, setShaking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const trigger = useCallback(() => {
    setShaking(false);
    clearTimeout(timer.current);
    requestAnimationFrame(() => {
      setShaking(true);
      timer.current = setTimeout(() => setShaking(false), duration);
    });
  }, [duration]);
  return [shaking, trigger];
}

/**
 * Modal lifecycle manager — single source of mount/visible state.
 * open()  → mounts, then animates in (20ms delay for CSS transition)
 * close() → animates out, stays mounted for softDelay ms, then unmounts
 * close(true) → animates out + unmounts immediately (use on permanent dismiss)
 */
export function useSoftMount(softDelay = 120_000) {
  const [mounted,  setMounted]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const open = useCallback(() => {
    clearTimeout(timer.current);
    setMounted(true);
    setTimeout(() => setVisible(true), 20);
  }, []);

  const close = useCallback((immediate = false) => {
    setVisible(false);
    clearTimeout(timer.current);
    if (immediate) {
      setMounted(false);
    } else {
      timer.current = setTimeout(() => setMounted(false), softDelay);
    }
  }, [softDelay]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { mounted, visible, open, close };
}

// ─── Form field helpers ───────────────────────────────────────────────────────
//
// Call once per component at render time. Returns constants, base styles,
// and label/underline helper functions — all scoped to the current dark/accent.

export function formField(dark: boolean, accent: string) {
  const errClr    = dark ? "#F87171"               : "#DC2626";
  const idleLbl   = dark ? "rgba(200,197,245,0.36)" : "rgba(13,11,30,0.36)";
  const activeLbl = dark ? "rgba(200,197,245,0.60)" : "rgba(13,11,30,0.52)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)" : "#09071E";
  const baseLine  = dark ? "rgba(255,255,255,0.09)" : "rgba(13,11,30,0.13)";

  const FIELD_H  = 58;
  const INPUT_H  = 34;
  const INPUT_PB = 10;
  const IDLE_TOP = 28; // FIELD_H - INPUT_H/2 - INPUT_PB/2 - 8

  const inputBase: React.CSSProperties = {
    position: "absolute", bottom: 0, left: 0, right: 0, height: INPUT_H,
    background: "none", border: "none", outline: "none", borderRadius: 0,
    fontSize: 15.5, color: inputTxt, paddingBottom: INPUT_PB,
    fontFamily: "inherit", letterSpacing: "-0.015em",
    WebkitAppearance: "none", boxSizing: "border-box",
  };

  const underlineBase: React.CSSProperties = {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
    transition: "background 0.22s ease",
  };

  function labelStyle(active: boolean, focused: boolean, err: boolean): React.CSSProperties {
    return {
      position: "absolute", left: 0,
      top: active ? 2 : IDLE_TOP,
      fontSize: active ? 10.5 : 15.5,
      fontWeight: active ? 700 : 400,
      letterSpacing: active ? "0.09em" : "-0.015em",
      textTransform: active ? "uppercase" : "none" as const,
      lineHeight: 1, whiteSpace: "nowrap" as const, pointerEvents: "none" as const,
      color: err ? errClr : focused ? accent : active ? activeLbl : idleLbl,
      transition: "top 0.28s cubic-bezier(0.22,1,0.36,1), font-size 0.28s cubic-bezier(0.22,1,0.36,1), color 0.22s ease, letter-spacing 0.28s cubic-bezier(0.22,1,0.36,1)",
    };
  }

  function sweepLine(focused: boolean, err: boolean): React.CSSProperties {
    return {
      position: "absolute", bottom: 0, left: 0,
      height: 2, borderRadius: 2,
      width: focused ? "100%" : "0%",
      background: err ? errClr : accent,
      transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
    };
  }

  function underlineStyle(err: boolean): React.CSSProperties {
    return { ...underlineBase, background: err ? errClr : baseLine };
  }

  return {
    FIELD_H, INPUT_H, INPUT_PB, IDLE_TOP,
    inputBase, underlineBase,
    labelStyle, sweepLine, underlineStyle,
    errClr, idleLbl, activeLbl, inputTxt, baseLine,
  };
}

// ─── Semantic colours ─────────────────────────────────────────────────────────

export function useFormColors(dark: boolean) {
  return {
    headClr:    dark ? "rgba(242,241,255,0.97)" : "#09071E",
    subClr:     dark ? "rgba(200,197,245,0.46)" : "rgba(13,11,30,0.46)",
    successClr: dark ? "#34D399"                : "#059669",
  };
}

// ─── Reusable UI components ───────────────────────────────────────────────────

/** Password show/hide eye toggle button — drops into an `position:relative` field wrapper. */
export function PasswordToggle({ shown, onToggle, dark }: {
  shown: boolean;
  onToggle: () => void;
  dark: boolean;
}) {
  const idleLbl = dark ? "rgba(200,197,245,0.36)" : "rgba(13,11,30,0.36)";
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute", right: 0,
        bottom: 10 + (34 - 10) / 2 - 9, // INPUT_PB + (INPUT_H - INPUT_PB)/2 - 9
        width: 18, height: 18,
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: idleLbl, opacity: 0.55, padding: 0,
        transition: "color 0.22s, opacity 0.18s",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}
    >
      {shown
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/></svg>
      }
    </button>
  );
}

/** Red alert box — icon + message. Use for general / server errors. */
export function AlertBox({ message, dark, mb }: {
  message: string;
  dark: boolean;
  mb?: number;
}) {
  const errClr = dark ? "#F87171" : "#DC2626";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      background: dark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.06)",
      border: `1px solid ${dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.14)"}`,
      borderRadius: 12, padding: "11px 14px",
      ...(mb !== undefined ? { marginBottom: mb } : {}),
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
        <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 13, color: errClr, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{message}</span>
    </div>
  );
}

/** Inline single-field error text — sits below PwRequirements or a field. */
export function FieldError({ message, dark }: { message?: string; dark: boolean }) {
  if (!message) return null;
  const errClr = dark ? "#F87171" : "#DC2626";
  return (
    <p style={{ margin: "6px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{message}</p>
  );
}

/**
 * Bottom sheet modal — backdrop + slide-up card + handle bar.
 * Children go directly inside the card, below the handle.
 */
export function BottomSheet({ dark, visible, children, maxWidth = 460, zIndex = 200 }: {
  dark: boolean;
  visible: boolean;
  children: React.ReactNode;
  maxWidth?: number;
  zIndex?: number;
}) {
  const cardBg    = dark ? "rgba(12,10,35,0.97)"   : "rgba(255,255,255,0.98)";
  const handleClr = dark ? "rgba(255,255,255,0.14)" : "rgba(13,11,30,0.12)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: "0 0 env(safe-area-inset-bottom,0)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.76)" : "rgba(13,11,30,0.50)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.36s ease",
      }}/>

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth,
        background: cardBg,
        borderRadius: "28px 28px 0 0",
        backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.06)"}`,
        borderBottom: "none",
        boxShadow: dark
          ? "0 -24px 80px rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.06)"
          : "0 -24px 80px rgba(13,11,30,0.14), 0 -1px 0 rgba(255,255,255,0.9)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.46s cubic-bezier(0.22,1,0.36,1)",
        boxSizing: "border-box", willChange: "transform",
        overflow: "hidden",
      }}>
        {/* Handle bar */}
        <div style={{ padding: "14px 0 10px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 5, borderRadius: 100, background: handleClr }}/>
        </div>

        {children}
      </div>
    </div>
  );
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

export function Spinner({ size = 19 }: { size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.28)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }} />
  );
}

export function formatTimer(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  if (ms < 60_000) return `${Math.ceil(ms / 1000)}s`;
  return `${Math.ceil(ms / 60_000)} min`;
}
