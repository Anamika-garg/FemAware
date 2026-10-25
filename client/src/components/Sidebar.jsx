import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import Avatar from './ui/Avatar';
import { getNavSections, isTeenStage } from '../lib/navItems';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { LIFE_STAGES } from '../lib/constants';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSenior = user?.lifeStage === 'senior';
  const sections = getNavSections(user?.lifeStage);

  const stage = isSenior
    ? 'Postmenopause care'
    : isTeenStage(user?.lifeStage)
      ? 'Teen space'
      : LIFE_STAGES.find((item) => item.value === user?.lifeStages?.[0])?.short || 'Cycle tracking';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-line bg-white lg:flex">
      <div className="flex h-[70px] items-center px-6">
        <Link to="/" className="rounded-md" aria-label="FemAware home">
          <Logo compact />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-4" aria-label="Main navigation">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'nav-item group',
                        isSenior && 'min-h-[48px] text-base',
                        isActive && 'nav-item-active'
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-4 mb-4 border-t border-line px-3 pt-4">
        <Link
          to="/library"
          className="flex items-center justify-between text-sm font-medium text-ink/75 transition-colors hover:text-deep-rose"
        >
          Public learning library
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-3 font-display text-[15px] italic leading-snug text-muted">
          {isSenior
            ? 'Your notes are a record, not a rule. Bring them to your clinician and ask what matters for you.'
            : 'There is no perfect cycle. Patterns — not single days — tell the most useful story.'}
        </p>
      </div>

      <div className="border-t border-line px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <NavLink to="/privacy" className="shrink-0" aria-label="Open privacy and profile settings">
            <Avatar name={user?.name} size="md" />
          </NavLink>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-muted">{stage}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <NavLink
          to="/privacy"
          className="mt-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted transition-colors hover:text-deep-rose"
        >
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          Private by design
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
