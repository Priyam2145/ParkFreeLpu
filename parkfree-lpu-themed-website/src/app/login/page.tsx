"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Theme = "light" | "dark";

function MiniIcon({ name, size = 18 }: { name: "user" | "lock" | "eye" | "eye-off" | "arrow" | "moon" | "sun" | "check"; size?: number }) {
  const icons = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.1 3.2-4.7 7-4.7s6.2 1.6 7 4.7" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" /></>,
    eye: <><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    "eye-off": <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.2 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.2-.2 3.2-.6" /></>,
    arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
    moon: <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function LoginLogo() {
  return (
    <span className="login-logo-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none">
        <path d="M18 3.5c-7.4 0-13.4 6-13.4 13.4 0 9.4 13.4 16 13.4 16s13.4-6.6 13.4-16c0-7.4-6-13.4-13.4-13.4Z" fill="currentColor" />
        <path d="M14 11h5.2a4.2 4.2 0 0 1 0 8.4h-2.4v6.3H14V11Z" fill="white" />
        <path d="M16.8 14h2.4a1.2 1.2 0 0 1 0 2.4h-2.4V14Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("parkfree-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("parkfree-theme", nextTheme);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeUsername = username.trim();
    if (!safeUsername || !password) {
      setError("Enter a username and password to continue.");
      return;
    }

    setSubmitting(true);
    setError("");
    window.localStorage.setItem("parkfree-user", safeUsername.slice(0, 80));
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const nextPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/";
    router.push(nextPath);
  };

  return (
    <main className={`login-page theme-${theme}`}>
      <header className="login-topbar">
        <Link className="login-brand" href="/">
          <LoginLogo /><span>parkfree<span>.</span></span>
        </Link>
        <div className="login-topbar-actions">
          <span className="login-campus-label"><i /> BUILT FOR LPU</span>
          <button className="login-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            <MiniIcon name={theme === "light" ? "moon" : "sun"} size={17} /><span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>

      <div className="login-layout">
        <section className="login-story-panel">
          <div className="login-story-grain" aria-hidden="true" />
          <div className="login-story-topline"><span className="login-live-dot" /> YOUR CAMPUS, WITHOUT THE CIRCLE</div>
          <div className="login-story-content">
            <p className="login-story-kicker">PARKFREE · LPU CAMPUS</p>
            <h1>Less circling.<br /><em>More campus.</em></h1>
            <p className="login-story-description">A smarter way to find your place at Lovely Professional University. Plan the parking. Make the most of the day.</p>
            <div className="login-story-benefits">
              <span><i><MiniIcon name="check" size={13} /></i>Full campus map</span>
              <span><i><MiniIcon name="check" size={13} /></i>One-tap spot holds</span>
              <span><i><MiniIcon name="check" size={13} /></i>Made for LPU</span>
            </div>
          </div>

          <div className="login-campus-art" aria-hidden="true">
            <svg viewBox="0 0 690 350" fill="none" preserveAspectRatio="xMidYMid slice">
              <path d="M-20 128C92 114 111 217 223 197S362 78 466 115 573 227 719 185" stroke="white" strokeOpacity=".24" strokeWidth="30" />
              <path d="M-20 128C92 114 111 217 223 197S362 78 466 115 573 227 719 185" stroke="white" strokeOpacity=".42" strokeWidth="2" strokeDasharray="6 10" />
              <path d="M202 360c-7-75 49-117 32-174s-20-123 7-210M425 358c-13-70-38-121 4-181s54-101 53-200M599 359c-40-72-46-120-12-164s57-79 71-143" stroke="white" strokeOpacity=".18" strokeWidth="21" />
              <path d="M202 360c-7-75 49-117 32-174s-20-123 7-210M425 358c-13-70-38-121 4-181s54-101 53-200M599 359c-40-72-46-120-12-164s57-79 71-143" stroke="white" strokeOpacity=".38" strokeWidth="1.6" strokeDasharray="5 9" />
              <rect x="56" y="30" width="77" height="44" rx="6" fill="white" fillOpacity=".12" stroke="white" strokeOpacity=".4" />
              <rect x="68" y="39" width="24" height="24" rx="3" fill="#ffc451" fillOpacity=".9" />
              <path d="M105 42h17M105 51h17M105 60h11" stroke="white" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round" />
              <rect x="279" y="28" width="86" height="54" rx="7" fill="white" fillOpacity=".1" stroke="white" strokeOpacity=".3" />
              <path d="M293 43h54M293 52h38M293 62h46" stroke="white" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
              <rect x="510" y="42" width="71" height="49" rx="7" fill="white" fillOpacity=".11" stroke="white" strokeOpacity=".36" />
              <path d="M523 55h45M523 64h28M523 73h37" stroke="white" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
              <rect x="71" y="235" width="82" height="52" rx="7" fill="white" fillOpacity=".11" stroke="white" strokeOpacity=".33" />
              <path d="M84 250h55M84 260h35M84 271h46" stroke="white" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
              <rect x="291" y="248" width="83" height="46" rx="7" fill="white" fillOpacity=".1" stroke="white" strokeOpacity=".33" />
              <path d="M305 262h55M305 272h31M305 281h44" stroke="white" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
              <circle cx="466" cy="115" r="28" fill="#ffc451" fillOpacity=".18" />
              <path d="M466 91c-13.3 0-24 10.7-24 24 0 16.8 24 37 24 37s24-20.2 24-37c0-13.3-10.7-24-24-24Z" fill="#ffc451" />
              <circle cx="466" cy="114" r="7" fill="#9c1531" />
              <circle cx="223" cy="197" r="7" fill="#fff" />
              <circle cx="603" cy="185" r="7" fill="#fff" />
              <circle cx="90" cy="116" r="4" fill="#ffc451" />
              <circle cx="376" cy="183" r="4" fill="#ffc451" />
              <circle cx="611" cy="250" r="4" fill="#ffc451" />
            </svg>
            <div className="login-map-tooltip"><span className="login-tooltip-pin"><MiniIcon name="check" size={13} /></span><span><strong>You're right where you need to be.</strong><small>LPU Main Campus · Phagwara</small></span></div>
          </div>

          <div className="login-story-footer"><span><strong>600+</strong> acres to explore</span><i /> <span>Lovely Professional University</span><span className="login-story-coordinate">31°15&apos;12.0&quot;N · 75°42&apos;11.8&quot;E</span></div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-inner">
            <Link className="login-back-link" href="/"><span aria-hidden="true">←</span> Back to campus map</Link>
            <div className="login-heading-block">
              <span className="login-form-badge"><MiniIcon name="check" size={13} /> DEMO ACCESS · NO CAMPUS ID NEEDED</span>
              <h2>Welcome to<br /><span>ParkFree.</span></h2>
              <p>Pick up where your day takes you. Sign in with any username and password to try the demo.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field-label" htmlFor="parkfree-username">Your name</label>
              <div className="login-input-wrap">
                <MiniIcon name="user" size={18} />
                <input id="parkfree-username" type="text" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(""); }} placeholder="e.g. Aanya Singh" maxLength={80} required />
              </div>

              <div className="login-password-label-row"><label className="login-field-label" htmlFor="parkfree-password">Password</label><span>Any password works</span></div>
              <div className="login-input-wrap">
                <MiniIcon name="lock" size={18} />
                <input id="parkfree-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter any password" required />
                <button className="show-password-button" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}><MiniIcon name={showPassword ? "eye-off" : "eye"} size={17} /></button>
              </div>

              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="login-submit-button" type="submit" disabled={submitting}>
                {submitting ? "Opening your campus…" : "Continue to ParkFree"}<MiniIcon name="arrow" size={17} />
              </button>
            </form>

            <div className="login-safety-note"><span><MiniIcon name="lock" size={14} /></span><p><strong>Demo mode, no password stored.</strong><br />Your name stays on this device so your sample bookings are easy to find.</p></div>
            <div className="login-form-footer"><span>By continuing, you&apos;re exploring a ParkFree demo.</span><span className="login-form-footer-mark">P<span>.</span></span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
