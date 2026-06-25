import { useState, ReactNode, RefObject, InputHTMLAttributes } from "react";

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

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  onEnter?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  icon?: ReactNode;
  variant?: "default" | "compact";
};

export function TextInput({
  label, value, onChange, error,
  type = "text", onEnter, onKeyDown, inputRef,
  icon, variant = "default",
  ...rest
}: TextInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onEnter?.();
    onKeyDown?.(e);
  };

  if (variant === "compact") {
    return (
      <div className="ae-fiw">
        {icon}
        <input
          ref={inputRef}
          type={type}
          className="ae-fi"
          value={value}
          placeholder={label}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          {...rest}
        />
      </div>
    );
  }

  return (
    <div className="in-w">
      <div className="in-f">
        <input
          ref={inputRef}
          type={type}
          className={`inp${error ? " in-e" : ""}`}
          value={value}
          placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        <span className="in-l1" aria-hidden="true" />
      </div>
      <label className="in-l">{label}</label>
      {error && <div className="er-t">{error}</div>}
    </div>
  );
}

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
    <div className="in-w">
      <div className="in-f">
        <input
          ref={inputRef}
          type={show ? "text" : "password"}
          className={`inp in-p${error ? " in-e" : ""}`}
          value={value}
          placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onEnter?.(); }}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className="in-l1" aria-hidden="true" />
        <button
          type="button" tabIndex={-1} className="in-e1"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <label className="in-l">{label}</label>
      {error && <div className="er-t">{error}</div>}
    </div>
  );
}

