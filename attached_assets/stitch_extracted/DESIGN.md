---
name: Zenith HR
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5d5e63'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe4'
  on-secondary-container: '#616267'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1e'
  on-tertiary-container: '#848386'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e2e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1c1f'
  on-secondary-fixed-variant: '#45474b'
  tertiary-fixed: '#e3e2e5'
  tertiary-fixed-dim: '#c7c6c9'
  on-tertiary-fixed: '#1b1b1e'
  on-tertiary-fixed-variant: '#464649'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  row-height: 64px
  container-max-width: 1200px
---

## Brand & Style

The design system is rooted in the "Quiet Luxury" aesthetic—a philosophy that prioritizes intentionality, precision, and high-fidelity restraint. It is designed for enterprise HR environments where clarity and professional calm are paramount. The system moves away from typical SaaS clutter, favoring a sophisticated, Apple-inspired interface that feels more like a premium editorial tool than a traditional database.

The style is **Modern Minimalist with Glassmorphic accents**. It utilizes generous whitespace, subtle translucent layers, and high-contrast typography to create a sense of organized luxury. Every element is stripped to its essential form, using light and depth rather than heavy color to communicate hierarchy.

## Colors

This design system employs a restricted monochrome palette to maintain a calm, professional atmosphere. 

- **Primary & Neutral:** Deep blacks (#1A1A1A) for text and core iconography, paired with a spectrum of soft grays for structural elements.
- **Accents:** Muted, low-saturation tones are used sparingly for functional signaling. 
    - *Muted Blue:* Active states or primary navigation.
    - *Soft Amber:* Pending requests or late arrivals.
    - *Neutral Sage:* Positive attendance or "In-Office" status.
- **Surface Strategy:** Backgrounds should remain neutral (Off-white/light-gray) to allow glassmorphic components to stand out with soft backdrops.

## Typography

The typography system relies on **Geist** for structural elements and **Inter** for readability.

- **Headlines:** Use Geist with tight letter-spacing to achieve a technical, precise appearance.
- **Body:** Use Inter for all data-rich areas (like employee names and timestamps) to ensure maximum legibility at small sizes.
- **Labels:** Small caps with increased tracking (letter-spacing) are reserved for table headers and secondary metadata, providing a refined, institutional feel.
- **Weight:** Avoid 'Bold' weights (700+) except for rare emphasis; favor 'Medium' (500) and 'SemiBold' (600) for hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy with a focus on horizontal density and vertical breathing room.

- **Grid:** Use a 12-column grid for dashboard views, with content centered in a 1200px container.
- **Attendance Rows:** Rows should have a fixed height of 64px to create a consistent rhythmic scan. Padding within rows is generous on the left/right (24px) to emphasize the premium feel.
- **Spacing Scale:** Based on a 4px baseline. Use 16px (md) for most internal component spacing and 40px (xl) for section margins.
- **Responsiveness:** On mobile, rows transition to card-style layouts with increased vertical padding (12px) and simplified metadata.

## Elevation & Depth

Depth is conveyed through a combination of **Glassmorphism** and **Soft Ambient Shadows**.

- **Surfaces:** Main content containers use a 70% opacity white background with a 20px backdrop blur. This creates a frosted glass effect that allows background colors to bleed through subtly.
- **Shadows:** Use extremely diffused, low-opacity shadows (e.g., `box-shadow: 0 4px 24px rgba(0,0,0,0.04)`). Avoid harsh, black shadows.
- **Borders:** Surfaces are defined by 1px solid borders in a very light gray (#E5E5EA) or a semi-transparent white. This "ghost border" technique provides structure without adding visual weight.
- **Layering:** Modals and fly-outs should appear to sit 20-30px "above" the main surface, indicated by an increased blur radius and slightly darker backdrop overlay.

## Shapes

The shape language is sophisticated and modern, using medium-radius rounded corners to soften the technical nature of HR data.

- **Standard Elements:** Buttons, input fields, and cards use a 0.5rem (8px) radius.
- **Large Containers:** Dashboard widgets and main layout containers use a 1rem (16px) radius.
- **Micro-elements:** Status dots and activity rings are perfectly circular (pill-shaped) to provide a geometric counterpoint to the rectangular grid.

## Components

- **Attendance Rows:** The core component. Features a subtle `:hover` state where the background shifts to a 2% black tint. Includes an avatar, name, and a "Live Status" indicator.
- **Live Status Indicator:** A small 6px dot with a gentle CSS pulse animation for "In-Office" employees. Use the Neutral Sage accent.
- **Activity Rings:** For weekly attendance, use 16px diameter thin-stroke rings (1.5px stroke). Use the gray scale to show progress, filling with Muted Blue only when a goal is met.
- **Micro-Progress Bars:** Used for "Shift Completion." 4px height, soft-gray track, with a subtle sage or blue fill. No glow or gradients.
- **Buttons:** "Ghost" style buttons by default (border and text only). Primary buttons use a solid #1A1A1A background with white text, using the 0.5rem roundedness.
- **Search Bar:** A glassmorphic input field with a subtle inner shadow to suggest it is recessed into the header.
- **Chips:** Used for department tags. No background fill—use a 1px soft-gray border and 11px uppercase label-caps typography.