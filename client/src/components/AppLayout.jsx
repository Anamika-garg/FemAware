import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '../context/AuthContext';

const SENIOR_FONT_SCALE_KEY = 'femaware_senior_font_scale';
const VALID_SCALES = ['standard', 'large', 'xlarge'];

const AppLayout = () => {
  const { user } = useAuth();
  const isSenior = user?.lifeStage === 'senior';

  // The accessibility toolbar owns the live preference, but the shell applies it
  // on every route so shared pages such as privacy settings keep the chosen size.
  useEffect(() => {
    const root = document.documentElement;
    if (!isSenior) {
      root.removeAttribute('data-senior-font-scale');
      return undefined;
    }
    let saved = 'standard';
    try {
      const stored = localStorage.getItem(SENIOR_FONT_SCALE_KEY);
      if (VALID_SCALES.includes(stored)) saved = stored;
    } catch {
      // Fall back to the standard scale when storage is unavailable.
    }
    root.setAttribute('data-senior-font-scale', saved);

    const handleScaleChange = (event) => {
      const next = VALID_SCALES.includes(event.detail) ? event.detail : 'standard';
      root.setAttribute('data-senior-font-scale', next);
    };
    window.addEventListener('femaware:font-scale', handleScaleChange);
    return () => {
      window.removeEventListener('femaware:font-scale', handleScaleChange);
      root.removeAttribute('data-senior-font-scale');
    };
  }, [isSenior]);

  return (
    <div className="app-shell min-h-screen bg-[#FFF7FA]">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Navbar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-12"
        >
          <Suspense fallback={<div className="min-h-[50vh]" aria-busy="true" />}>
            <div className="animate-fade-up">
              <Outlet />
            </div>
          </Suspense>
        </main>
        <footer className="mx-auto hidden w-full max-w-[1440px] items-center justify-between gap-4 border-t border-line px-8 py-6 text-xs text-muted lg:flex">
          <p>© {new Date().getFullYear()} FemAware. Made for understanding, not diagnosing.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-deep-rose" aria-hidden="true" />
            Your data stays in your account
          </p>
        </footer>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
