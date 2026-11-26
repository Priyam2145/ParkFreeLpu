"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CampusMap from "@/components/campus-map";
import { CAMPUS_LANDMARKS, PARKING_LOTS } from "@/lib/parking";

type IconName =
  | "pin"
  | "grid"
  | "ticket"
  | "map"
  | "sun"
  | "moon"
  | "chevron"
  | "logout"
  | "user"
  | "search"
  | "filter"
  | "arrow"
  | "clock"
  | "route"
  | "check"
  | "close"
  | "car"
  | "sparkles"
  | "menu"
  | "shield"
  | "calendar"
  | "compass"
  | "arrow-up-right"
  | "building"
  | "plus"
  | "minus"
  | "book"
  | "refresh";

type Theme = "light" | "dark";
type ViewKey = "explore" | "bookings" | "guide";
type LotFilter = "all" | "open" | "low";

type Reservation = {
  id: string;
  lotId: string;
  lotName: string;
  spotCode: string;
  createdAt: string;
};

type ReservationsResponse = {
  reservations: Reservation[];
  reservedCounts: Record<string, number>;
  error?: string;
};

const iconContent: Record<IconName, ReactNode> = {
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></>,
  ticket: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v2a2.5 2.5 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-2a2.5 2.5 0 0 0 0-5v-2Z" /><path d="M14 8v1m0 3v1m0 3v.01" /></>,
  map: <><path d="m9 18-6 3V6l6-3m0 15 6 3m-6-3V3m6 18 6-3V3l-6 3m0 15V6m0 0L9 3" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  moon: <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.1 3.2-4.7 7-4.7s6.2 1.6 7 4.7" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="12" cy="17" r="1.5" /></>,
  arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  car: <><path d="m5 11 1.3-4A2 2 0 0 1 8.2 5.5h7.6a2 2 0 0 1 1.9 1.5l1.3 4" /><path d="M4 11h16a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 20 18h-1l-1.2 2h-1.6L15 18H9l-1.2 2H6.2L5 18H4a1.5 1.5 0 0 1-1.5-1.5v-4A1.5 1.5 0 0 1 4 11Z" /><path d="M6 14h.01M18 14h.01" /></>,
  sparkles: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6L5 2Z" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.1 5-4.9 2 2-4.9 5-2.1Z" /></>,
  "arrow-up-right": <><path d="M7 17 17 7M7 7h10v10" /></>,
  building: <><path d="M4 21V4l8-2v19m0-13 8-2v15M2 21h20M7 6h2m-2 4h2m-2 4h2m6-1h2m-2 4h2" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  minus: <path d="M5 12h14" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" /><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 18 6l2 1m-16 10 2 1a7 7 0 0 0 12.4-3" /></>,
};

function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconContent[name]}
    </svg>
  );
}

function LogoMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none">
        <path d="M18 3.5c-7.4 0-13.4 6-13.4 13.4 0 9.4 13.4 16 13.4 16s13.4-6.6 13.4-16c0-7.4-6-13.4-13.4-13.4Z" fill="currentColor" />
        <path d="M14 11h5.2a4.2 4.2 0 0 1 0 8.4h-2.4v6.3H14V11Z" fill="white" />
        <path d="M16.8 14h2.4a1.2 1.2 0 0 1 0 2.4h-2.4V14Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "G";
}

function formatReservedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ParkFreeApp() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [activeView, setActiveView] = useState<ViewKey>("explore");
  const [user, setUser] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("uni-mall");
  const [search, setSearch] = useState("");
  const [lotFilter, setLotFilter] = useState<LotFilter>("all");
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservedCounts, setReservedCounts] = useState<Record<string, number>>({});
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [busyLotId, setBusyLotId] = useState("");
  const [busyReservationId, setBusyReservationId] = useState("");
  const [toast, setToast] = useState("");

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const loadReservations = useCallback(async (username: string) => {
    const response = await fetch(`/api/reservations?username=${encodeURIComponent(username)}`, { cache: "no-store" });
    const payload = (await response.json()) as ReservationsResponse;
    if (!response.ok) throw new Error(payload.error || "Could not load your bookings.");
    setReservations(payload.reservations ?? []);
    setReservedCounts(payload.reservedCounts ?? {});
    return payload;
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("parkfree-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    const savedUser = window.localStorage.getItem("parkfree-user");
    if (savedUser) setUser(savedUser);
    const requestedLot = new URLSearchParams(window.location.search).get("book");
    if (requestedLot && PARKING_LOTS.some((lot) => lot.id === requestedLot)) setSelectedLotId(requestedLot);
  }, []);

  useEffect(() => {
    if (!user) {
      setReservations([]);
      setReservedCounts({});
      setIsLoadingReservations(false);
      return;
    }

    let cancelled = false;
    setIsLoadingReservations(true);
    loadReservations(user)
      .catch((error: unknown) => {
        if (!cancelled) showToast(error instanceof Error ? error.message : "Could not load your bookings.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingReservations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadReservations, showToast, user]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const liveLots = useMemo(
    () => PARKING_LOTS.map((lot) => ({ ...lot, liveAvailable: Math.max(0, lot.available - (reservedCounts[lot.id] ?? 0)) })),
    [reservedCounts],
  );
  const selectedLot = liveLots.find((lot) => lot.id === selectedLotId) ?? liveLots[0];
  const selectedReservation = reservations.find((reservation) => reservation.lotId === selectedLot.id);
  const totalAvailable = liveLots.reduce((sum, lot) => sum + lot.liveAvailable, 0);
  const totalSpaces = PARKING_LOTS.reduce((sum, lot) => sum + lot.total, 0);
  const openLots = liveLots.filter((lot) => lot.liveAvailable > 0).length;

  const filteredLots = liveLots.filter((lot) => {
    const matchesSearch = `${lot.name} ${lot.area} ${lot.shortCode}`.toLowerCase().includes(search.toLowerCase().trim());
    const matchesFilter =
      lotFilter === "all" ||
      (lotFilter === "open" && lot.liveAvailable > 0) ||
      (lotFilter === "low" && lot.liveAvailable > 0 && lot.liveAvailable <= 8);
    return matchesSearch && matchesFilter;
  });

  const changeTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("parkfree-theme", nextTheme);
  };

  const signOut = () => {
    window.localStorage.removeItem("parkfree-user");
    setUser("");
    setReservations([]);
    setReservedCounts({});
    setActiveView("explore");
    setMobileMenuOpen(false);
    showToast("You have been signed out.");
  };

  const changeView = (view: ViewKey) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const reserveSpot = async () => {
    if (!user) {
      const next = `/?book=${encodeURIComponent(selectedLot.id)}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (selectedReservation) {
      setActiveView("bookings");
      return;
    }
    if (selectedLot.liveAvailable < 1) return;

    setBusyLotId(selectedLot.id);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, lotId: selectedLot.id }),
      });
      const payload = (await response.json()) as { reservation?: Reservation; error?: string };
      if (!response.ok || !payload.reservation) throw new Error(payload.error || "Your spot could not be reserved.");
      await loadReservations(user);
      showToast(`${payload.reservation.spotCode} is yours at ${selectedLot.name}.`);
      setActiveView("bookings");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Your spot could not be reserved.");
    } finally {
      setBusyLotId("");
    }
  };

  const cancelReservation = async (reservation: Reservation) => {
    if (!user) return;
    setBusyReservationId(reservation.id);
    try {
      const response = await fetch("/api/reservations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, id: reservation.id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Your reservation could not be cancelled.");
      await loadReservations(user);
      showToast(`Spot ${reservation.spotCode} has been released.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Your reservation could not be cancelled.");
    } finally {
      setBusyReservationId("");
    }
  };

  const selectLot = useCallback((lotId: string) => {
    setSelectedLotId(lotId);
    setActiveView("explore");
  }, []);

  return (
    <div className={`app-shell theme-${theme}`}>
      {mobileMenuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar--open" : ""}`} aria-label="ParkFree navigation">
        <Link className="sidebar-brand" href="/" onClick={() => changeView("explore")}>
          <LogoMark />
          <span className="brand-wordmark">parkfree<span>.</span><small>SMART CAMPUS PARKING</small></span>
        </Link>

        <div className="sidebar-campus-block">
          <span className="sidebar-section-label">YOUR CAMPUS</span>
          <button className="campus-switcher" type="button" onClick={() => changeView("guide")}>
            <span className="campus-monogram">LPU</span>
            <span className="campus-switcher-copy"><strong>Lovely Professional</strong><small>Phagwara, Punjab</small></span>
            <Icon name="chevron" size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">WORKSPACE</span>
          <button className={`nav-link ${activeView === "explore" ? "nav-link--active" : ""}`} type="button" onClick={() => changeView("explore")} aria-current={activeView === "explore" ? "page" : undefined}>
            <span className="nav-link-icon"><Icon name="grid" size={18} /></span><span>Explore parking</span><span className="nav-live-dot" />
          </button>
          <button className={`nav-link ${activeView === "bookings" ? "nav-link--active" : ""}`} type="button" onClick={() => changeView("bookings")} aria-current={activeView === "bookings" ? "page" : undefined}>
            <span className="nav-link-icon"><Icon name="ticket" size={18} /></span><span>My bookings</span>{reservations.length > 0 && <span className="nav-count">{reservations.length}</span>}
          </button>
          <button className={`nav-link ${activeView === "guide" ? "nav-link--active" : ""}`} type="button" onClick={() => changeView("guide")} aria-current={activeView === "guide" ? "page" : undefined}>
            <span className="nav-link-icon"><Icon name="map" size={18} /></span><span>Campus guide</span>
          </button>
        </nav>

        <div className="sidebar-lower">
          <div className="sidebar-campus-note">
            <span className="sidebar-note-icon"><Icon name="compass" size={17} /></span>
            <span><strong>All of LPU, mapped.</strong><small>Find your way around campus.</small></span>
            <span className="sidebar-note-sparkle"><Icon name="sparkles" size={14} /></span>
          </div>
          {user ? (
            <button className="sidebar-user" type="button" onClick={signOut} title="Sign out">
              <span className="avatar avatar--sidebar">{initials(user)}</span>
              <span className="sidebar-user-copy"><strong>{user}</strong><small>Guest account · Sign out</small></span>
              <Icon name="logout" size={15} />
            </button>
          ) : (
            <Link className="sidebar-user sidebar-user--guest" href="/login">
              <span className="avatar avatar--sidebar"><Icon name="user" size={17} /></span>
              <span className="sidebar-user-copy"><strong>Guest mode</strong><small>Sign in to reserve a spot</small></span>
              <Icon name="arrow-up-right" size={15} />
            </Link>
          )}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-start">
            <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" size={20} /></button>
            <div className="topbar-breadcrumb"><span>PARKFREE</span><i>/</i><strong>LOVELY PROFESSIONAL UNIVERSITY</strong></div>
          </div>
          <div className="topbar-actions">
            <span className="campus-open-pill"><span /> CAMPUS OPEN</span>
            <span className="topbar-separator" />
            <button className="theme-toggle" type="button" onClick={changeTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} aria-pressed={theme === "dark"}>
              <Icon name={theme === "light" ? "moon" : "sun"} size={17} /><span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
            </button>
            {user ? (
              <button className="topbar-profile" type="button" onClick={signOut} title="Sign out">
                <span className="avatar avatar--topbar">{initials(user)}</span><span className="topbar-profile-copy"><strong>{user}</strong><small>Sign out</small></span>
              </button>
            ) : (
              <Link className="topbar-login" href="/login"><Icon name="user" size={16} /> Sign in <Icon name="arrow-up-right" size={14} /></Link>
            )}
          </div>
        </header>

        <div className="page-content">
          {activeView === "explore" && (
            <>
              <section className="dashboard-hero">
                <div className="dashboard-hero-copy">
                  <p className="eyebrow"><span className="eyebrow-live" /> YOUR LPU CAMPUS, A LITTLE EASIER</p>
                  <h1>Park smarter.<br /><span>Arrive happier.</span></h1>
                  <p className="hero-description">Find an open spot, know the walk, and spend less time circling campus.</p>
                </div>
                <div className="hero-campus-card">
                  <span className="hero-campus-icon"><Icon name="pin" size={21} /></span>
                  <span className="hero-campus-text"><small>YOU&apos;RE EXPLORING</small><strong>LPU Main Campus</strong><span>Phagwara, Punjab · India</span></span>
                  <span className="hero-campus-orbit" aria-hidden="true" />
                </div>
              </section>

              <section className="stats-grid" aria-label="Campus parking summary">
                <article className="stat-card stat-card--feature">
                  <div className="stat-card-top"><span>SPACES AVAILABLE</span><span className="stat-card-icon"><Icon name="car" size={18} /></span></div>
                  <div className="stat-number-row"><strong>{totalAvailable.toString().padStart(3, "0")}</strong><span>spots to choose from<br />across LPU</span></div>
                  <div className="stat-card-bottom"><span className="stat-live-indicator"><i /> Demo availability</span><span className="stat-mini-bars"><i /><i /><i /><i /><i /><i /><i /></span></div>
                  <span className="stat-card-watermark" aria-hidden="true">P</span>
                </article>
                <article className="stat-card">
                  <div className="stat-card-top"><span>PARKING AREAS</span><span className="stat-card-icon stat-card-icon--gold"><Icon name="pin" size={18} /></span></div>
                  <div className="stat-number-row"><strong>{String(openLots).padStart(2, "0")}</strong><span>of {String(PARKING_LOTS.length).padStart(2, "0")} areas<br />with spaces open</span></div>
                  <div className="stat-card-bottom"><span className="stat-muted">Spread across the campus</span><span className="stat-card-decoration stat-card-decoration--dots" aria-hidden="true" /></div>
                </article>
                <article className="stat-card">
                  <div className="stat-card-top"><span>AVERAGE WALK</span><span className="stat-card-icon stat-card-icon--green"><Icon name="route" size={18} /></span></div>
                  <div className="stat-number-row"><strong>3.3<span className="stat-unit">min</span></strong><span>from a parking area<br />to campus life</span></div>
                  <div className="stat-card-bottom"><span className="stat-muted">Your next stop is closer</span><span className="stat-card-decoration stat-card-decoration--route"><i /><i /><i /></span></div>
                </article>
              </section>

              <section className="map-section" aria-labelledby="map-section-title">
                <div className="section-heading-row">
                  <div><p className="section-kicker">THE WHOLE UNIVERSITY, AT A GLANCE</p><h2 id="map-section-title">Find your place <em>on campus.</em></h2></div>
                  <div className="map-heading-actions">
                    <span className="demo-data-pill"><i /> DEMO AVAILABILITY</span>
                    <button className={`landmark-toggle ${showLandmarks ? "landmark-toggle--active" : ""}`} type="button" onClick={() => setShowLandmarks((visible) => !visible)} aria-pressed={showLandmarks}>
                      <Icon name="map" size={15} /><span>Landmarks</span><span className="toggle-track"><i /></span>
                    </button>
                  </div>
                </div>

                <div className="map-card">
                  <div className="explore-layout">
                    <section className="map-panel" aria-label="LPU campus map">
                      <CampusMap lots={liveLots} selectedLotId={selectedLotId} onSelectLot={selectLot} showLandmarks={showLandmarks} />
                      <div className="map-legend">
                        <span><i className="legend-dot legend-dot--open" /> Spaces open</span><span><i className="legend-dot legend-dot--low" /> Filling up</span><span><i className="legend-dot legend-dot--full" /> Full</span>
                      </div>
                    </section>

                    <aside className="parking-panel" aria-label="Parking locations">
                      <div className="parking-panel-header">
                        <div><p className="panel-eyebrow">CHOOSE YOUR ZONE</p><h3>Parking areas <span>{PARKING_LOTS.length}</span></h3></div>
                        <button className="filter-icon-button" type="button" onClick={() => setLotFilter((current) => (current === "all" ? "open" : "all"))} aria-label="Toggle open parking areas" title="Toggle open parking areas"><Icon name="filter" size={17} /></button>
                      </div>
                      <label className="lot-search">
                        <Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search an area" aria-label="Search parking areas" />
                        {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><Icon name="close" size={14} /></button>}
                      </label>
                      <div className="lot-filter-tabs" role="group" aria-label="Filter parking areas">
                        {(["all", "open", "low"] as LotFilter[]).map((filter) => (
                          <button key={filter} className={lotFilter === filter ? "lot-filter-tab lot-filter-tab--active" : "lot-filter-tab"} type="button" onClick={() => setLotFilter(filter)}>
                            {filter === "all" ? "All" : filter === "open" ? "Available" : "Filling up"}
                          </button>
                        ))}
                      </div>
                      <div className="parking-lot-list">
                        {filteredLots.length ? filteredLots.map((lot) => {
                          const selected = lot.id === selectedLot.id;
                          const status = lot.liveAvailable === 0 ? "full" : lot.liveAvailable <= 8 ? "low" : "open";
                          return (
                            <button key={lot.id} type="button" className={`parking-lot-row ${selected ? "parking-lot-row--selected" : ""}`} onClick={() => setSelectedLotId(lot.id)} aria-pressed={selected}>
                              <span className={`lot-code lot-code--${status}`}>{lot.shortCode}</span>
                              <span className="lot-row-copy"><strong>{lot.name}</strong><small><Icon name="clock" size={12} /> {lot.walkMinutes} min walk <i /> {lot.area}</small></span>
                              <span className={`lot-free-count lot-free-count--${status}`}><strong>{lot.liveAvailable}</strong><small>free</small></span>
                              <Icon name="chevron" size={15} className="lot-row-chevron" />
                            </button>
                          );
                        }) : (
                          <div className="lot-empty-search"><Icon name="search" size={19} /><span>No areas match that search.</span><button type="button" onClick={() => { setSearch(""); setLotFilter("all"); }}>Clear filters</button></div>
                        )}
                      </div>

                      <div className="selected-lot-card">
                        <div className="selected-lot-card-top"><span className={`selected-status-dot ${selectedLot.liveAvailable <= 8 ? "selected-status-dot--low" : ""}`} /><span>{selectedReservation ? "YOUR SPOT IS HELD" : selectedLot.liveAvailable > 0 ? "READY WHEN YOU ARE" : "CURRENTLY FULL"}</span><span className="selected-lot-spaces">{selectedLot.liveAvailable} free</span></div>
                        <strong className="selected-lot-name">{selectedLot.name}</strong>
                        <span className="selected-lot-meta"><Icon name="route" size={13} /> About {selectedLot.walkMinutes} min walk · {selectedLot.area}</span>
                        <button className="reserve-button" type="button" onClick={reserveSpot} disabled={selectedLot.liveAvailable === 0 || busyLotId === selectedLot.id}>
                          {busyLotId === selectedLot.id ? "Reserving…" : selectedReservation ? "View my booking" : selectedLot.liveAvailable === 0 ? "No spaces available" : user ? "Reserve a spot" : "Sign in to reserve"}
                          <Icon name="arrow" size={16} />
                        </button>
                      </div>
                    </aside>
                  </div>
                  <div className="map-card-footer"><span><Icon name="shield" size={14} /> Campus boundaries shown for orientation. Parking counts are demo data.</span><span>Map data © OpenStreetMap contributors</span></div>
                </div>
              </section>

              <section className="bottom-callout">
                <span className="bottom-callout-icon"><Icon name="sparkles" size={18} /></span>
                <span><strong>First time at LPU?</strong><small>Get to know the campus landmarks, entrances, and parking zones.</small></span>
                <button type="button" onClick={() => changeView("guide")}>Explore campus guide <Icon name="arrow" size={15} /></button>
              </section>
            </>
          )}

          {activeView === "bookings" && (
            <section className="secondary-view">
              <div className="secondary-view-heading">
                <div><p className="eyebrow"><span className="eyebrow-live" /> YOUR CAMPUS, YOUR PLANS</p><h1>Your parking,<br /><span>all in one place.</span></h1><p>Keep the spot. Skip the search. Your reservations are saved to this device account.</p></div>
                <div className="booking-total-card"><span className="booking-total-icon"><Icon name="ticket" size={20} /></span><span><small>ACTIVE RESERVATIONS</small><strong>{String(reservations.length).padStart(2, "0")}</strong></span></div>
              </div>
              {!user ? (
                <div className="bookings-empty-state"><span className="empty-state-icon"><Icon name="user" size={28} /></span><p className="section-kicker">GUEST MODE</p><h2>Sign in to keep your spot.</h2><p>Your reservations will appear here after you sign in. Demo access accepts any username and password.</p><Link className="primary-button-link" href="/login">Sign in to ParkFree <Icon name="arrow" size={16} /></Link></div>
              ) : isLoadingReservations ? (
                <div className="booking-loading"><span className="loading-spinner" /> Loading your bookings…</div>
              ) : reservations.length ? (
                <div className="reservation-list">
                  {reservations.map((reservation) => {
                    const lot = PARKING_LOTS.find((candidate) => candidate.id === reservation.lotId);
                    return (
                      <article className="reservation-card" key={reservation.id}>
                        <div className="reservation-card-side"><span className="reservation-ticket-icon"><Icon name="car" size={22} /></span><span className="reservation-side-line" /></div>
                        <div className="reservation-main">
                          <div className="reservation-title-row"><div><span className="reservation-status"><i /> CONFIRMED</span><h2>{reservation.lotName}</h2><p>{lot?.area ?? "LPU Main Campus"} · {lot?.walkMinutes ?? 3} min walk</p></div><span className="reservation-spot"><small>YOUR SPOT</small><strong>{reservation.spotCode}</strong></span></div>
                          <div className="reservation-footer"><span><Icon name="calendar" size={14} /> Reserved {formatReservedAt(reservation.createdAt)}</span><span><Icon name="pin" size={14} /> Lovely Professional University</span><button className="cancel-reservation-button" type="button" onClick={() => cancelReservation(reservation)} disabled={busyReservationId === reservation.id}>{busyReservationId === reservation.id ? "Releasing…" : "Cancel booking"}</button></div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="bookings-empty-state"><span className="empty-state-icon"><Icon name="car" size={28} /></span><p className="section-kicker">NO ACTIVE BOOKINGS</p><h2>A good spot is waiting.</h2><p>Pick a parking area on the LPU campus map and reserve a demo spot in a couple of taps.</p><button className="primary-button-link" type="button" onClick={() => changeView("explore")}>Explore parking <Icon name="arrow" size={16} /></button></div>
              )}
              <div className="view-disclaimer"><Icon name="shield" size={15} /><span>ParkFree is a campus parking demo. Availability and spot assignment are for demonstration only.</span></div>
            </section>
          )}

          {activeView === "guide" && (
            <section className="secondary-view guide-view">
              <div className="secondary-view-heading">
                <div><p className="eyebrow"><span className="eyebrow-live" /> LOVELY PROFESSIONAL UNIVERSITY</p><h1>Big campus.<br /><span>Easy to explore.</span></h1><p>Use the full campus map to find academic zones, student spaces, entrances, and parking.</p></div>
                <div className="guide-campus-stamp"><LogoMark /><span><strong>LPU</strong><small>PHAGWARA<br />PUNJAB, INDIA</small></span></div>
              </div>
              <div className="guide-feature-card">
                <div className="guide-feature-icon"><Icon name="map" size={23} /></div>
                <div><span className="section-kicker">START WITH THE MAP</span><h2>Every corner, one clear view.</h2><p>Pan around the LPU campus, zoom into a parking zone, or turn on landmarks to get your bearings. Select any parking marker to see available demo spaces.</p></div>
                <button type="button" onClick={() => changeView("explore")}>Open campus map <Icon name="arrow" size={16} /></button>
              </div>
              <div className="guide-landmarks-heading"><div><p className="section-kicker">CAMPUS LANDMARKS</p><h2>Good places to know.</h2></div><span>{CAMPUS_LANDMARKS.length} places</span></div>
              <div className="guide-landmark-grid">
                {CAMPUS_LANDMARKS.map((landmark, index) => (
                  <article className="guide-landmark-card" key={landmark.id}>
                    <span className="guide-landmark-number">0{index + 1}</span><span className="guide-landmark-icon"><Icon name={landmark.type === "Library" ? "book" : landmark.type === "Residence" ? "building" : landmark.type === "Sports" ? "sparkles" : "pin"} size={18} /></span>
                    <div><strong>{landmark.name}</strong><small>{landmark.type} · LPU Main Campus</small></div>
                    <button type="button" aria-label={`View ${landmark.name} on map`} onClick={() => { setSelectedLotId(PARKING_LOTS[index % PARKING_LOTS.length].id); changeView("explore"); }}><Icon name="arrow-up-right" size={17} /></button>
                  </article>
                ))}
              </div>
              <div className="guide-footnote"><Icon name="compass" size={16} /><span>Landmark names and zones are orientation aids for this demo. Check campus signage for official directions.</span></div>
            </section>
          )}

          <footer className="page-footer"><span><LogoMark /> <strong>parkfree<span>.</span></strong> <i>© 2025</i></span><span>Made for getting there, not circling around.</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map data © OpenStreetMap</a></footer>
        </div>
      </main>

      {toast && <div className="toast-message" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}<button type="button" onClick={() => setToast("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}
    </div>
  );
}
