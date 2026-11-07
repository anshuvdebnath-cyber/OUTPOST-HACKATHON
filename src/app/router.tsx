import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RouteErrorFallback } from '@/components/ui/ErrorBoundary';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { scheduleIdleTask } from '@/lib/performance';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'));
const ScholarshipDetailPage = lazy(() => import('@/pages/ScholarshipDetailPage'));
const TrackerPage = lazy(() => import('@/pages/TrackerPage'));
const DeadlinesPage = lazy(() => import('@/pages/DeadlinesPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{node}</Suspense>;
}

/**
 * Prefetches lazy route chunks during browser idle time so tab transitions
 * remain instantaneous while preserving initial bundle code-splitting.
 */
export function preloadCoreRoutes(): void {
  scheduleIdleTask(() => {
    void import('@/pages/DashboardPage');
    void import('@/pages/DiscoverPage');
    void import('@/pages/TrackerPage');
    void import('@/pages/DeadlinesPage');
    void import('@/pages/ComparePage');
    void import('@/pages/ProfilePage');
    void import('@/pages/ScholarshipDetailPage');
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
