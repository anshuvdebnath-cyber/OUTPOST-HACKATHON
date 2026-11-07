import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { RouteErrorFallback } from '../components/ui/ErrorBoundary';
import { PageSkeleton } from '../components/ui/Skeleton';
import { scheduleIdleTask } from '../lib/performance';
import ComparePage from '../pages/ComparePage';
import DashboardPage from '../pages/DashboardPage';
import DeadlinesPage from '../pages/DeadlinesPage';
import DiscoverPage from '../pages/DiscoverPage';
import LandingPage from '../pages/LandingPage';
import ProfilePage from '../pages/ProfilePage';
import ScholarshipDetailPage from '../pages/ScholarshipDetailPage';
import TrackerPage from '../pages/TrackerPage';

const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{node}</Suspense>;
}

/**
 * Prefetches lazy route chunks during browser idle time so tab transitions
 * remain instantaneous while preserving initial bundle code-splitting.
 */
export function preloadCoreRoutes(): void {
  scheduleIdleTask(() => {
    void import('../pages/NotFoundPage');
  });
}

/**
 * Route configuration with React.lazy code-splitting, Suspense skeleton fallbacks,
 * and route-level error boundaries.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
    errorElement: <RouteErrorFallback />,
  },
  {
    element: <AppShell />,
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/dashboard', element: withSuspense(<DashboardPage />) },
      { path: '/discover', element: withSuspense(<DiscoverPage />) },
      { path: '/scholarships/:id', element: withSuspense(<ScholarshipDetailPage />) },
      { path: '/tracker', element: withSuspense(<TrackerPage />) },
      { path: '/deadlines', element: withSuspense(<DeadlinesPage />) },
      { path: '/compare', element: withSuspense(<ComparePage />) },
      { path: '/profile', element: withSuspense(<ProfilePage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
