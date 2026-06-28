import { memo, useState } from "react";
import "../../styles/avatar.css";

interface AvatarProps {
  initials: string;
  color:    string;
  img?:     string | null;
  name:     string;
  variant?: "card" | "modal";
}

/** Shared avatar — renders image with text-initials fallback.
    variant="card"  → circle, employee color bg, white initials (monospace)
    variant="modal" → square, dark warm bg, gold initials (Playfair) */
export const Avatar = memo(function Avatar({
  initials, color, img, name, variant = "card",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImg = !!img && !failed;
  return (
    <div
      className={`av av--${variant}`}
      style={variant === "card" ? { backgroundColor: color } : undefined}
    >
      {showImg
        ? <img src={img} alt={name} className="av-img" loading="lazy" onError={() => setFailed(true)} />
        : <span className={`av-initials av-initials--${variant}`}>{initials}</span>
      }
    </div>
  );
});
