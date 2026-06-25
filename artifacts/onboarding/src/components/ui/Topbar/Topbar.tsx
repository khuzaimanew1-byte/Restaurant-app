import { useState, useRef, useCallback, useEffect, memo, type RefObject } from "react";
import { useDelayedUnmount } from "../../../hooks/useDelayedUnmount";
import { type NavItem }      from "../Navigation/Navigation";
import { RestaurantLogo } from "../Navigation/Navigation";

const AvatarDropdown = memo(function AvatarDropdown({
  isOpen, onLogoutRequest, onClose,
}: {
  isOpen: boolean;
  onLogoutRequest: () => void;
  onClose: () => void;
}) {
  return (
    <div className="ad-ava" data-closing={!isOpen ? "" : undefined}>
      <div className="ad-dr2">
        <div className="ad-dro">A</div>
        <div className="ad-dr3">
          <span className="ad-dr5">Admin</span>
          <span className="ad-dr6">Administrator</span>
        </div>
      </div>
      <div className="ad-dr1" />
      <button className="ad-dr4"
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

export interface TopbarProps {
  today: string;
  rawQuery: string;
  onQueryChange: (v: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  mobileSearchRef: RefObject<HTMLInputElement | null>;
  mobileSearchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
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

  const shouldRenderDropdown = useDelayedUnmount(dropdownOpen, 220);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef  = useRef<HTMLDivElement>(null);

  const handleLogoutRequest = useCallback(() => {
    setDropdownOpen(false);
    onLogoutRequest();
  }, [onLogoutRequest]);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

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
      <header className="topbar ad-hea">
        <div className="ad-he3">
          <div className="ad-he2">
            <h2 className="ad-he1">{today}</h2>
          </div>
        </div>
        <div className="ad-he4">
          <div className="ad-se2">
            <svg className="ad-sea" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchRef}
              className="ad-se1"
              placeholder="Search employees..."
              value={rawQuery}
              autoComplete="off"
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") onQueryChange(""); }}
            />
          </div>
          <button className="ad-not" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="ad-no1" />
          </button>
          <div className="ad-pr2" ref={desktopDropdownRef}>
            <div
              className={`ad-pro${dropdownOpen ? " ad-pr1" : ""}`}
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

      <header className="topbar ad-top">
        <div className={`ad-to4${mobileSearchOpen ? " ad-to5" : ""}`}>
          <RestaurantLogo size={26} />
          <span className="ad-to3">MyRestaurant</span>
        </div>
        <div className={`ad-to9${mobileSearchOpen ? " ad-to11" : ""}`}>
          <input
            ref={mobileSearchRef}
            className="ad-to10"
            placeholder="Search staff..."
            value={rawQuery}
            autoComplete="off"
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") onQueryChange(""); }}
          />
        </div>
        <div className="ad-to1">
          <button
            className="ad-to12"
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
          <div className="ad-to2" ref={mobileDropdownRef}>
            <button
              className={`ad-to6${dropdownOpen ? " ad-to8" : ""}`}
              onClick={() => setDropdownOpen(v => !v)}
              aria-label="Account"
            >
              <div className="ad-to7">A</div>
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

