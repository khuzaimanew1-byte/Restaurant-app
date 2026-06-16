import { useState, useRef, useCallback, useEffect } from "react";

type Status = "in" | "out" | "late" | "leave" | "leave-denied";
type NavItem = "dashboard" | "leave" | "analytics" | "settings" | "notifications";

interface Employee {
  id: number;
  name: string;
  role: string;
  salary: string;
  checkIn: string;
  checkOut: string;
  status: Status;
  att: number;
  perf: number;
  avatar: string;
  initials: string;
  color: string;
}

const EMPLOYEES: Employee[] = [
  {
    id: 1, name: "Alex Rivera", role: "Senior Developer", salary: "$4,500/mo",
    checkIn: "08:45 AM", checkOut: "--:--", status: "in", att: 80, perf: 60,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1bgJ9ObEX7Vmu2iodeu7ANsiyGaq3QqIV4cWRXrFs7iNvfixN5Pi1Bd0quN2nwqIw47xRZYRE_WzrWhIpY95KrALTGanCnM79dPhYaNbEntw6yMmqhc9yPEQMeBjjQL83NbIEAJdYjx18JZ_I7VSjZ2Rocv6HMa4IZ4yZdzdiCaRFiW5bxwaFqVEJSHL1CiynOn7vyhIM7-bWKBHQ13pcg-OGh7iAVXOyZkHm8muL1o5y52Qi9RRVShyLSHtedEfxYYYqjvqGnHMJ",
    initials: "AR", color: "#3B5BDB",
  },
  {
    id: 2, name: "Sarah Chen", role: "UX Designer", salary: "$5,200/mo",
    checkIn: "09:00 AM", checkOut: "05:30 PM", status: "out", att: 80, perf: 80,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    initials: "SC", color: "#E64980",
  },
  {
    id: 3, name: "James Wilson", role: "Product Manager", salary: "$8,000/mo",
    checkIn: "08:45 AM", checkOut: "--:--", status: "late", att: 80, perf: 60,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGR-7KzB18GmbpFkcXIIJMyEUWFY775MUOd3in9mdiC64fEbW2izZElN0zMWzbAIMH_NbyLfMBMSbHw9m2538zMnueCnlKR0jPgxCp1uo9XxImLja5La8-39M4tkLlG4qH0R_wKpN1p-GDAFAugZCssgOZi2wTYqSfw3feLrw21TKm4rFZPPGWzQRyt6qt6cHUcnXNo5WvVJdiov02YET-3LvBWRQzTe3eu4wG-XzRXj1rfZ6xxMjaoyVN_XrVjQVLTPfhNp7ovBw6",
    initials: "JW", color: "#7048E8",
  },
  {
    id: 4, name: "Elena Rodriguez", role: "Data Analyst", salary: "$3,300/mo",
    checkIn: "--:--", checkOut: "--:--", status: "leave", att: 90, perf: 80,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVk__1uWGE-_CAuEpIOAUKhi20HsF9WuN6Qx7TL9YYdcJVifaE1Jc_jTe-zfvjWK6DYPwnbK17Wikld6ZBfkESaJ_7FS3OQdmeM-mQgsmySemoJrnvtmCU7jz-XIdRCCIiPVRUvxEwVOP6MFN8q1Z26T5LgcEa8cl24Y48c7cblxVTXtI651wkF7h6ePBkaFDUdtMgDNPdPOc3IM4_3p9rLjIKyoyt6Tgz1_G49HYO9UwrDN9QJkykxr26tYr4Z7HtBles9yVUY4x",
    initials: "ER", color: "#2B8A3E",
  },
  {
    id: 5, name: "Michael Chang", role: "Sous Chef", salary: "$4,800/mo",
    checkIn: "--:--", checkOut: "--:--", status: "leave-denied", att: 95, perf: 85,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLTNppDitBL-LUEeaxBCqc0mH7i9QNK5oXjv0WIk341piN1t1jbHb_IiDU04tNJXpFJovS2b8M761eF09xTFFthfLHinU7eKP65ofovLvikYSEaSPFseO02sWYQYARhRoo15vG0yN0jewg5gcaa4fxf_-cBnElNRwmC-4YfqjKa4FVucFFkp18q_EIMojqUWDtPykXs7ZeaGL_RSlhAx2Jywp_otPpLFm3B-H1sXV4W6-Cc3RxMQQeW07COmY1OMZQf-BYyLCBrNKo",
    initials: "MC", color: "#C92A2A",
  },
  {
    id: 6, name: "Olivia Smith", role: "Restaurant Manager", salary: "$6,000/mo",
    checkIn: "07:30 AM", checkOut: "--:--", status: "in", att: 100, perf: 90,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    initials: "OS", color: "#1098AD",
  },
];

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "leave",         label: "Leave" },
  { id: "analytics",     label: "Analytics" },
  { id: "settings",      label: "Settings" },
];

const BOTTOM_NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "leave",         label: "Leave" },
  { id: "notifications", label: "Alerts" },
  { id: "analytics",     label: "Analytics" },
  { id: "settings",      label: "Settings" },
];

function getTodayStr() {
  const d = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function getStatusDotClass(s: Status) {
  switch (s) {
    case "in":           return "adm-dot adm-dot-green adm-dot-pulse";
    case "out":          return "adm-dot adm-dot-red";
    case "late":         return "adm-dot adm-dot-orange";
    case "leave":        return "adm-dot adm-dot-grey";
    case "leave-denied": return "adm-dot adm-dot-red";
  }
}

function AvatarImg({ emp }: { emp: Employee }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="adm-avatar-fallback" style={{ backgroundColor: emp.color }}>
        {emp.initials}
      </div>
    );
  }
  return (
    <img
      src={emp.avatar}
      alt={emp.name}
      className="adm-avatar-img"
      onError={() => setFailed(true)}
    />
  );
}

function ProgressBar({ value, color, glow }: { value: number; color: string; glow: string }) {
  return (
    <div className="adm-progress-track">
      <div
        className="adm-progress-fill"
        style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 8px ${glow}` } as React.CSSProperties}
      />
    </div>
  );
}

function EmployeeCard({ emp, idx }: { emp: Employee; idx: number }) {
  const isAbsent = emp.status === "leave" || emp.status === "leave-denied";
  return (
    <div
      className={`adm-card${isAbsent ? " adm-card-absent" : ""}`}
      style={{ animationDelay: `${idx * 70}ms` } as React.CSSProperties}
    >
      <div className="adm-card-left">
        <div className="adm-avatar-wrap">
          <AvatarImg emp={emp} />
          <span className={getStatusDotClass(emp.status)} />
        </div>
        <div className="adm-card-info">
          <h3 className="adm-card-name">{emp.name}</h3>
          <p className="adm-card-role">{emp.role}</p>
          <p className="adm-card-salary">{emp.salary}</p>
          {emp.status === "leave" ? (
            <div className="adm-leave-badge">
              LEAVE
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="3" y1="3" x2="21" y2="21"/>
              </svg>
            </div>
          ) : emp.status === "leave-denied" ? (
            <div className="adm-leave-denied-badge">LEAVE NOT APPROVED</div>
          ) : (
            <div className="adm-times">
              <span className="adm-time-in">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                {emp.checkIn}
              </span>
              <span className="adm-time-out">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 11 12 16 7"/><line x1="11" y1="12" x2="21" y2="12"/>
                </svg>
                {emp.checkOut}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="adm-card-right">
        <button className="adm-info-btn" aria-label="Info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
        <div className={`adm-bars${isAbsent ? " adm-bars-muted" : ""}`}>
          <div className="adm-bar-row">
            <div className="adm-bar-labels"><span>ATT</span><span>{emp.att}%</span></div>
            <ProgressBar value={emp.att} color="#E5E2E1" glow="rgba(229,226,225,0.3)" />
          </div>
          <div className="adm-bar-row">
            <div className="adm-bar-labels"><span>PERF</span><span>{emp.perf}%</span></div>
            <ProgressBar value={emp.perf} color="#D4AF37" glow="rgba(212,175,55,0.4)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ id }: { id: NavItem }) {
  switch (id) {
    case "dashboard":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      );
    case "leave":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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

function RestaurantLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4AF37" }}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  );
}

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-modal-overlay" onClick={onCancel}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h3 className="adm-modal-title">Sign out?</h3>
        <p className="adm-modal-body">You'll need to sign in again to access the dashboard.</p>
        <div className="adm-modal-actions">
          <button className="adm-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="adm-modal-confirm" onClick={onConfirm}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function AvatarDropdown({ onLogoutRequest, onClose }: { onLogoutRequest: () => void; onClose: () => void }) {
  return (
    <div className="adm-avatar-dropdown">
      <div className="adm-dropdown-header">
        <div className="adm-dropdown-avatar">A</div>
        <div className="adm-dropdown-info">
          <span className="adm-dropdown-name">Admin</span>
          <span className="adm-dropdown-role">Administrator</span>
        </div>
      </div>
      <div className="adm-dropdown-divider" />
      <button
        className="adm-dropdown-logout"
        onClick={() => { onClose(); onLogoutRequest(); }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  );
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeNav, setActiveNav]           = useState<NavItem>("dashboard");
  const [searchQuery, setSearchQuery]       = useState("");
  const [mobileSearchOpen, setMobileSearch] = useState(false);
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [logoutModalOpen, setLogoutModal]   = useState(false);
  const searchRef                           = useRef<HTMLInputElement>(null);
  const dropdownRef                         = useRef<HTMLDivElement>(null);

  const today        = getTodayStr();
  const presentCount = EMPLOYEES.filter(e => e.status === "in").length;
  const totalCount   = EMPLOYEES.length;

  const filtered = searchQuery.trim()
    ? EMPLOYEES.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : EMPLOYEES;

  const openSearch = useCallback(() => {
    setMobileSearch(true);
    setTimeout(() => searchRef.current?.focus(), 300);
  }, []);

  const closeSearch = useCallback(() => {
    setMobileSearch(false);
    setSearchQuery("");
  }, []);

  const requestLogout = useCallback(() => {
    setDropdownOpen(false);
    setLogoutModal(true);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <div className="adm-root">

      {/* ── Desktop Sidebar ── */}
      <nav className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <RestaurantLogo size={30} />
          <h1 className="adm-sidebar-brand">MyRestaurant</h1>
        </div>

        <div className="adm-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`adm-nav-item${activeNav === item.id ? " adm-nav-active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="adm-main">

        {/* Desktop top header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <h2 className="adm-header-date">{today}</h2>
            <div className="adm-header-stats">
              <span className="adm-stat-chip adm-stat-present">
                Present:&nbsp;<strong>{presentCount}</strong>
              </span>
              <span className="adm-stat-chip">Total: {totalCount}</span>
            </div>
          </div>

          <div className="adm-header-right">
            <div className="adm-search-wrap">
              <svg className="adm-search-icon-inner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="adm-search-input"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="adm-notif-btn" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="adm-notif-dot" />
            </button>

            <div className="adm-profile-wrap" ref={dropdownRef}>
              <div
                className={`adm-profile-avatar${dropdownOpen ? " adm-profile-avatar-open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)}
                title="Account"
              >A</div>
              {dropdownOpen && (
                <AvatarDropdown
                  onLogoutRequest={requestLogout}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        {/* ── Mobile sticky top bar ── */}
        <header className="adm-topbar">
          <div className={`adm-topbar-logo${mobileSearchOpen ? " adm-topbar-logo-hide" : ""}`}>
            <RestaurantLogo size={26} />
            <span className="adm-topbar-brand">MyRestaurant</span>
          </div>

          <div className={`adm-topbar-search${mobileSearchOpen ? " adm-topbar-search-open" : ""}`}>
            <input
              ref={searchRef}
              className="adm-topbar-search-input"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="adm-topbar-actions">
            <button
              className="adm-topbar-toggle"
              onClick={mobileSearchOpen ? closeSearch : openSearch}
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

            <div className="adm-topbar-avatar-wrap" ref={dropdownRef as React.RefObject<HTMLDivElement>}>
              <button
                className={`adm-topbar-profile${dropdownOpen ? " adm-topbar-profile-open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)}
                aria-label="Account"
              >
                <div className="adm-topbar-profile-avatar">A</div>
              </button>
              {dropdownOpen && (
                <AvatarDropdown
                  onLogoutRequest={requestLogout}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        {/* Mobile stats row */}
        <div className="adm-mobile-stats">
          <div>
            <h2 className="adm-mobile-date">{today}</h2>
            <span className="adm-mobile-chip">Present: {presentCount}</span>
          </div>
          <span className="adm-mobile-total">Total: {totalCount}</span>
        </div>

        {/* ── Employee grid ── */}
        <div className="adm-content">
          {filtered.length === 0 ? (
            <div className="adm-empty">No employees match your search.</div>
          ) : (
            <div className="adm-grid">
              {filtered.map((emp, i) => (
                <EmployeeCard key={emp.id} emp={emp} idx={i} />
              ))}
            </div>
          )}
        </div>

        {/* FAB — mobile only */}
        <button className="adm-fab" aria-label="Add">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Bottom nav — mobile only */}
        <nav className="adm-bottom-nav">
          {BOTTOM_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`adm-bnav-item${activeNav === item.id ? " adm-bnav-active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <div className="adm-bnav-icon-wrap">
                <NavIcon id={item.id} />
                {item.id === "notifications" && <span className="adm-bnav-notif-dot" />}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

      </main>

      {/* Logout confirmation modal */}
      {logoutModalOpen && (
        <LogoutModal
          onConfirm={onLogout}
          onCancel={() => setLogoutModal(false)}
        />
      )}
    </div>
  );
}
