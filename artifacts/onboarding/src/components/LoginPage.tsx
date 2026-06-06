import { useState, useEffect, useRef } from "react";

const indigo = "#6366F1";
const error  = "#EF4444";

function useDark() {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme:dark)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return [dark, setDark] as const;
}

interface Props {
  onBack?: () => void;
}

export function LoginPage({ onBack }: Props) {
  const [dark, setDark] = useDark();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading]   = useState(false);
  const [scale, setScale]       = useState(1);
  const mounted = useRef(false);

  // Entry animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  const bg      = dark ? "#0C0C14" : "#F5F5F9";
  const surface = dark ? "#14141F" : "#FFFFFF";
  const border  = dark ? "#2A2A3D" : "#E8E8EF";
  const pri     = dark ? "#F0F0F8" : "#0D0D1A";
  const sec     = dark ? "#8888AA" : "#6B6B88";
  const cardSh  = dark
    ? "0 2px 40px rgba(0,0,0,.5)"
    : "0 2px 32px rgba(0,0,0,.07)";

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!email.includes("@")) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    // Placeholder — replace with real Back4App call
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    // TODO: navigate to dashboard / success
  }

  return (
    <div style={{
      width: "100vw", height: "100dvh", background: bg, overflow: "auto",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      opacity: entered ? 1 : 0,
      transform: entered ? "translateY(0)" : "translateY(18px)",
      transition: "opacity .42s cubic-bezier(.22,1,.36,1), transform .42s cubic-bezier(.22,1,.36,1)",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "clamp(40px,10vw,56px) clamp(18px,5vw,24px) 0",
        flexShrink: 0,
      }}>
        {/* Back */}
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer",
          background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke={sec} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dark/light toggle */}
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
      </div>

      {/* Card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(20px,5vw,40px) clamp(18px,5vw,24px) clamp(28px,7vw,44px)",
      }}>
        <div style={{
          width: "100%", maxWidth: 400,
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: "clamp(20px,5vw,28px)",
          padding: "clamp(28px,7vw,40px) clamp(24px,6vw,36px)",
          boxShadow: cardSh,
        }}>
          {/* App icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 15,
            background: dark ? "#1C1C2A" : "#F5F5F9",
            border: `1px solid ${border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28,
            boxShadow: dark ? "0 4px 20px rgba(0,0,0,.3)" : "0 4px 16px rgba(0,0,0,.05)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={indigo} strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke={indigo} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(24px,6.5vw,30px)", fontWeight: 800,
            letterSpacing: "-.03em", lineHeight: 1.1,
            color: pri, margin: "0 0 8px",
          }}>Welcome back</h1>
          <p style={{
            fontSize: "clamp(13px,3.5vw,15px)", color: sec,
            lineHeight: 1.55, margin: "0 0 32px",
          }}>Sign in to your account to continue.</p>

          {/* Email field */}
          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{
              display: "block", fontSize: 12, fontWeight: 600,
              letterSpacing: .1, color: pri, marginBottom: 7,
            }}>Email</span>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                placeholder="you@company.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 16px 14px 42px",
                  background: dark ? "#1C1C2A" : "#F5F5F9",
                  border: `1.5px solid ${errors.email ? error : border}`,
                  borderRadius: 14, fontSize: 15, color: pri,
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color .15s",
                }}
                onFocus={e => { if (!errors.email) e.target.style.borderColor = indigo; }}
                onBlur={e => { e.target.style.borderColor = errors.email ? error : border; }}
              />
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke={sec} strokeWidth="1.6" />
                <path d="M2 8l10 7 10-7" stroke={sec} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            {errors.email && <p style={{ margin: "6px 0 0", fontSize: 12, color: error }}>{errors.email}</p>}
          </label>

          {/* Password field */}
          <label style={{ display: "block", marginBottom: 28 }}>
            <span style={{
              display: "block", fontSize: 12, fontWeight: 600,
              letterSpacing: .1, color: pri, marginBottom: 7,
            }}>Password</span>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
                placeholder="••••••••"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 44px 14px 42px",
                  background: dark ? "#1C1C2A" : "#F5F5F9",
                  border: `1.5px solid ${errors.password ? error : border}`,
                  borderRadius: 14, fontSize: 15, color: pri,
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color .15s",
                }}
                onFocus={e => { if (!errors.password) e.target.style.borderColor = indigo; }}
                onBlur={e => { e.target.style.borderColor = errors.password ? error : border; }}
              />
              {/* Lock icon */}
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke={sec} strokeWidth="1.6" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke={sec} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {/* Eye toggle */}
              <button onClick={() => setShowPw(s => !s)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: sec, display: "flex",
              }}>
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke={sec} strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke={sec} strokeWidth="1.6" />
                      <circle cx="12" cy="12" r="3" stroke={sec} strokeWidth="1.6" />
                    </svg>
                }
              </button>
            </div>
            {errors.password && <p style={{ margin: "6px 0 0", fontSize: 12, color: error }}>{errors.password}</p>}
          </label>

          {/* Login button */}
          <button
            onPointerDown={() => setScale(.967)}
            onPointerUp={() => { setScale(1); handleLogin(); }}
            onPointerLeave={() => setScale(1)}
            disabled={loading}
            style={{
              width: "100%", height: "clamp(50px,13vw,56px)",
              borderRadius: 16, border: "none", cursor: loading ? "default" : "pointer",
              background: dark ? "rgba(240,240,248,.93)" : "rgba(13,13,26,.88)",
              color: dark ? "#0D0D1A" : "#fff",
              fontSize: 15, fontWeight: 700, letterSpacing: "-.02em",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${scale})`,
              transition: "transform .12s",
              opacity: loading ? 0.7 : 1,
              boxShadow: dark ? "0 2px 20px rgba(255,255,255,.06)" : "0 2px 20px rgba(0,0,0,.08)",
            }}>
            {loading
              ? <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "2px solid currentColor",
                  borderTopColor: "transparent",
                  display: "inline-block",
                  animation: "spin .7s linear infinite",
                }} />
              : "Log In"
            }
          </button>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "20px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span style={{ fontSize: 12, color: sec }}>or</span>
            <div style={{ flex: 1, height: 1, background: border }} />
          </div>

          {/* Sign up link */}
          <button style={{
            width: "100%", height: "clamp(48px,12vw,52px)",
            borderRadius: 16, border: `1px solid ${border}`,
            background: "transparent", cursor: "pointer",
            color: indigo, fontSize: 15, fontWeight: 600, letterSpacing: "-.01em",
            fontFamily: "inherit",
          }}>
            Create an account
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
