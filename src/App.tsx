import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { preloadCoreRoutes, router } from '@/app/router';
import { ShaderBackground } from '@/components/layout/ShaderBackground';
import { SkipLink } from '@/components/layout/SkipLink';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/Toaster';
import { initPerformanceMonitoring } from '@/lib/performance';
import { useThemeStore } from '@/store/useThemeStore';

/** Root application component: mounts live WebGL wave shader, syncs theme, and renders router. */
export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    initPerformanceMonitoring();
    preloadCoreRoutes();
  }, []);

  return (
    <ErrorBoundary>
      <SkipLink />
      <ShaderBackground />
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
}
