import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Logo from './components/Logo';
import Spinner from './components/ui/Spinner';
import { useAuth } from './context/AuthContext';

// Route-level code splitting keeps the first load small. Charts, the report
// generator and the resource library only download when they are opened.
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const PrivacySettings = lazy(() => import('./pages/PrivacySettings'));
const LatePeriodNavigator = lazy(() => import('./pages/LatePeriodNavigator'));
const PCOSAwareness = lazy(() => import('./pages/PCOSAwareness'));
const NotFound = lazy(() => import('./pages/NotFound'));

// The adult women module lives under src/modules/adult. Every page is loaded
// on demand so the shared shell stays light.
const AdultDashboard = lazy(() => import('./modules/adult/AdultDashboard'));
const PeriodTracker = lazy(() => import('./modules/adult/PeriodTracker'));
const SymptomJournal = lazy(() => import('./modules/adult/SymptomJournal'));
const HealthInsights = lazy(() => import('./modules/adult/HealthInsights'));
const DoctorReport = lazy(() => import('./modules/adult/DoctorReport'));
const ResourceLibrary = lazy(() => import('./modules/adult/ResourceLibrary'));

// The senior women module shares the same routes and shell, replacing the
// cycle-focused pages with care, comfort and appointment preparation.
const SeniorDashboard = lazy(() => import('./modules/senior/SeniorDashboard'));
const SeniorSymptomJournal = lazy(() => import('./modules/senior/SeniorSymptomJournal'));
const SeniorHealthInsights = lazy(() => import('./modules/senior/SeniorHealthInsights'));
const SeniorDoctorReport = lazy(() => import('./modules/senior/SeniorDoctorReport'));
const SeniorResourceLibrary = lazy(() => import('./modules/senior/SeniorResourceLibrary'));

// A minimal teen module keeps the life-stage router explicit. It can grow into
// a full experience without changing the route table again.
const TeenDashboard = lazy(() => import('./modules/teen/TeenDashboard'));

// Map a user's life stage to the dashboard module they should see. The adult
// module also covers the perimenopause experience for now; new life stages can
// register their own dashboard here without touching the route table.
const DASHBOARDS = {
  teen: TeenDashboard,
  adolescent: TeenDashboard,
  adult: AdultDashboard,
  perimenopause: AdultDashboard,
  senior: SeniorDashboard,
};

const DashboardRoute = () => {
  const { user } = useAuth();
  const Dashboard = DASHBOARDS[user?.lifeStage] || AdultDashboard;
  return <Dashboard />;
};

// Renders the stage-appropriate page for a shared route. Adult pages remain the
// default so accounts without a recognised stage keep the current experience.
const StagePage = ({ adult: AdultPage, senior: SeniorPage }) => {
  const { user } = useAuth();
  const Page = user?.lifeStage === 'senior' ? SeniorPage : AdultPage;
  return <Page />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const FullPageLoader = () => (
  <div className="grid min-h-screen place-items-center bg-petal-radial">
    <div className="flex flex-col items-center gap-5">
      <Logo />
      <Spinner className="h-7 w-7" label="Opening your space" />
      <p className="text-xs font-medium text-muted">Opening your space…</p>
    </div>
  </div>
);

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

const RequireOnboarded = () => {
  const { user } = useAuth();
  if (!user?.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
};

const PublicOnly = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) {
    return (
      <Navigate to={user.onboardingComplete ? '/dashboard' : '/onboarding'} replace />
    );
  }
  return <Outlet />;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
};

const App = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<RequireOnboarded />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/cycle" element={<PeriodTracker />} />
            <Route
              path="/symptoms"
              element={<StagePage adult={SymptomJournal} senior={SeniorSymptomJournal} />}
            />
            <Route
              path="/insights"
              element={<StagePage adult={HealthInsights} senior={SeniorHealthInsights} />}
            />
            <Route
              path="/doctor-report"
              element={<StagePage adult={DoctorReport} senior={SeniorDoctorReport} />}
            />
            <Route path="/late-period" element={<LatePeriodNavigator />} />
            <Route path="/pcos" element={<PCOSAwareness />} />
            <Route
              path="/resources"
              element={<StagePage adult={ResourceLibrary} senior={SeniorResourceLibrary} />}
            />
            <Route path="/privacy" element={<PrivacySettings />} />
          </Route>
        </Route>
      </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

export default App;
