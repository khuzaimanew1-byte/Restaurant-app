import { useState, RefObject, InputHTMLAttributes } from "react";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── TextInput ─────────────────────────────────────────────────────────────
/** Shared text input with floating label + amber underline animation.
 *  SSOT: wraps .inp-wrap / .inp-field / .inp / .inp-label / .inp-line (index.css).
 *  Import and reuse for every plain text/email/tel field across the app.
 *  Accepts all native <input> attributes via spread (maxLength, inputMode, etc.). */
type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  onEnter?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function TextInput({
  label, value, onChange, error,
  type = "text", onEnter, onKeyDown, inputRef, ...rest
}: TextInputProps) {
  return (
    <div className="inp-wrap">
      <div className="inp-field">
        <input
          ref={inputRef}
          type={type}
          className={`inp${error ? " inp--error" : ""}`}
          value={value}
          placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") onEnter?.();
            onKeyDown?.(e);
          }}
          {...rest}
        />
        <span className="inp-line" aria-hidden="true" />
      </div>
      <label className="inp-label">{label}</label>
      {error && <div className="err-text">{error}</div>}
    </div>
  );
}

// ── PasswordInput ─────────────────────────────────────────────────────────
/** Shared password input with show/hide toggle.
 *  SSOT: same .inp-wrap pattern + .inp-eye button (index.css).
 *  Import and reuse for every password field across the app. */
export function PasswordInput({
  label, value, onChange, error,
  autoComplete = "current-password", onEnter, inputRef,
}: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; autoComplete?: string; onEnter?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="inp-wrap">
      <div className="inp-field">
        <input
          ref={inputRef}
          type={show ? "text" : "password"}
          className={`inp inp--pw${error ? " inp--error" : ""}`}
          value={value}
          placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onEnter?.(); }}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className="inp-line" aria-hidden="true" />
        <button
          type="button" tabIndex={-1} className="inp-eye"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <label className="inp-label">{label}</label>
      {error && <div className="err-text">{error}</div>}
    </div>
  );
}
