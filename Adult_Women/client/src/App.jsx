import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Logo from './components/Logo';
import Spinner from './components/ui/Spinner';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import DashboardHome from './pages/DashboardHome';
import PeriodTracker from './pages/PeriodTracker';
import SymptomJournal from './pages/SymptomJournal';
import HealthInsights from './pages/HealthInsights';
import DoctorReport from './pages/DoctorReport';
import ResourceLibrary from './pages/ResourceLibrary';
import PrivacySettings from './pages/PrivacySettings';
import LatePeriodNavigator from './pages/LatePeriodNavigator';
import PCOSAwareness from './pages/PCOSAwareness';
import NotFound from './pages/NotFound';

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
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/cycle" element={<PeriodTracker />} />
            <Route path="/symptoms" element={<SymptomJournal />} />
            <Route path="/insights" element={<HealthInsights />} />
            <Route path="/doctor-report" element={<DoctorReport />} />
            <Route path="/late-period" element={<LatePeriodNavigator />} />
            <Route path="/pcos" element={<PCOSAwareness />} />
            <Route path="/resources" element={<ResourceLibrary />} />
            <Route path="/privacy" element={<PrivacySettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
