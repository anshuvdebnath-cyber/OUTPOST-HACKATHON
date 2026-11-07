import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { SkipLink } from '@/components/layout/SkipLink';
import { Toaster } from '@/components/ui/Toaster';
import { useThemeStore } from '@/store/useThemeStore';

/** Root application component: syncs dark-mode class and mounts router + toast announcer. */
export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <>
      <SkipLink />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

