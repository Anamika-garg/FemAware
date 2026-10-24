import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Lock, LogOut, Plus, ShieldCheck, UserRound } from 'lucide-react';
import Logo from './Logo';
import Avatar from './ui/Avatar';
import { getPageMeta } from '../lib/navItems';
import { useAuth } from '../context/AuthContext';
import { formatLongDate, todayISO } from '../lib/dates';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isSenior = user?.lifeStage === 'senior';
  const meta = getPageMeta(pathname, user?.lifeStage);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-blush-pink/40 bg-rose-mist/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/dashboard" className="lg:hidden" aria-label="CycleSense home">
            <Logo compact />
          </Link>
          <div className="hidden min-w-0 lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-pink">
              {meta.eyebrow}
            </p>
            <p className="truncate font-display text-lg font-semibold text-deep-rose">{meta.title}</p>
          </div>
          <span className="hidden text-[11px] font-medium text-muted xl:inline">
            {formatLongDate(todayISO())}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-blush-pink/80 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-muted md:inline-flex">
            <Lock className="h-3 w-3 text-pink-glow" aria-hidden="true" />
            Private by design
          </span>
          <Link to="/symptoms" className="btn-primary btn-sm hidden sm:inline-flex">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isSenior ? 'Daily check-in' : 'Quick log'}
          </Link>
          <NavLink
            to="/symptoms"
            className="btn-primary grid h-9 w-9 place-items-center !rounded-full !p-0 sm:hidden"
            aria-label={isSenior ? 'Open today’s check-in' : "Log today's symptoms"}
          >
            <Plus className="h-4 w-4" />
          </NavLink>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex items-center gap-2 rounded-full border border-blush-pink/60 bg-white/80 p-1 pr-2 transition-colors hover:border-pink-glow ${
                isSenior ? 'min-h-[48px]' : ''
              }`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Open account menu"
            >
              <Avatar name={user?.name} size="sm" />
              <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 mt-2 w-64 animate-fade-up rounded-2xl border border-blush-pink/60 bg-white p-2 shadow-card"
                role="menu"
              >
                <div className="mb-1 border-b border-blush-pink/40 px-3 py-2.5">
                  <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
                  <p className="truncate text-xs text-muted">{user?.email}</p>
                </div>
                <Link
                  to="/privacy"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose-mist hover:text-deep-rose"
                  role="menuitem"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Profile & privacy
                </Link>
                <Link
                  to="/privacy"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose-mist hover:text-deep-rose"
                  role="menuitem"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Data controls
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-deep-rose transition-colors hover:bg-rose-mist"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
