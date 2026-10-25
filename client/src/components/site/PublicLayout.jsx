import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

// Scrolls to an in-page anchor such as /explore#adult after navigation.
const useHashScroll = () => {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return undefined;
    // Pages load lazily, so wait a few frames for the section to exist.
    let frame;
    let tries = 0;
    const seek = () => {
      const target = document.getElementById(hash.slice(1));
      if (target) target.scrollIntoView({ block: 'start' });
      else if (tries++ < 30) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [hash, pathname]);
};

const PublicLayout = () => {
  useHashScroll();
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PublicLayout;
