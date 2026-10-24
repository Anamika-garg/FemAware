import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  FileJson,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { addMonths } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../lib/api';
import { formatDate, toISODate, todayISO } from '../lib/dates';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import {
  GOALS,
  LIFE_STAGES,
  SENIOR_FOCUS_AREAS,
  SENIOR_GOALS,
  STAGE_OPTIONS,
  TEEN_GOALS,
} from '../lib/constants';
import { isTeenStage } from '../lib/navItems';
import { cn } from '../lib/utils';

const GOALS_FOR_SPACE = { teen: TEEN_GOALS, adult: GOALS, senior: SENIOR_GOALS };

const spaceFor = (user) => {
  if (isTeenStage(user?.lifeStage)) return 'teen';
  if (user?.lifeStage === 'senior') return 'senior';
  return 'adult';
};

const DeleteDataDialog = ({ open, mode, range, onClose, onDeleted }) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirmation('');
      setError('');
      setShowPassword(false);
      setLoading(false);
    }
  }, [open, mode]);

  const config = {
    range: {
      title: 'Delete logs in this range?',
      description: `All period entries starting between ${formatDate(range.startDate, 'd MMM yyyy')} and ${formatDate(range.endDate, 'd MMM yyyy')}, and symptom journals dated within it, will be permanently removed.`,
      label: 'Delete range',
      requirePhrase: false,
    },
    all: {
      title: 'Clear all health logs?',
      description:
        'Every period entry, symptom journal and saved report will be deleted. Your account, profile and login will remain.',
      label: 'Clear all logs',
      requirePhrase: true,
    },
    account: {
      title: 'Permanently delete your account?',
      description:
        'Your account, profile, cycle history, symptom journal and saved reports will be irreversibly erased. You will be signed out immediately.',
      label: 'Delete my account',
      requirePhrase: true,
    },
  }[mode] || {};

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!password) return setError('Enter your password to confirm.');
    if (config.requirePhrase && confirmation !== 'DELETE') {
      return setError('Type DELETE (in capitals) to confirm.');
    }

    setLoading(true);
    try {
      const payload = { scope: mode, password };
      if (mode === 'range') {
        payload.startDate = range.startDate;
        payload.endDate = range.endDate;
      }
      if (config.requirePhrase) payload.confirmation = confirmation;

      await api.delete('/user/data', { data: payload });
      onDeleted(mode);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      title={config.title}
      description="This cannot be undone. Your password is required."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Keep my data
          </Button>
          <Button variant="danger" onClick={submit} loading={loading}>
            {config.label}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex items-start gap-2.5 rounded-xl border border-blush-pink bg-rose-mist p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-ink">{config.description}</p>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-blush-pink bg-white p-3 text-xs text-deep-rose" role="alert">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        <Field label="Your password" htmlFor="delete-password" required>
          <div className="relative">
            <KeyRound
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
              aria-hidden="true"
            />
            <input
              id="delete-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field pl-10 pr-11"
              placeholder="Confirm with your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-deep-rose"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {config.requirePhrase ? (
          <Field
            label="Type DELETE to confirm"
            htmlFor="delete-confirm"
            required
            hint="This extra step protects you from an accidental deletion."
          >
            <input
              id="delete-confirm"
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="input-field tracking-[0.2em]"
              placeholder="DELETE"
              autoComplete="off"
              required
            />
          </Field>
        ) : null}
      </form>
    </Modal>
  );
};

const PrivacySettings = () => {
  const { user, updateProfile, refreshUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    age: user?.age || '',
    space: spaceFor(user),
    lifeStages: user?.lifeStages || ['general'],
    goals: user?.goals || [],
    averageCycleLength: user?.cycleProfile?.averageCycleLength || 28,
    averagePeriodLength: user?.cycleProfile?.averagePeriodLength || 5,
  });
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [range, setRange] = useState({
    startDate: toISODate(addMonths(new Date(), -3)),
    endDate: todayISO(),
  });
  const [rangeError, setRangeError] = useState('');
  const [deleteMode, setDeleteMode] = useState(null);

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      age: user?.age || '',
      space: spaceFor(user),
      lifeStages: user?.lifeStages || ['general'],
      goals: user?.goals || [],
      averageCycleLength: user?.cycleProfile?.averageCycleLength || 28,
      averagePeriodLength: user?.cycleProfile?.averagePeriodLength || 5,
    });
  }, [user]);

  const toggleStage = (value) => {
    setProfile((current) => ({
      ...current,
      lifeStages: current.lifeStages.includes(value)
        ? current.lifeStages.length === 1
          ? current.lifeStages
          : current.lifeStages.filter((item) => item !== value)
        : [...current.lifeStages, value],
    }));
  };

  const toggleGoal = (value) => {
    setProfile((current) => ({
      ...current,
      goals: current.goals.includes(value)
        ? current.goals.filter((goal) => goal !== value)
        : [...current.goals, value],
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError('');
    if (!profile.name.trim()) return setProfileError('Your name cannot be empty.');
    if (profile.age && (Number(profile.age) < 13 || Number(profile.age) > 110)) {
      return setProfileError('Please use an age between 13 and 110.');
    }
    if (!profile.lifeStages.length) return setProfileError('Choose at least one focus area.');

    const spaceChanged = profile.space !== spaceFor(user);
    const stageFields =
      profile.space === 'adult'
        ? {
            lifeStages: profile.lifeStages,
            focusAreas: [
              ...profile.lifeStages,
              ...(profile.goals.includes('Manage irregular periods') ? ['irregular-periods'] : []),
            ],
            cycleProfile: {
              averageCycleLength: Number(profile.averageCycleLength),
              averagePeriodLength: Number(profile.averagePeriodLength),
            },
          }
        : profile.space === 'senior' && spaceChanged
          ? { lifeStages: ['postmenopause'], focusAreas: SENIOR_FOCUS_AREAS }
          : profile.space === 'teen' && spaceChanged
            ? { lifeStages: ['general'], focusAreas: ['general'] }
            : {};

    setSavingProfile(true);
    try {
      await updateProfile({
        name: profile.name.trim(),
        age: profile.age || undefined,
        lifeStage: profile.space,
        goals: profile.goals,
        ...stageFields,
      });
      addToast({
        title: 'Profile updated',
        message: spaceChanged
          ? `You're now in the ${STAGE_OPTIONS.find((item) => item.value === profile.space).label.toLowerCase()}.`
          : 'Your preferences are saved.',
      });
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const response = await api.get('/user/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `femaware-export-${todayISO()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast({
        title: 'Export downloaded',
        message: 'Your complete history is now a private JSON file on this device.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Export failed', message: getErrorMessage(err) });
    } finally {
      setExporting(false);
    }
  };

  const startRangeDelete = () => {
    setRangeError('');
    if (!range.startDate || !range.endDate) {
      setRangeError('Choose both a start and end date.');
      return;
    }
    if (range.startDate > range.endDate) {
      setRangeError('The start date must come before the end date.');
      return;
    }
    if (range.endDate > todayISO()) {
      setRangeError('You cannot delete logs from future dates.');
      return;
    }
    setDeleteMode('range');
  };

  const handleDeleted = (mode) => {
    if (mode === 'account') {
      addToast({
        title: 'Account deleted',
        message: 'Your account and health data have been permanently erased.',
      });
      logout();
      navigate('/login', { replace: true });
      return;
    }
    refreshUser();
    addToast({
      title: mode === 'all' ? 'All logs cleared' : 'Selected range deleted',
      message:
        mode === 'all'
          ? 'Your account is intact. You can start a fresh history whenever you are ready.'
          : 'The logs in that date range have been removed.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your information, your control"
        title="Your data belongs to you."
        description="See what we store, take a copy whenever you like, and erase exactly what you choose. No dark patterns, no retention games."
      />

      <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-r from-soft-petal via-blush-pink/60 to-rose-mist p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-20 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70 text-deep-rose">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-deep-rose sm:text-xl">
                Your health data is never for sale.
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-deep-rose/70">
                FemAware uses your logs to power your own dashboard, predictions and reports. We do
                not use them to sell advertising or train public models.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Badge tone="outline" className="bg-white/60" icon={Lock}>
              Private by design
            </Badge>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <section className="card p-5 sm:p-6" aria-labelledby="export-title">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                  <FileJson className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="export-title" className="font-display text-xl font-semibold text-deep-rose">
                    Export your complete history
                  </h2>
                  <p className="text-[10px] text-muted">Raw, structured JSON · no lock-in</p>
                </div>
              </div>
              <Badge tone="calm">Portable</Badge>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Download every period entry, symptom log, saved doctor report and profile detail in one
              file. Keep it for your records or bring it to a clinician who uses a different system.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Cycle logs', icon: Database },
                { label: 'Symptom entries', icon: FileJson },
                { label: 'Saved reports', icon: Download },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg bg-rose-mist/70 px-3 py-2">
                    <Icon className="h-3.5 w-3.5 text-deep-rose" aria-hidden="true" />
                    <span className="text-[10px] font-semibold text-deep-rose">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <Button
              className="mt-4"
              variant="secondary"
              icon={Download}
              onClick={exportData}
              loading={exporting}
            >
              Download my data (.json)
            </Button>
            <p className="mt-2 text-[9px] leading-relaxed text-muted">
              Stored on this device. Treat the file as private — it contains personal health information.
            </p>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="delete-range-title">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <Database className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="delete-range-title" className="font-display text-xl font-semibold text-deep-rose">
                  Delete a specific date range
                </h2>
                <p className="text-[10px] text-muted">Keep the rest of your history intact.</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="From" htmlFor="delete-from">
                <input
                  id="delete-from"
                  type="date"
                  max={range.endDate || todayISO()}
                  value={range.startDate}
                  onChange={(event) => {
                    setRange((current) => ({ ...current, startDate: event.target.value }));
                    setRangeError('');
                  }}
                  className="input-field"
                />
              </Field>
              <Field label="To" htmlFor="delete-to">
                <input
                  id="delete-to"
                  type="date"
                  min={range.startDate || undefined}
                  max={todayISO()}
                  value={range.endDate}
                  onChange={(event) => {
                    setRange((current) => ({ ...current, endDate: event.target.value }));
                    setRangeError('');
                  }}
                  className="input-field"
                />
              </Field>
            </div>
            {rangeError ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-deep-rose" role="alert">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {rangeError}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[9px] leading-relaxed text-muted">
                Period entries are matched by start date; symptom logs by their entry date. Saved reports
                are not affected.
              </p>
              <Button variant="secondary" size="sm" icon={Trash2} onClick={startRangeDelete}>
                Delete this range
              </Button>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="privacy-practices-title">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="privacy-practices-title" className="font-display text-xl font-semibold text-deep-rose">
                  How your information is handled
                </h2>
                <p className="text-[10px] text-muted">Plain-language privacy practices.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                'Your password is hashed with bcrypt and is never stored in readable form.',
                'Sessions use signed tokens that expire; signing out removes the token from this device.',
                'Only you can access your health logs through your authenticated account.',
                'We do not sell health data, and we do not use third-party advertising trackers.',
                'Export and deletion actions are immediate and apply to the account you are signed into.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink/80">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-soft-petal text-deep-rose">
                    <Check className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-mist/70 p-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-deep-rose" aria-hidden="true" />
              <p className="text-[10px] leading-relaxed text-muted">
                FemAware is not an emergency service or a medical record. If you need urgent care,
                contact local emergency services or a clinician directly.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5 sm:p-6" aria-labelledby="profile-title">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="profile-title" className="font-display text-xl font-semibold text-deep-rose">
                  Your profile
                </h2>
                <p className="text-[10px] text-muted">Adjust what FemAware knows about you.</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-4 space-y-4" noValidate>
              {profileError ? (
                <div className="flex items-start gap-2 rounded-xl border border-blush-pink bg-rose-mist p-3 text-xs text-deep-rose" role="alert">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {profileError}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" htmlFor="profile-name">
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" aria-hidden="true" />
                    <input
                      id="profile-name"
                      type="text"
                      value={profile.name}
                      onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </Field>
                <Field label="Age" htmlFor="profile-age" optional>
                  <input
                    id="profile-age"
                    type="number"
                    min="13"
                    max="110"
                    value={profile.age}
                    onChange={(event) => setProfile((current) => ({ ...current, age: event.target.value }))}
                    className="input-field"
                    placeholder="e.g. 29"
                  />
                </Field>
              </div>

              <Field label="Email" htmlFor="profile-email" hint="Your sign-in email cannot be changed here.">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" aria-hidden="true" />
                  <input
                    id="profile-email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    className="input-field pl-10 pr-16"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full bg-rose-mist px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-muted">
                    Locked
                  </span>
                </div>
              </Field>

              <div>
                <p className="field-label" id="profile-space-label">Your space</p>
                <div className="grid gap-1.5 sm:grid-cols-3" role="radiogroup" aria-labelledby="profile-space-label">
                  {STAGE_OPTIONS.map((option) => {
                    const selected = profile.space === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setProfile((current) => ({
                            ...current,
                            space: option.value,
                            // Goals are worded per space.
                            goals: option.value === current.space ? current.goals : [],
                          }))
                        }
                        className={cn(
                          'rounded-lg border px-2.5 py-2 text-left transition-colors',
                          selected
                            ? 'border-pink-glow bg-soft-petal/70 text-deep-rose'
                            : 'border-blush-pink/60 bg-white text-muted hover:border-pink-glow'
                        )}
                      >
                        <span className="block text-[11px] font-bold">{option.label}</span>
                        <span className="block text-[9px] font-semibold uppercase tracking-wide">{option.ages}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="field-hint">Switching changes your dashboard and tools. Your logs are kept.</p>
              </div>

              {profile.space === 'adult' ? (
              <div>
                <p className="field-label">Focus areas</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {LIFE_STAGES.map((stage) => {
                    const selected = profile.lifeStages.includes(stage.value);
                    return (
                      <button
                        key={stage.value}
                        type="button"
                        onClick={() => toggleStage(stage.value)}
                        aria-pressed={selected}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-[10px] font-semibold transition-colors',
                          selected
                            ? 'border-pink-glow bg-soft-petal/70 text-deep-rose'
                            : 'border-blush-pink/60 bg-white text-muted hover:border-pink-glow'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-3.5 w-3.5 place-items-center rounded-full border',
                            selected ? 'border-pink-glow bg-pink-glow text-white' : 'border-blush-pink'
                          )}
                          aria-hidden="true"
                        >
                          {selected ? <Check className="h-2 w-2" /> : null}
                        </span>
                        {stage.short}
                      </button>
                    );
                  })}
                </div>
              </div>
              ) : null}

              <div>
                <p className="field-label">Health priorities</p>
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  {GOALS_FOR_SPACE[profile.space].map((goal) => {
                    const selected = profile.goals.includes(goal.value);
                    return (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => toggleGoal(goal.value)}
                        aria-pressed={selected}
                        className={cn(
                          'rounded-full border px-2 py-1 text-[9px] font-semibold transition-colors',
                          selected
                            ? 'border-pink-glow bg-pink-glow text-white'
                            : 'border-blush-pink/70 bg-white text-muted hover:border-pink-glow'
                        )}
                      >
                        {goal.value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {profile.space === 'adult' ? (
              <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Usual cycle length" htmlFor="profile-cycle">
                  <div className="relative">
                    <input
                      id="profile-cycle"
                      type="number"
                      min="15"
                      max="90"
                      value={profile.averageCycleLength}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, averageCycleLength: event.target.value }))
                      }
                      className="input-field pr-12"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-muted">days</span>
                  </div>
                </Field>
                <Field label="Usual period length" htmlFor="profile-period">
                  <div className="relative">
                    <input
                      id="profile-period"
                      type="number"
                      min="1"
                      max="15"
                      value={profile.averagePeriodLength}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, averagePeriodLength: event.target.value }))
                      }
                      className="input-field pr-12"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-muted">days</span>
                  </div>
                </Field>
              </div>
              <p className="text-[9px] leading-relaxed text-muted">
                Changing these defaults shapes your predictions. Existing period logs stay exactly as
                you recorded them.
              </p>
              </>
              ) : null}

              <Button type="submit" className="w-full" loading={savingProfile}>
                Save profile
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-blush-pink/70 bg-white p-5 sm:p-6" aria-labelledby="clear-title">
            <h2 id="clear-title" className="font-display text-lg font-semibold text-deep-rose">
              Start fresh
            </h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Remove every period, symptom and report while keeping your account and profile. Your
              predictions return to a neutral starting point.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              className="mt-3 w-full"
              onClick={() => setDeleteMode('all')}
            >
              Clear all health logs
            </Button>
          </section>

          <section className="rounded-2xl border border-deep-rose/20 bg-[#FFF7FA] p-5 sm:p-6" aria-labelledby="danger-title">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-deep-rose" aria-hidden="true" />
              <h2 id="danger-title" className="font-display text-lg font-semibold text-deep-rose">
                Delete account
              </h2>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Permanently erase your account and all associated health records. This action is
              irreversible and removes your access immediately.
            </p>
            <Button
              variant="danger"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setDeleteMode('account')}
            >
              Permanently delete my account
            </Button>
          </section>
        </div>
      </div>

      <DeleteDataDialog
        open={Boolean(deleteMode)}
        mode={deleteMode}
        range={range}
        onClose={() => setDeleteMode(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
};

export default PrivacySettings;
