import { useEffect, useState } from "react";
import { useDarkMode } from "../lib/shared";

interface Props {
  email?: string;
  role?: string;
  onLogout?: () => void;
}

export function SuccessPage({ email, role, onLogout }: Props) {
  const [mounted, setMounted] = useState(false);
  const [dark] = useDarkMode();

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(id);
  }, []);

  const bg = dark
    ? "linear-gradient(155deg,#03021A 0%,#060424 50%,#0B083E 100%)"
    : "linear-gradient(155deg,#FFFFFF 0%,#F5F3FF 20%,#EDE9FE 40%,#DDD6FE 62%,#C4B5FD 82%,#A78BFA 100%)";

  const headClr = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr  = dark ? "rgba(200,197,245,0.52)"  : "rgba(13,11,30,0.48)";
  const accent  = dark ? "#A78BFA" : "#7C3AED";
  const glow    = dark
    ? "0 20px 80px rgba(139,92,246,0.45), 0 0 0 1px rgba(167,139,250,0.15)"
    : "0 20px 80px rgba(109,40,217,0.28), 0 0 0 1px rgba(124,58,237,0.1)";
  const ringClr = dark ? "rgba(167,139,250,0.14)" : "rgba(124,58,237,0.08)";

  function fade(delay: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    };
  }

  return (
    <div style={{
      width: "100vw", height: "100dvh", background: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", width: "80vw", height: "80vw", maxWidth: 560, maxHeight: 560,
          top: "-20%", right: "-18%", borderRadius: "50%",
          background: `radial-gradient(circle,${dark ? "rgba(139,92,246,0.3)" : "rgba(167,139,250,0.38)"} 0%,transparent 65%)`,
        }}/>
        <div style={{
          position: "absolute", width: "70vw", height: "70vw", maxWidth: 460, maxHeight: 460,
          bottom: "-20%", left: "-18%", borderRadius: "50%",
          background: `radial-gradient(circle,${dark ? "rgba(79,70,229,0.22)" : "rgba(109,40,217,0.18)"} 0%,transparent 65%)`,
        }}/>
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        padding: "0 clamp(32px,8vw,48px)", maxWidth: 380,
      }}>
        <div style={{ marginBottom: 32, ...fade(0) }}>
          <div style={{ position: "relative", width: 96, height: 96 }}>
            {[1, 0.55, 0.25].map((o, i) => (
              <div key={i} style={{
                position: "absolute", inset: -(i * 18),
                borderRadius: "50%", background: ringClr, opacity: o,
                animation: `pulse-ring ${2.5 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`,
              }}/>
            ))}
            <div style={{
              position: "relative", zIndex: 1,
              width: 96, height: 96, borderRadius: "50%",
              background: `linear-gradient(135deg,${accent},#6366F1)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: glow,
              animation: mounted ? "scaleIn 0.6s cubic-bezier(0.22,1,0.36,1)" : "none",
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <h1 style={{
          fontSize: "clamp(26px,6.5vw,36px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.1,
          color: headClr, margin: "0 0 12px", ...fade(0.15),
        }}>
          Welcome to<br />Attendance App
        </h1>

        {(email || role) && (
          <p style={{ fontSize: 14, color: subClr, margin: "0 0 32px", lineHeight: 1.55, letterSpacing: "-0.01em", ...fade(0.25) }}>
            {role === "ADMIN" ? "Signed in as Administrator" : "You're all set"}
            {email ? ` · ${email}` : ""}
          </p>
        )}

        <div style={{ ...fade(0.35) }}>
          <button
            onClick={onLogout}
            onPointerDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
            onPointerUp={e => (e.currentTarget.style.transform = "")}
            onPointerLeave={e => (e.currentTarget.style.transform = "")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 999,
              border: `1.5px solid ${dark ? "rgba(167,139,250,0.22)" : "rgba(124,58,237,0.18)"}`,
              background: dark ? "rgba(167,139,250,0.07)" : "rgba(124,58,237,0.05)",
              color: accent, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em",
              cursor: "pointer", fontFamily: "inherit",
              transition: "transform 0.12s, background 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
