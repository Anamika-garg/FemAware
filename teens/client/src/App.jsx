import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loading } from './components/ui';
import Landing from './pages/Landing';

// Route-level code splitting keeps the landing page light (charts load only on Insights).
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Learn = lazy(() => import('./pages/Learn'));
const Lesson = lazy(() => import('./pages/Lesson'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Symptoms = lazy(() => import('./pages/Symptoms'));
const Assessment = lazy(() => import('./pages/Assessment'));
const Insights = lazy(() => import('./pages/Insights'));
const Safety = lazy(() => import('./pages/Safety'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const NotFound = lazy(() => import('./pages/NotFound'));

const page = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="onboarding" element={page(Onboarding)} />
        <Route path="dashboard" element={page(Dashboard)} />
        <Route path="learn" element={page(Learn)} />
        <Route path="learn/:slug" element={page(Lesson)} />
        <Route path="calendar" element={page(CalendarPage)} />
        <Route path="symptoms" element={page(Symptoms)} />
        <Route path="check" element={page(Assessment)} />
        <Route path="insights" element={page(Insights)} />
        <Route path="safety" element={page(Safety)} />
        <Route path="privacy" element={page(Privacy)} />
        <Route path="disclaimer" element={page(Disclaimer)} />
        <Route path="*" element={page(NotFound)} />
      </Route>
    </Routes>
  );
}
