import { useState, useEffect } from "react";

const C = {
  indigo:      "#6366F1",
  indigoLight: "#818CF8",
  error:       "#EF4444",
  emerald:     "#10B981",
};

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

function Field({
  label, type = "text", value, onChange, placeholder, error,
  hint, dark, border, pri, sec, muted,
  suffix,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  error?: string; hint?: string;
  dark: boolean; border: string; pri: string; sec: string; muted: string;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const bColor = error ? C.error : focused ? C.indigo : border;
  const bg = dark ? "#0F0F1E" : "#F8F8FC";

  return (
    <div style={{ marginBottom: error ? 4 : 18 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, letterSpacing: .3,
        textTransform: "uppercase", color: sec, marginBottom: 8,
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box",
            height: 52,
            padding: suffix ? "0 48px 0 16px" : "0 16px",
            background: bg,
            border: `1.5px solid ${bColor}`,
            borderRadius: 12, fontSize: 15,
            color: pri, outline: "none", fontFamily: "inherit",
            transition: "border-color .18s, box-shadow .18s",
            boxShadow: focused ? `0 0 0 3px ${C.indigo}22` : "none",
          }}
        />
        {suffix && (
          <div style={{
            position: "absolute", right: 0, top: 0, height: "100%",
            display: "flex", alignItems: "center", paddingRight: 14,
          }}>{suffix}</div>
        )}
      </div>
      {error && (
        <p style={{
          margin: "6px 0 10px", fontSize: 12, color: C.error,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={C.error} strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}
      {!error && hint && (
        <p style={{ margin: "5px 0 0", fontSize: 11, color: muted }}>{hint}</p>
      )}
    </div>
  );
}

function EyeToggle({ show, onToggle, sec }: { show: boolean; onToggle: () => void; sec: string }) {
  return (
    <button type="button" onClick={onToggle} style={{
      background: "none", border: "none", cursor: "pointer",
      padding: 4, color: sec, display: "flex", lineHeight: 1,
    }}>
      {show
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke={sec} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke={sec} strokeWidth="1.8"/>
            <circle cx="12" cy="12" r="3" stroke={sec} strokeWidth="1.8"/>
          </svg>
      }
    </button>
  );
}

/* ── Password strength ─────────────────────────────────────────────── */
function PasswordStrength({ password, muted }: { password: string; muted: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors   = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"];
  const labels   = ["", "Weak", "Fair", "Fair", "Strong", "Very strong"];

  if (!password) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= strength ? colors[strength] : muted,
            transition: "background .3s",
          }} />
        ))}
      </div>
      {strength > 0 && (
        <p style={{ margin: 0, fontSize: 11, color: colors[strength], fontWeight: 500 }}>
          {labels[strength]} password
        </p>
      )}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────────── */
export function SignupPage({ onBack }: { onBack?: () => void }) {
  const [dark, setDark]   = useDark();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [btnScale, setBtnScale]   = useState(1);
  const [entered, setEntered]     = useState(false);
  const [agreed, setAgreed]       = useState(false);

  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);

  const bg      = dark ? "#080810" : "#F2F2F7";
  const surface = dark ? "#12121E" : "#FFFFFF";
  const border  = dark ? "#252538" : "#E2E2EC";
  const pri     = dark ? "#EEEEF8" : "#0A0A18";
  const sec     = dark ? "#7070A0" : "#6868A0";
  const muted   = dark ? "#3A3A58" : "#C8C8DC";

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Work email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Must be at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    if (!agreed) e.agreed = "You must accept the terms to continue.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
  }

  return (
    <div style={{
      width: "100vw", minHeight: "100dvh", background: bg,
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      display: "flex", flexDirection: "column",
      opacity: entered ? 1 : 0,
      transform: entered ? "none" : "translateY(20px)",
      transition: "opacity .45s cubic-bezier(.22,1,.36,1), transform .45s cubic-bezier(.22,1,.36,1)",
    }}>

      {/* ── Nav ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px clamp(20px,5vw,32px)",
        position: "sticky", top: 0, zIndex: 10,
        backdropFilter: "blur(24px)",
        background: dark ? "rgba(8,8,16,.7)" : "rgba(242,242,247,.7)",
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"}`,
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          color: sec, fontSize: 14, fontWeight: 500, padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Login
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.indigo}, #818CF8)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8"/>
              <path d="M12 7v5l3 2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-.02em", color: pri }}>
            Attendance
          </span>
        </div>

        <button onClick={() => setDark(d => !d)} style={{
          width: 32, height: 32, borderRadius: "50%",
          background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill={sec}/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={sec} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={sec}/>
              </svg>
          }
        </button>
      </nav>

      {/* ── Content ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "clamp(24px,5vw,48px) clamp(20px,5vw,24px) 40px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Notice banner */}
          <div style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            background: `${C.indigo}12`,
            border: `1px solid ${C.indigo}25`,
            borderRadius: 14, padding: "14px 16px", marginBottom: 28,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: `${C.indigo}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={C.indigo} strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke={C.indigo} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.indigo }}>
                Invite-only registration
              </p>
              <p style={{ margin: 0, fontSize: 12, color: sec, lineHeight: 1.5 }}>
                Only emails pre-registered by your administrator can create an account.
              </p>
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontSize: "clamp(24px,6.5vw,30px)", fontWeight: 800,
              letterSpacing: "-.04em", lineHeight: 1.1,
              color: pri, margin: "0 0 8px",
            }}>Create your account</h1>
            <p style={{ fontSize: 15, color: sec, lineHeight: 1.6, margin: 0 }}>
              Set up your employee profile to get started.
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "clamp(24px,6vw,32px)",
            boxShadow: dark
              ? "0 4px 48px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.04) inset"
              : "0 4px 32px rgba(0,0,0,.06), 0 1px 0 rgba(255,255,255,.8) inset",
            marginBottom: 16,
          }}>
            <Field
              label="Work email"
              type="email"
              value={email}
              onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: "" })); }}
              placeholder="your.name@company.com"
              error={errors.email}
              hint="Must match the email your admin registered"
              dark={dark} border={border} pri={pri} sec={sec} muted={muted}
            />

            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: "" })); }}
              placeholder="Min. 8 characters"
              error={errors.password}
              dark={dark} border={border} pri={pri} sec={sec} muted={muted}
              suffix={<EyeToggle show={showPw} onToggle={() => setShowPw(s => !s)} sec={sec} />}
            />

            <PasswordStrength password={password} muted={muted} />

            <Field
              label="Confirm password"
              type={showCf ? "text" : "password"}
              value={confirm}
              onChange={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: "" })); }}
              placeholder="Re-enter password"
              error={errors.confirm}
              dark={dark} border={border} pri={pri} sec={sec} muted={muted}
              suffix={<EyeToggle show={showCf} onToggle={() => setShowCf(s => !s)} sec={sec} />}
            />

            {/* Terms checkbox */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
              }}>
                <div
                  onClick={() => { setAgreed(a => !a); setErrors(e => ({ ...e, agreed: "" })); }}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    background: agreed ? C.indigo : "transparent",
                    border: `2px solid ${errors.agreed ? C.error : agreed ? C.indigo : border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s", cursor: "pointer",
                  }}>
                  {agreed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: sec, lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <span style={{ color: C.indigo, fontWeight: 600, cursor: "pointer" }}>Terms of Service</span>
                  {" "}and{" "}
                  <span style={{ color: C.indigo, fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>
                </span>
              </label>
              {errors.agreed && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: C.error }}>{errors.agreed}</p>
              )}
            </div>

            {/* Submit */}
            <button
              onPointerDown={() => setBtnScale(.97)}
              onPointerUp={() => { setBtnScale(1); handleSignup(); }}
              onPointerLeave={() => setBtnScale(1)}
              disabled={loading}
              style={{
                width: "100%", height: 52, borderRadius: 14,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: `linear-gradient(135deg, ${C.indigo}, #818CF8)`,
                color: "#fff", fontSize: 15, fontWeight: 700,
                letterSpacing: "-.02em", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${btnScale})`,
                transition: "transform .12s",
                opacity: loading ? 0.8 : 1,
                boxShadow: `0 4px 20px ${C.indigo}44, 0 1px 0 rgba(255,255,255,.15) inset`,
              }}>
              {loading
                ? <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "2.5px solid rgba(255,255,255,.4)",
                    borderTopColor: "#fff",
                    display: "inline-block",
                    animation: "spin .7s linear infinite",
                  }} />
                : "Create Account"
              }
            </button>
          </div>

          {/* Back to login */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 14, color: sec }}>Already have an account? </span>
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: C.indigo, fontWeight: 700, padding: 0, fontFamily: "inherit",
            }}>Sign in →</button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 24px", textAlign: "center",
        borderTop: `1px solid ${dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"}`,
      }}>
        <p style={{ fontSize: 12, color: muted, margin: 0 }}>
          © 2025 Attendance App · Secure Employee Portal
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${muted}; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px ${dark ? "#0F0F1E" : "#F8F8FC"} inset !important;
          -webkit-text-fill-color: ${pri} !important;
        }
      `}</style>
    </div>
  );
}
