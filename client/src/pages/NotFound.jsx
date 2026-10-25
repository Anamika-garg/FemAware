import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Compass } from 'lucide-react';
import Logo from '../components/Logo';

const NotFound = () => {
  const { user } = useAuth();
  return (
  <div className="grid min-h-screen place-items-center bg-canvas px-5">
    <div className="w-full max-w-md text-center">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="rounded-2xl border border-line bg-white p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-blush-pink bg-rose-mist text-deep-rose">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-6xl text-ink">404</p>
        <h1 className="mt-2 font-display text-2xl text-ink">
          This page isn&apos;t in your space
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The link may be outdated, or the page may have moved. Let&apos;s get you back to a familiar
          place.
        </p>
        <Link to={user ? '/dashboard' : '/'} className="btn-primary mt-6 w-full">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {user ? 'Back to your dashboard' : 'Back to the home page'}
        </Link>
      </div>
    </div>
  </div>
  );
};

export default NotFound;
