import { useState, useEffect } from "react";

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
  if (ms < 60000) return `${Math.ceil(ms / 1000)}s`;
  return `${Math.ceil(ms / 60000)} min`;
}
