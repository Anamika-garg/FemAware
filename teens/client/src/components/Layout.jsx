import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useSession } from '../context/SessionContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/learn', label: 'Learn' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/symptoms', label: 'Symptoms' },
  { to: '/check', label: 'Symptom check' },
  { to: '/insights', label: 'Insights' },
  { to: '/safety', label: 'Body safety' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-deep text-petal">
        <Heart aria-hidden className="size-5 fill-current" />
      </span>
      FemAware
    </Link>
  );
}

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-bold transition-colors ${isActive ? 'bg-deep text-white' : 'hover:bg-petal'}`;

export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { status } = useSession();

  useEffect(() => {
    setOpen(false);
    window.scrollTo?.(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      {status === 'active' && (
        <div className="bg-deep px-4 py-1.5 text-center text-xs font-bold text-white">
          Demo mode — data is synthetic or for practice only and is automatically deleted after 7 days.{' '}
          <Link to="/privacy" className="underline">
            Learn more
          </Link>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-petal bg-mist/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-petal lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main" className="flex flex-col gap-1 border-t border-petal px-4 py-3 lg:hidden">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-petal bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-[2fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-md text-deep/80">
              FemAware is for education only. It does not diagnose or treat any condition and is not a substitute for a doctor.
              In an emergency, call your local emergency number.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-2 font-bold">
            <Link to="/privacy">Privacy & your data</Link>
            <Link to="/disclaimer">Health disclaimer</Link>
            <Link to="/safety">Body safety & help</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
