import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Logo from '../components/Logo';

const NotFound = () => (
  <div className="grid min-h-screen place-items-center bg-petal-radial px-5">
    <div className="w-full max-w-md text-center">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="rounded-3xl border border-white/80 bg-white/90 p-8 shadow-card">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-6xl font-semibold text-deep-rose">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-deep-rose">
          This page isn&apos;t in your space
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The link may be outdated, or the page may have moved. Let&apos;s get you back to a familiar
          place.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6 w-full">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to overview
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
