import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Ellipsis,
  LayoutDashboard,
  CalendarHeart,
  LineChart,
  Plus,
  BookOpen,
  FileText,
  HeartHandshake,
  Activity,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Modal from './ui/Modal';
import Avatar from './ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/cycle', label: 'Cycle', icon: CalendarHeart },
  { to: '/symptoms', label: 'Log', icon: Plus, center: true },
  { to: '/insights', label: 'Insights', icon: LineChart },
];

const moreLinks = [
  { to: '/doctor-report', label: 'Doctor report', icon: FileText, description: 'Prepare a clinical summary' },
  { to: '/late-period', label: 'Late period guide', icon: HeartHandshake, description: 'Step-by-step assessment' },
  { to: '/pcos', label: 'PCOS awareness', icon: Activity, description: 'Patterns and education' },
  { to: '/resources', label: 'Resource library', icon: BookOpen, description: 'Articles and guides' },
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck, description: 'Export or delete your data' },
];

const MobileNav = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-pink/60 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-1.5 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            if (tab.center) {
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className="flex flex-col items-center gap-1 text-[10px] font-semibold text-deep-rose"
                  aria-label="Log today's symptoms"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          '-mt-6 grid h-12 w-12 place-items-center rounded-full bg-pink-glow text-white shadow-glow ring-4 ring-rose-mist transition-colors',
                          isActive && 'bg-rose-pink'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>{tab.label}</span>
                    </>
                  )}
                </NavLink>
              );
            }
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition-colors',
                    isActive ? 'text-deep-rose' : 'text-muted'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn('h-5 w-5', isActive && 'stroke-[2.4]')}
                      aria-hidden="true"
                    />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold text-muted transition-colors hover:text-deep-rose"
            aria-haspopup="dialog"
          >
            <Ellipsis className="h-5 w-5" aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="All sections"
        description="Everything in your CycleSense space."
        size="sm"
      >
        <div className="flex items-center gap-3 rounded-xl bg-rose-mist p-3">
          <Avatar name={user?.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <Link
            to="/symptoms"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-rose-mist"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-pink-glow text-white">
              <CalendarHeart className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Symptom journal</p>
              <p className="text-xs text-muted">Log how today feels</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
          {moreLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-rose-mist"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-semibold text-deep-rose transition-colors hover:bg-rose-mist"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </Modal>
    </>
  );
};

export default MobileNav;
