import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { ShaderBackground } from '@/components/layout/ShaderBackground';
import { SkipLink } from '@/components/layout/SkipLink';
import { Toaster } from '@/components/ui/Toaster';
import { useThemeStore } from '@/store/useThemeStore';

/** Root application component: mounts live WebGL wave shader, syncs theme, and renders router. */
export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <>
      <SkipLink />
      <ShaderBackground />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
