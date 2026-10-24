import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

const AppLayout = () => (
  <div className="min-h-screen">
    <Sidebar />
    <div className="flex min-h-screen flex-col lg:pl-72">
      <Navbar />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-12"
      >
        <div className="animate-fade-up">
          <Outlet />
        </div>
      </main>
      <footer className="mx-auto hidden w-full max-w-[1440px] items-center justify-between gap-4 px-8 pb-8 text-[11px] text-muted lg:flex">
        <p>© {new Date().getFullYear()} CycleSense. Made for understanding, not diagnosing.</p>
        <p className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF7D]" aria-hidden="true" />
          Your data stays in your account
        </p>
      </footer>
    </div>
    <MobileNav />
  </div>
);

export default AppLayout;
