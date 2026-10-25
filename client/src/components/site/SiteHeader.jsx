import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import Logo from '../Logo';
import { ButtonLink } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const SITE_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore Health' },
  { to: '/library', label: 'Learn' },
  { to: '/symptom-guide', label: 'Symptom Guide' },
  { to: '/about', label: 'About' },
];

const SiteHeader = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const cta = user
    ? { to: user.onboardingComplete ? '/dashboard' : '/onboarding', label: 'Open your dashboard' }
    : { to: '/start', label: 'Explore Your Health' };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-deep-rose"
      >
        Skip to content
      </a>
      <div className="site-container flex h-16 items-center justify-between gap-6">
        <Link to="/" aria-label="FemAware home" className="shrink-0 rounded-md">
          <Logo compact />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SITE_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'relative inline-flex h-16 items-center px-3 text-sm font-medium transition-colors',
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:transition-colors after:content-['']",
                      isActive
                        ? 'text-deep-rose after:bg-deep-rose'
                        : 'text-ink/75 after:bg-transparent hover:text-deep-rose hover:after:bg-blush-pink'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {!user ? (
            <Link to="/login" className="text-sm font-medium text-ink/75 transition-colors hover:text-deep-rose">
              Sign in
            </Link>
          ) : null}
          <ButtonLink to={cta.to} size="sm" className="!min-h-[40px] !px-4 !text-sm">
            {cta.label}
          </ButtonLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 grid h-11 w-11 place-items-center rounded-lg text-ink transition-colors hover:bg-rose-mist lg:hidden"
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div id="site-mobile-menu" className="animate-fade-up border-t border-line bg-white lg:hidden">
          <nav aria-label="Main" className="site-container py-3">
            <ul>
              {SITE_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-[52px] items-center justify-between border-b border-line text-base',
                        isActive ? 'font-semibold text-deep-rose' : 'text-ink'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-deep-rose" aria-hidden="true" /> : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 pb-2 pt-4">
              <ButtonLink to={cta.to} size="lg" iconRight={ArrowRight}>
                {cta.label}
              </ButtonLink>
              {!user ? (
                <ButtonLink to="/login" variant="ghost">
                  Sign in
                </ButtonLink>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
};

export default SiteHeader;
