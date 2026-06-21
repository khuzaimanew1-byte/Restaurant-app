import { ReactNode } from "react";

/** Shared primary CTA button — SSOT for all primary action buttons in the app.
 *  Wraps .cta-btn (index.css). Import and use this everywhere instead of
 *  writing <button className="cta-btn"> inline. Never duplicate button styling. */
export function Button({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      className="cta-btn"
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
