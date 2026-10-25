import { Link } from 'react-router-dom';
import Logo from '../Logo';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/explore#teen', label: 'Teenagers' },
      { to: '/explore#adult', label: 'Adult women' },
      { to: '/explore#senior', label: 'Senior women' },
      { to: '/start', label: 'Find your starting point' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { to: '/library', label: 'Learning library' },
      { to: '/symptom-guide', label: 'Symptom guide' },
      { to: '/library/understanding-your-cycle', label: 'Your menstrual cycle' },
      { to: '/library/menopause-changing-health-needs', label: 'Menopause' },
    ],
  },
  {
    title: 'FemAware',
    links: [
      { to: '/about', label: 'About' },
      { to: '/about#privacy', label: 'Privacy approach' },
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create an account' },
    ],
  },
];

const SiteFooter = () => (
  <footer className="border-t border-line bg-rose-mist">
    <div className="site-container grid gap-10 py-14 lg:grid-cols-[1.3fr_2fr]">
      <div className="max-w-sm">
        <Logo />
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Health education, symptom tracking and appointment preparation for women at every stage of
          life.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-rose">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-ink/80 transition-colors hover:text-deep-rose">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-line">
      <div className="site-container grid gap-6 py-8 text-xs leading-relaxed text-muted lg:grid-cols-[2fr_1fr]">
        <p className="max-w-3xl">
          <span className="font-semibold text-ink">Medical information disclaimer.</span> FemAware provides
          general health education and self-tracking tools. It does not diagnose conditions or replace
          advice from a qualified healthcare professional. If you think you need urgent care, call your
          local emergency number or go to the nearest emergency department.
        </p>
        <p className="lg:text-right">© {new Date().getFullYear()} FemAware</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
