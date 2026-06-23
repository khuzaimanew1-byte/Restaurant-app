import { useState, useRef, useCallback, useEffect, memo, type RefObject } from "react";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";
import { RestaurantLogo } from "./Navigation";

// ── Avatar dropdown — owned by Topbar, not dashboard ───────────────────────

const AvatarDropdown = memo(function AvatarDropdown({
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  );
});

// ── Topbar — Desktop header + Mobile topbar ────────────────────────────────

export interface TopbarProps {
  today: string;
  /* Search — state lives in dashboard (drives employee filtering) */
  rawQuery: string;
  onQueryChange: (v: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  mobileSearchRef: RefObject<HTMLInputElement | null>;
  mobileSearchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  /* Logout — dashboard owns modal, topbar fires the request */
  onLogoutRequest: () => void;
}

export const Topbar = memo(function Topbar({
  today,
  rawQuery,
  onQueryChange,
  searchRef,
  mobileSearchRef,
  mobileSearchOpen,
  onOpenSearch,
  onCloseSearch,
  onLogoutRequest,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* 220 ms matches CSS exit animation — just enough for dropdown to fade out */
  const shouldRenderDropdown = useDelayedUnmount(dropdownOpen, 220);

  /* Container refs — wrap avatar button + panel so inside-clicks never close */
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef  = useRef<HTMLDivElement>(null);

  const handleLogoutRequest = useCallback(() => {
    setDropdownOpen(false);
    onLogoutRequest();
  }, [onLogoutRequest]);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  /* Outside-click: only active while dropdown is mounted (open + 220ms window) */
  useEffect(() => {
    if (!shouldRenderDropdown) return;
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!desktopDropdownRef.current?.contains(t) && !mobileDropdownRef.current?.contains(t))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [shouldRenderDropdown]);

  return (
    <>
      {/* ── Desktop top header ── */}
      <header className="topbar adm-header">
        <div className="adm-header-left">
          <div className="adm-header-date-row">
            <h2 className="adm-header-date">{today}</h2>
          </div>
        </div>
        <div className="adm-header-right">
          <div className="adm-search-wrap">
            <svg className="adm-search-icon-inner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchRef}
              className="adm-search-input"
              placeholder="Search employees..."
              value={rawQuery}
              autoComplete="off"
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") onQueryChange(""); }}
            />
          </div>
          <button className="adm-notif-btn" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="adm-notif-dot" />
          </button>
          <div className="adm-profile-wrap" ref={desktopDropdownRef}>
            <div
              className={`adm-profile-avatar${dropdownOpen ? " adm-profile-avatar-open" : ""}`}
              onClick={() => setDropdownOpen(v => !v)}
              title="Account"
            >A</div>
            {shouldRenderDropdown && (
              <AvatarDropdown
                isOpen={dropdownOpen}
                onLogoutRequest={handleLogoutRequest}
                onClose={closeDropdown}
              />
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile sticky top bar — .topbar base (index.css) + .adm-topbar overrides ── */}
      <header className="topbar adm-topbar">
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
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") onQueryChange(""); }}
          />
        </div>
        <div className="adm-topbar-actions">
          <button
            className="adm-topbar-toggle"
            onClick={mobileSearchOpen ? onCloseSearch : onOpenSearch}
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
          >
            {mobileSearchOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
          </button>
          <div className="adm-topbar-avatar-wrap" ref={mobileDropdownRef}>
            <button
              className={`adm-topbar-profile${dropdownOpen ? " adm-topbar-profile-open" : ""}`}
              onClick={() => setDropdownOpen(v => !v)}
              aria-label="Account"
            >
              <div className="adm-topbar-profile-avatar">A</div>
            </button>
            {shouldRenderDropdown && (
              <AvatarDropdown
                isOpen={dropdownOpen}
                onLogoutRequest={handleLogoutRequest}
                onClose={closeDropdown}
              />
            )}
          </div>
        </div>
      </header>
    </>
  );
});
