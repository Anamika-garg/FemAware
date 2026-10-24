import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Logo from './components/Logo';
import Spinner from './components/ui/Spinner';
import { useAuth } from './context/AuthContext';
import { isTeenStage } from './lib/navItems';

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

// The teen module adds lessons, a guided symptom check and body-safety help,
// and swaps in teen-friendly versions of the shared tracking pages.
const TeenDashboard = lazy(() => import('./modules/teen/pages/Dashboard'));
const TeenCalendar = lazy(() => import('./modules/teen/pages/CalendarPage'));
const TeenSymptoms = lazy(() => import('./modules/teen/pages/Symptoms'));
const TeenInsights = lazy(() => import('./modules/teen/pages/Insights'));
const TeenLearn = lazy(() => import('./modules/teen/pages/Learn'));
const TeenLesson = lazy(() => import('./modules/teen/pages/Lesson'));
const TeenAssessment = lazy(() => import('./modules/teen/pages/Assessment'));
const TeenSafety = lazy(() => import('./modules/teen/pages/Safety'));
const Disclaimer = lazy(() => import('./modules/teen/pages/Disclaimer'));

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

// Teen pages are written against the short pink tokens and inherit their
// text colour, so they render inside this wrapper.
const TeenPage = ({ page: Page }) => (
  <div className="text-ink">
    <Page />
  </div>
);

const DashboardRoute = () => {
  const { user } = useAuth();
  const Dashboard = DASHBOARDS[user?.lifeStage] || AdultDashboard;
  return isTeenStage(user?.lifeStage) ? <TeenPage page={Dashboard} /> : <Dashboard />;
};

// Renders the stage-appropriate page for a shared route. Adult pages remain the
// default so accounts without a recognised stage keep the current experience.
const StagePage = ({ adult: AdultPage, senior: SeniorPage = AdultPage, teen: TeenStagePage }) => {
  const { user } = useAuth();
  if (TeenStagePage && isTeenStage(user?.lifeStage)) return <TeenPage page={TeenStagePage} />;
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
            <Route path="/cycle" element={<StagePage adult={PeriodTracker} teen={TeenCalendar} />} />
            <Route
              path="/symptoms"
              element={
                <StagePage adult={SymptomJournal} senior={SeniorSymptomJournal} teen={TeenSymptoms} />
              }
            />
            <Route
              path="/insights"
              element={
                <StagePage adult={HealthInsights} senior={SeniorHealthInsights} teen={TeenInsights} />
              }
            />
            <Route path="/learn" element={<TeenPage page={TeenLearn} />} />
            <Route path="/learn/:slug" element={<TeenPage page={TeenLesson} />} />
            <Route path="/check" element={<TeenPage page={TeenAssessment} />} />
            <Route path="/safety" element={<TeenPage page={TeenSafety} />} />
            <Route path="/disclaimer" element={<TeenPage page={Disclaimer} />} />
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
