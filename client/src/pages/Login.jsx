import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, HeartPulse, Lock, Mail, Sparkles, Sprout } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';

const DEMO_EMAILS = {
  teen: 'teen@femaware.app',
  adult: 'demo@femaware.app',
  senior: 'senior@femaware.app',
};

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goNext = (user) => {
    const target =
      location.state?.from?.pathname ||
      (user.onboardingComplete ? '/dashboard' : '/onboarding');
    navigate(target, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      goNext(user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role = 'adult') => {
    setError('');
    setDemoLoading(role);
    try {
      const user = await login(DEMO_EMAILS[role], 'FemAware123!');
      goNext(user);
    } catch (err) {
      setError(
        getErrorMessage(err) +
          ' If you are running locally, seed the demo accounts with `npm run seed` or start the API with USE_MEMORY_DB=true.'
      );
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-deep-rose">
          Good to see you.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Pick up where you left off. Your logs, trends and reports are waiting.
        </p>

        {error ? (
          <div
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-blush-pink bg-white p-3.5 text-sm text-deep-rose"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">{error}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <Field label="Email address" htmlFor="email" required>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70"
                aria-hidden="true"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="password" required>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70"
                aria-hidden="true"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="input-field pl-10 pr-11"
                placeholder="Your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition-colors hover:text-deep-rose"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" className="w-full" size="lg" loading={loading} iconRight={ArrowRight}>
            Sign in
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-blush-pink/70" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">or</span>
          <span className="h-px flex-1 bg-blush-pink/70" />
        </div>

        <div className="space-y-2.5">
          {[
            {
              role: 'teen',
              icon: Sprout,
              title: 'Explore the teen demo',
              description: 'Period calendar, symptom diary, lessons and quizzes',
            },
            {
              role: 'adult',
              icon: Sparkles,
              title: 'Explore the adult demo',
              description: '8 months of cycle and symptom data, instantly',
            },
            {
              role: 'senior',
              icon: HeartPulse,
              title: 'Explore the senior care demo',
              description: 'Postmenopause check-ins, trends and a saved visit summary',
            },
          ].map((demo) => {
            const Icon = demo.icon;
            const isLoading = demoLoading === demo.role;
            return (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleDemo(demo.role)}
                disabled={Boolean(demoLoading) || loading}
                className="group flex w-full items-center gap-3 rounded-2xl border border-blush-pink bg-white p-3.5 text-left transition-all hover:border-pink-glow hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-deep-rose">
                    {isLoading ? 'Opening your demo…' : demo.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                    {demo.description}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-pink-glow transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          New to FemAware?{' '}
          <Link to="/register" className="font-bold text-deep-rose underline decoration-blush-pink underline-offset-4 transition-colors hover:text-rose-pink">
            Create your account
          </Link>
        </p>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-muted/80">
          Sessions stay private to this device. FemAware does not sell health data.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
