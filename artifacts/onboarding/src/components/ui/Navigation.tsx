import { memo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type NavItem =
  | "dashboard"
  | "leave"
  | "analytics"
  | "settings"
  | "notifications";

// ── SSOT nav item list — both sidebar and bottom nav derive from here ───────
// mobileOnly: true → hidden in sidebar (notification bell already in topbar)

const NAV_ITEMS: { id: NavItem; label: string; mobileOnly?: true }[] = [
  { id: "dashboard",     label: "Dashboard"    },
  { id: "leave",         label: "Time & Leave" },
  { id: "analytics",     label: "Analytics"    },
  { id: "settings",      label: "Settings"     },
  { id: "notifications", label: "Alerts",  mobileOnly: true },
];

// ── Icons ───────────────────────────────────────────────────────────────────

function NavIcon({ id }: { id: NavItem }) {
  switch (id) {
    case "dashboard":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      );
    case "leave":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );
    case "analytics":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      );
    case "settings":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
    case "notifications":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
  }
}

// ── Restaurant logo icon ────────────────────────────────────────────────────

export const RestaurantLogo = memo(function RestaurantLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="adm-restaurant-logo">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  );
});

// ── Navigation — Desktop Sidebar + Mobile Bottom Nav ───────────────────────

export const Navigation = memo(function Navigation({
  activeNav,
  onNavChange,
}: {
  activeNav: NavItem;
  onNavChange: (id: NavItem) => void;
}) {
  const sidebarItems = NAV_ITEMS.filter(i => !i.mobileOnly);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="adm-sidebar" aria-label="Sidebar navigation">
        <div className="adm-sidebar-logo">
          <RestaurantLogo size={30} />
          <h1 className="adm-sidebar-brand">MyRestaurant</h1>
        </div>
        <div className="adm-sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`nav-item adm-nav-item${activeNav === item.id ? " adm-nav-active" : ""}`}
              aria-current={activeNav === item.id ? "page" : undefined}
              onClick={() => onNavChange(item.id)}
            >
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="adm-bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item adm-bnav-item${activeNav === item.id ? " adm-bnav-active" : ""}`}
            aria-current={activeNav === item.id ? "page" : undefined}
            onClick={() => onNavChange(item.id)}
          >
            <div className="adm-bnav-icon-wrap">
              <NavIcon id={item.id} />
              {item.id === "notifications" && <span className="adm-bnav-notif-dot" />}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
});
