import { useEffect, useState } from 'react';

/**
 * Reactive CSS media-query hook backed by `window.matchMedia`.
 * Safely falls back in SSR / test environments where `matchMedia` may be stubbed.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * Semantic viewport & accessibility media-query states for responsive layouts.
 */
export function useViewportBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    prefersReducedMotion,
  };
}
