import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/ui/Skeleton';

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

/** Route configuration with route-level code splitting for fast initial load. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },
  {
    element: <AppShell />,
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

