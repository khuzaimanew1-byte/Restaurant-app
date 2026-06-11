const P = { r: 79, g: 70, b: 229 };

const rgb  = (r: number, g: number, b: number, a = 1) =>
  a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;

const p    = (a: number) => rgb(P.r, P.g, P.b, a);
const pl   = (a: number) => rgb(120, 113, 238, a);

export interface ColorTokens {
  bg:             string;
  text:           string;
  textSub:        string;
  textTer:        string;
  accent:         string;
  accentLight:    string;
  accentBorder:   string;
  accentText:     string;
  fieldBg:        string;
  dotOff:         string;
  chipA:          string;
  chipB:          string;
  chipC:          string;
  radialGlow:     string;
  glassCard:      string;
  glassBorder:    string;
  glassShadow:    string;
  illusText:      string;
  illusTextSub:   string;
  illusBarActive: string;
  illusBarRest:   string;
  illusBadgeText: string;
}

function light(): ColorTokens {
  return {
    bg:             "#F4F4FF",
    text:           "#0D0B1E",
    textSub:        "rgba(13,11,30,0.5)",
    textTer:        "rgba(13,11,30,0.3)",
    accent:         "#4F46E5",
    accentLight:    p(0.07),
    accentBorder:   p(0.18),
    accentText:     "#FFFFFF",
    fieldBg:        p(0.055),
    dotOff:         p(0.18),
    chipA:          p(0.22),
    chipB:          p(0.14),
    chipC:          p(0.1),
    radialGlow:     `radial-gradient(circle,${p(0.14)} 0%,transparent 70%)`,
    glassCard:      `rgba(255,255,255,0.72)`,
    glassBorder:    p(0.1),
    glassShadow:    `0 8px 28px ${p(0.08)}`,
    illusText:      "rgba(13,11,30,0.82)",
    illusTextSub:   "rgba(13,11,30,0.38)",
    illusBarActive: p(0.72),
    illusBarRest:   "rgba(13,11,30,0.1)",
    illusBadgeText: "#4F46E5",
  };
}

function dark(): ColorTokens {
  return {
    bg:             "#08071A",
    text:           "rgba(238,237,255,0.93)",
    textSub:        "rgba(200,197,245,0.45)",
    textTer:        "rgba(200,197,245,0.28)",
    accent:         "#7872F0",
    accentLight:    p(0.18),
    accentBorder:   pl(0.35),
    accentText:     "#FFFFFF",
    fieldBg:        "rgba(255,255,255,0.07)",
    dotOff:         "rgba(238,237,255,0.15)",
    chipA:          p(0.28),
    chipB:          p(0.2),
    chipC:          p(0.14),
    radialGlow:     `radial-gradient(circle,${p(0.18)} 0%,transparent 70%)`,
    glassCard:      `rgba(255,255,255,0.06)`,
    glassBorder:    "rgba(255,255,255,0.1)",
    glassShadow:    "0 8px 32px rgba(0,0,0,0.3)",
    illusText:      "rgba(238,237,255,0.9)",
    illusTextSub:   "rgba(200,197,245,0.4)",
    illusBarActive: pl(0.72),
    illusBarRest:   "rgba(255,255,255,0.13)",
    illusBadgeText: "#A8A3F8",
  };
}

export function getTokens(isDark: boolean): ColorTokens {
  return isDark ? dark() : light();
}
