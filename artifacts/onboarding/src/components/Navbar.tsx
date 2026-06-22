import { memo } from "react";
import type { RefObject } from "react";
import "../styles/navbar.css";

// ── Types ──────────────────────────────────────────────────────────────────

export type NavItem = "dashboard" | "leave" | "analytics" | "settings" | "notifications";

// ── RestaurantLogo ─────────────────────────────────────────────────────────

const RestaurantLogo = memo(function RestaurantLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="rst-logo" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  );
});

// ── NavIcon ────────────────────────────────────────────────────────────────

function NavIcon({ id }: { id: NavItem }) {
  switch (id) {
    case "dashboard":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      );
    case "leave":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );
    case "analytics":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      );
    case "settings":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 1.7 2.47M4.93 19.07a10 10 0 0 1-1.7-2.47M19.07 19.07a10 10 0 0 0 1.7-2.47M4.93 4.93a10 10 0 0 0-1.7 2.47"/>
        </svg>
      );
    case "notifications":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
  }
}

// ── AvatarDropdown — shared by sidebar (desktop) and mobile topbar ─────────

export const AvatarDropdown = memo(function AvatarDropdown({
  isOpen, onLogoutRequest, onClose,
}: {
  isOpen: boolean;
  onLogoutRequest: () => void;
  onClose: () => void;
}) {
  return (
    <div className="adm-avatar-dropdown" data-closing={!isOpen ? "" : undefined}>
      <div className="adm-dropdown-header">
        <div className="adm-dropdown-avatar">A</div>
        <div className="adm-dropdown-info">
          <span className="adm-dropdown-name">Admin</span>
          <span className="adm-dropdown-role">Administrator</span>
        </div>
      </div>
      <div className="adm-dropdown-divider" />
      <button className="adm-dropdown-logout"
        onClick={() => { onClose(); onLogoutRequest(); }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  );
});

// ── Nav item lists ─────────────────────────────────────────────────────────

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "dashboard",  label: "Dashboard"    },
  { id: "leave",      label: "Time & Leave" },
  { id: "analytics",  label: "Analytics"    },
  { id: "settings",   label: "Settings"     },
];

const BOTTOM_NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "leave",         label: "Time"      },
  { id: "notifications", label: "Alerts"    },
  { id: "analytics",     label: "Analytics" },
  { id: "settings",      label: "Settings"  },
];

// ── Navbar ─────────────────────────────────────────────────────────────────

export const Navbar = memo(function Navbar({
  activeNav, onNavChange,
  dropdownOpen, onDropdownToggle, onDropdownClose,
  mobileSearchOpen, rawQuery, onSearchChange, onSearchOpen, onSearchClose,
  mobileSearchRef, mobileDropdownRef,
  onLogoutRequest,
  shouldRenderDropdown,
}: {
  activeNav: NavItem;
  onNavChange: (id: NavItem) => void;
  dropdownOpen: boolean;
  onDropdownToggle: () => void;
  onDropdownClose: () => void;
  mobileSearchOpen: boolean;
  rawQuery: string;
  onSearchChange: (q: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  mobileSearchRef: RefObject<HTMLInputElement | null>;
  mobileDropdownRef: RefObject<HTMLDivElement | null>;
  onLogoutRequest: () => void;
  shouldRenderDropdown: boolean;
}) {
  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <nav className="adm-sidebar" aria-label="Main navigation">
        <div className="adm-sidebar-logo">
          <RestaurantLogo size={30} />
          <h1 className="adm-sidebar-brand">MyRestaurant</h1>
        </div>
        <div className="adm-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`adm-nav-item${activeNav === item.id ? " adm-nav-active" : ""}`}
              onClick={() => onNavChange(item.id)}
              aria-current={activeNav === item.id ? "page" : undefined}>
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <footer className="adm-sidebar-footer">
          <button className="adm-sidebar-logout" onClick={onLogoutRequest} aria-label="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </footer>
      </nav>

      {/* ── Mobile Topbar ── */}
      <header className="topbar" role="banner">
        <div className={`adm-topbar-logo${mobileSearchOpen ? " adm-topbar-logo-hide" : ""}`}>
          <RestaurantLogo size={26} />
          <span className="adm-topbar-brand">MyRestaurant</span>
        </div>
        <div className={`adm-topbar-search${mobileSearchOpen ? " adm-topbar-search-open" : ""}`}>
          <input
            ref={mobileSearchRef}
            className="adm-topbar-search-input"
            placeholder="Search staff..."
            value={rawQuery}
            autoComplete="off"
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") { onSearchChange(""); onSearchClose(); } }}
            aria-label="Search employees"
          />
        </div>
        <div className="adm-topbar-actions">
          <button className="adm-topbar-toggle"
            onClick={mobileSearchOpen ? onSearchClose : onSearchOpen}
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}>
            {mobileSearchOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
          </button>
          <div className="adm-topbar-avatar-wrap" ref={mobileDropdownRef}>
            <button
              className={`adm-topbar-profile${dropdownOpen ? " adm-topbar-profile-open" : ""}`}
              onClick={onDropdownToggle}
              aria-label="Account menu"
              aria-expanded={dropdownOpen}>
              <div className="adm-topbar-profile-avatar">A</div>
            </button>
            {shouldRenderDropdown && (
              <AvatarDropdown
                isOpen={dropdownOpen}
                onLogoutRequest={onLogoutRequest}
                onClose={onDropdownClose}
              />
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bnav" aria-label="Site navigation">
        {BOTTOM_NAV_ITEMS.map(item => (
          <button key={item.id}
            className={`bn-i${activeNav === item.id ? " bn-a" : ""}`}
            onClick={() => onNavChange(item.id)}
            aria-current={activeNav === item.id ? "page" : undefined}
            aria-label={item.label}>
            <div className="bn-ico">
              <NavIcon id={item.id} />
              {item.id === "notifications" && <span className="bn-dot" />}
            </div>
            <span aria-hidden="true">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
});
