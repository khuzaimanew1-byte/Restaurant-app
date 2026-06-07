/**
 * Design Token System
 * Single source of truth — all colors derived from one primary brand color.
 * Primary: #4F46E5 (Indigo)
 */

const P = { r: 79, g: 70, b: 229 }; // #4F46E5

const rgb  = (r: number, g: number, b: number, a = 1) =>
  a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;

const p    = (a: number) => rgb(P.r, P.g, P.b, a);
const pl   = (a: number) => rgb(120, 113, 238, a); // lighter variant for dark mode
const pd   = (a: number) => rgb(55,  48,  163, a); // darker shade
const pDeep= (a: number) => rgb(30,  27,  75,  a); // deep indigo (dark bg)

export interface ColorTokens {
  bg:            string;
  surface:       string;
  cardBg:        string;
  cardBorder:    string;
  text:          string;
  textSub:       string;
  textTer:       string;
  accent:        string;
  accentHover:   string;
  accentLight:   string;
  accentBorder:  string;
  accentText:    string;
  fieldBg:       string;
  fieldBgFocus:  string;
  separator:     string;
  iconBg:        string;
  iconShadow:    string;
  btnBg:         string;
  btnText:       string;
  focusRing:     string;
  placeholder:   string;
  errorFg:       string;
  errorBorder:   string;
  success:       string;
  successBg:     string;
  shadow:        string;
  overlay:       string;
  dotOn:         string;
  dotOff:        string;
  chipA:         string;
  chipB:         string;
  chipC:         string;
  radialGlow:    string;
  glassCard:     string;
  glassBorder:   string;
  glassShadow:   string;
  illusText:     string;
  illusTextSub:  string;
  illusBarActive:string;
  illusBarRest:  string;
  illusBadge:    string;
  illusBadgeText:string;
}

function light(): ColorTokens {
  return {
    bg:             "#F4F4FF",
    surface:        "#FFFFFF",
    cardBg:         p(0.04),
    cardBorder:     p(0.1),

    text:           "#0D0B1E",
    textSub:        "rgba(13,11,30,0.5)",
    textTer:        "rgba(13,11,30,0.3)",

    accent:         "#4F46E5",
    accentHover:    "#4338CA",
    accentLight:    p(0.07),
    accentBorder:   p(0.18),
    accentText:     "#FFFFFF",

    fieldBg:        p(0.055),
    fieldBgFocus:   p(0.09),

    separator:      p(0.1),
    focusRing:      p(0.4),
    placeholder:    "rgba(13,11,30,0.3)",

    iconBg:         "#FFFFFF",
    iconShadow:     `0 2px 20px ${p(0.14)}`,

    btnBg:          "#0D0B1E",
    btnText:        "#FFFFFF",

    errorFg:        "#DC2626",
    errorBorder:    "rgba(220,38,38,0.4)",

    success:        p(0.9),
    successBg:      p(0.1),

    shadow:         `0 8px 28px ${p(0.1)}`,
    overlay:        p(0.06),

    dotOn:          "#0D0B1E",
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
    illusBadge:     p(0.16),
    illusBadgeText: "#4F46E5",
  };
}

function dark(): ColorTokens {
  return {
    bg:             "#08071A",
    surface:        "#100F26",
    cardBg:         p(0.1),
    cardBorder:     p(0.18),

    text:           "rgba(238,237,255,0.93)",
    textSub:        "rgba(200,197,245,0.45)",
    textTer:        "rgba(200,197,245,0.28)",

    accent:         "#7872F0",
    accentHover:    "#8B85F5",
    accentLight:    p(0.18),
    accentBorder:   pl(0.35),
    accentText:     "#FFFFFF",

    fieldBg:        "rgba(255,255,255,0.07)",
    fieldBgFocus:   "rgba(255,255,255,0.11)",

    separator:      "rgba(255,255,255,0.09)",
    focusRing:      pl(0.5),
    placeholder:    "rgba(200,197,245,0.28)",

    iconBg:         "#1A1838",
    iconShadow:     `0 2px 16px rgba(0,0,0,0.6)`,

    btnBg:          "rgba(238,237,255,0.93)",
    btnText:        "#0D0B2A",

    errorFg:        "#F87171",
    errorBorder:    "rgba(248,113,113,0.4)",

    success:        pl(0.9),
    successBg:      p(0.2),

    shadow:         `0 8px 32px rgba(0,0,0,0.35)`,
    overlay:        pDeep(0.6),

    dotOn:          "rgba(238,237,255,0.86)",
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
    illusBadge:     p(0.22),
    illusBadgeText: "#A8A3F8",
  };
}

export function getTokens(isDark: boolean): ColorTokens {
  return isDark ? dark() : light();
}
