import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import DiscoverPage from '@/pages/DiscoverPage';
import ScholarshipDetailPage from '@/pages/ScholarshipDetailPage';
import TrackerPage from '@/pages/TrackerPage';
import DeadlinesPage from '@/pages/DeadlinesPage';
import ComparePage from '@/pages/ComparePage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Route configuration with preloaded core views so navbar tab traversal
 * transitions instantaneously without Suspense layout jitter.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AppShell />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/scholarships/:id', element: <ScholarshipDetailPage /> },
      { path: '/tracker', element: <TrackerPage /> },
      { path: '/deadlines', element: <DeadlinesPage /> },
      { path: '/compare', element: <ComparePage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
