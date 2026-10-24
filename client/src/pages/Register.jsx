import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { cn } from '../lib/utils';

const requirementChecks = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'A number', test: (value) => /\d/.test(value) },
  { label: 'Upper & lowercase', test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
];

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const score = useMemo(
    () => requirementChecks.filter((check) => check.test(form.password)).length,
    [form.password]
  );

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Please tell us your name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.password.length < 8) return setError('Your password needs at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Those passwords do not match yet.');
    if (!form.consent) {
      return setError('Please confirm that you understand FemAware is educational guidance.');
    }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <p className="eyebrow">A space of your own</p>
        <h1 className="mt-2 font-display text-[2.4rem] font-semibold leading-tight tracking-tight text-deep-rose">
          Start understanding your body.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Two quiet minutes to set up. No cycle is too irregular, too short, or too complicated.
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
          <Field label="Your name" htmlFor="name" required>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70"
                aria-hidden="true"
              />
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                className="input-field pl-10"
                placeholder="How should we greet you?"
                required
              />
            </div>
          </Field>

          <Field label="Email address" htmlFor="reg-email" required>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70"
                aria-hidden="true"
              />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => set('email', event.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </Field>

          <Field label="Create a password" htmlFor="reg-password" required>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70"
                aria-hidden="true"
              />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => set('password', event.target.value)}
                className="input-field pl-10 pr-11"
                placeholder="At least 8 characters"
                required
                aria-describedby="password-requirements"
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
            {form.password ? (
              <div className="mt-2.5" id="password-requirements">
                <div className="flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        score > index ? 'bg-pink-glow' : 'bg-blush-pink/50'
                      )}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {requirementChecks.map((check) => {
                    const passed = check.test(form.password);
                    return (
                      <span
                        key={check.label}
                        className={cn(
                          'flex items-center gap-1 text-[10px] font-medium',
                          passed ? 'text-[#2E7D5B]' : 'text-muted'
                        )}
                      >
                        <Check className={cn('h-3 w-3', !passed && 'opacity-30')} aria-hidden="true" />
                        {check.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </Field>

          <Field label="Confirm password" htmlFor="confirm-password" required>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => set('confirmPassword', event.target.value)}
              className="input-field"
              placeholder="One more time"
              required
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/60 p-3">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => set('consent', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-blush-pink accent-pink-glow"
            />
            <span className="text-[11px] leading-relaxed text-muted">
              I understand FemAware offers educational information and self-tracking tools, not a
              medical diagnosis. I will speak with a qualified clinician about medical concerns.
            </span>
          </label>

          <Button type="submit" className="w-full" size="lg" loading={loading} iconRight={ArrowRight}>
            Create my space
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-deep-rose underline decoration-blush-pink underline-offset-4 transition-colors hover:text-rose-pink"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
