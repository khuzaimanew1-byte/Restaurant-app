import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Icons ─────────────────────────────────────────────────── */

function IcoUtensils() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h1v6a1 1 0 0 0 2 0v-6h1a2 2 0 0 0 2-2 6 6 0 0 0-3-5.2"/>
    </svg>
  );
}

function IcoSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

function IcoBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );
}

function IcoGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  );
}

function IcoCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}

function IcoBarChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10"/>
      <line x1="18" x2="18" y1="20" y2="4"/>
      <line x1="6"  x2="6"  y1="20" y2="16"/>
    </svg>
  );
}

function IcoAlertCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  );
}

function IcoSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IcoClock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IcoPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" x2="12" y1="5" y2="19"/>
      <line x1="5"  x2="19" y1="12" y2="12"/>
    </svg>
  );
}

function IcoX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

/* ─── Data ──────────────────────────────────────────────────── */

type Status = "present" | "leave" | "denied";

interface Employee {
  id:       number;
  name:     string;
  role:     string;
  salary:   string;
  checkIn:  string;
  checkOut?: string;
  status:   Status;
  att:      number;
  perf:     number;
  initials: string;
  color:    string;
}

const EMPLOYEES: Employee[] = [
  { id:1, name:"Alex Rivera",     role:"Senior Developer",  salary:"$4,500/mo", checkIn:"00:48 AM",                     status:"present", att:99.14, perf:96.8, initials:"AR", color:"#3A5E8C" },
  { id:2, name:"Sarah Chen",      role:"UX Designer",       salary:"$5,200/mo", checkIn:"09:00 AM", checkOut:"05:30 PM", status:"present", att:99.14, perf:98.2, initials:"SC", color:"#6B3D8A" },
  { id:3, name:"James Wilson",    role:"Product Manager",   salary:"$8,000/mo", checkIn:"09:45 AM",                     status:"present", att:99.14, perf:97.5, initials:"JW", color:"#2A6A48" },
  { id:4, name:"Elena Rodriguez", role:"Data Analyst",      salary:"$3,300/mo", checkIn:"",                             status:"leave",   att:99.14, perf:94.1, initials:"ER", color:"#8A6220" },
  { id:5, name:"Michael Chang",   role:"Head Chef",         salary:"$7,000/mo", checkIn:"",                             status:"denied",  att:88.40, perf:91.3, initials:"MC", color:"#8A2A2A" },
  { id:6, name:"Olivia Smith",    role:"Sous Chef",         salary:"$4,200/mo", checkIn:"09:28 AM",                     status:"present", att:99.14, perf:95.7, initials:"OS", color:"#7A5A1A" },
];

type NavTab = "dashboard" | "leaves" | "analytics" | "alerts" | "settings";

interface NavItem { id: NavTab; label: string; icon: React.ReactNode }

const SIDE_NAV: NavItem[] = [
  { id:"dashboard", label:"Dashboard", icon:<IcoGrid /> },
  { id:"leaves",    label:"Leaves",    icon:<IcoCalendar /> },
  { id:"analytics", label:"Analytics", icon:<IcoBarChart /> },
  { id:"settings",  label:"Settings",  icon:<IcoSettings /> },
];

const BOTTOM_NAV: NavItem[] = [
  { id:"dashboard", label:"Dashboard", icon:<IcoGrid /> },
  { id:"leaves",    label:"Leaves",    icon:<IcoCalendar /> },
  { id:"analytics", label:"Analytics", icon:<IcoBarChart /> },
  { id:"alerts",    label:"Alerts",    icon:<IcoAlertCircle /> },
  { id:"settings",  label:"Settings",  icon:<IcoSettings /> },
];

/* ─── Employee Card ─────────────────────────────────────────── */

function EmployeeCard({ emp }: { emp: Employee }) {
  const dotCls = emp.status === "present" ? "present" : emp.status === "leave" ? "leave" : "denied";
  return (
    <div className="adm-card">
      <div className="adm-card__av-wrap">
        <div className="adm-card__av" style={{ background: emp.color } as React.CSSProperties}>
          {emp.initials}
        </div>
        <span className={`adm-card__dot ${dotCls}`} />
      </div>

      <div className="adm-card__info">
        <p className="adm-card__name">{emp.name}</p>
        <p className="adm-card__role">{emp.role}</p>
        <p className="adm-card__salary">{emp.salary}</p>
        {emp.status === "present" && (
          <p className="adm-card__time">
            <IcoClock />
            {emp.checkOut ? `${emp.checkIn} to ${emp.checkOut}` : emp.checkIn}
          </p>
        )}
        {emp.status === "leave"  && <p className="adm-card__time adm-card__time--leave">Leave 🏖</p>}
        {emp.status === "denied" && <p className="adm-card__time adm-card__time--denied">Leave: Not Approved</p>}
      </div>

      <div className="adm-card__metrics">
        <div className="adm-card__metric">
          <div className="adm-card__mrow">
            <span className="adm-card__mlabel">ATT</span>
            <span className="adm-card__mval">{emp.att}</span>
          </div>
          <div className="adm-card__track">
            <div className="adm-card__fill" style={{ width: `${emp.att}%` } as React.CSSProperties} />
          </div>
        </div>
        <div className="adm-card__metric">
          <div className="adm-card__mrow">
            <span className="adm-card__mlabel">PERF</span>
            <span className="adm-card__mval">{emp.perf}</span>
          </div>
          <div className="adm-card__track">
            <div className="adm-card__fill adm-card__fill--perf" style={{ width: `${emp.perf}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AdminDashboard ────────────────────────────────────────── */

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab]             = useState<NavTab>("dashboard");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]         = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const searchRef   = useRef<HTMLInputElement>(null);
  const logoutRef   = useRef<HTMLDivElement>(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 60);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!showLogout) return;
    const handle = (e: MouseEvent) => {
      if (logoutRef.current && !logoutRef.current.contains(e.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showLogout]);

  const filtered = query
    ? EMPLOYEES.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase())
      )
    : EMPLOYEES;

  return (
    <div className="adm">

      {/* ── Sidebar (tablet +) ─────────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <span className="adm-logo__icon"><IcoUtensils /></span>
          <span className="adm-logo__text">MyRestaurant</span>
        </div>
        <nav className="adm-sidenav">
          {SIDE_NAV.map(n => (
            <button
              key={n.id}
              className={`adm-sidenav__item${tab === n.id ? " active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="adm-sidenav__icon">{n.icon}</span>
              <span className="adm-sidenav__label">{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main column ────────────────────────────────────────── */}
      <div className="adm-main">

        {/* Top bar */}
        <header className="adm-topbar">
          {/* Mobile: brand logo */}
          <div className="adm-topbar__brand">
            <span className="adm-topbar__brandicon"><IcoUtensils /></span>
            <span className="adm-topbar__brandname">MyRestaurant</span>
          </div>
          {/* Desktop: date title */}
          <div className="adm-topbar__date">
            <span className="adm-topbar__weekday">Thursday, Oct 24</span>
          </div>
          {/* Desktop search */}
          <div className="adm-search-desk">
            <span className="adm-search-desk__ico"><IcoSearch /></span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search employee..."
            />
          </div>
          {/* Right actions */}
          <div className="adm-topbar__actions">
            <button
              className="adm-icon-btn adm-search-toggle"
              onClick={searchOpen ? closeSearch : openSearch}
              aria-label="Search"
            >
              {searchOpen ? <IcoX /> : <IcoSearch />}
            </button>
            <button className="adm-icon-btn" aria-label="Notifications"><IcoBell /></button>
            <div className="adm-avatar-wrap" ref={logoutRef}>
              <button
                className="adm-avatar"
                onClick={() => setShowLogout(p => !p)}
                aria-label="Account menu"
              >A</button>
              {showLogout && (
                <div className="adm-logout-menu">
                  <button onClick={onLogout}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile expandable search bar */}
        <div className={`adm-search-mobile${searchOpen ? " open" : ""}`}>
          <span className="adm-search-mobile__ico"><IcoSearch /></span>
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search employee..."
          />
          <button className="adm-search-mobile__close" onClick={closeSearch}><IcoX /></button>
        </div>

        {/* Scrollable content */}
        <div className="adm-content">
          {/* Date row — mobile only */}
          <div className="adm-datebar">
            <span className="adm-date">Thursday, Oct 24</span>
          </div>

          {/* Stats pills */}
          <div className="adm-stats">
            <span className="adm-stat">Present: 8</span>
            <span className="adm-stat-sep">|</span>
            <span className="adm-stat">Total: 12</span>
          </div>

          {/* Employee cards */}
          <div className="adm-employees">
            {filtered.map(emp => <EmployeeCard key={emp.id} emp={emp} />)}
          </div>
        </div>
      </div>

      {/* ── Bottom nav (mobile) ────────────────────────────────── */}
      <nav className="adm-bottomnav">
        {BOTTOM_NAV.map(n => (
          <button
            key={n.id}
            className={`adm-bottomnav__item${tab === n.id ? " active" : ""}`}
            onClick={() => setTab(n.id)}
          >
            <span className="adm-bottomnav__icon">{n.icon}</span>
            <span className="adm-bottomnav__label">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* ── FAB ─────────────────────────────────────────────────── */}
      <button className="adm-fab" aria-label="Add"><IcoPlus /></button>
    </div>
  );
}
