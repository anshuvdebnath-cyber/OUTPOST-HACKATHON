import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navItems';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/cn';
import { useApplicationStore } from '@/store/useApplicationStore';
import { profileCompleteness, useProfileStore } from '@/store/useProfileStore';
import { useCompareStore } from '@/store/useCompareStore';

function getTabIndex(pathname: string): number {
  const idx = NAV_ITEMS.findIndex((n) => pathname === n.to || pathname.startsWith(`${n.to}/`));
  if (idx !== -1) return idx;
  if (pathname.startsWith('/scholarships/')) return 1; // Discover sub-route
  return 0;
}

/**
 * Floating glassmorphism navigation shell:
 *  - Gliding active indicator pill inside the desktop floating navbar
 *  - Directional horizontal slide transition (left ↔ right) when traversing tabs
 *  - New Fluted-Prism Logo on both desktop and mobile
 */
export function AppShell() {
  const location = useLocation();
  const appCount = useApplicationStore((s) => Object.keys(s.applications).length);
  const compareCount = useCompareStore((s) => s.ids.length);
  const profile = useProfileStore((s) => s.profile);
  const completeness = profileCompleteness(profile);

  const currentIdx = getTabIndex(location.pathname);
  const prevIdxRef = useRef(currentIdx);
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');

  // Track tab direction for smooth horizontal slide transition
  useLayoutEffect(() => {
    if (currentIdx !== prevIdxRef.current) {
      setSlideDir(currentIdx >= prevIdxRef.current ? 'right' : 'left');
      prevIdxRef.current = currentIdx;
    }
  }, [currentIdx, location.pathname]);

  // Measure active desktop nav link to glide the indicator pill smoothly
  const navContainerRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useLayoutEffect(() => {
    const updatePill = () => {
      const activeEl = itemRefs.current[currentIdx];
      const container = navContainerRef.current;
      if (activeEl && container) {
        const cRect = container.getBoundingClientRect();
        const aRect = activeEl.getBoundingClientRect();
        setPillStyle({
          left: aRect.left - cRect.left,
          width: aRect.width,
          opacity: 1,
        });
      }
    };
    updatePill();
    window.addEventListener('resize', updatePill, { passive: true });
    return () => window.removeEventListener('resize', updatePill);
  }, [currentIdx, appCount, compareCount]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const badgeFor = (to: string) => (to === '/tracker' ? appCount : to === '/compare' ? compareCount : 0);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Floating glassmorphism pill navbar aligned to main content width */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:top-6 sm:px-6 lg:px-8">
        <div className="glass-pill flex items-center justify-between gap-4 rounded-full px-4 py-2 sm:px-6 sm:py-2.5">
          <Logo to="/" />

          <nav
            ref={navContainerRef}
            aria-label="Main navigation"
            className="relative hidden items-center gap-1.5 lg:flex"
          >
            {/* Gliding active background pill */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 rounded-full bg-accent shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translate3d(${pillStyle.left}px, 0, 0)`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />
            {NAV_ITEMS.map(({ to, label }, idx) => {
              const count = badgeFor(to);
              return (
                <NavLink
                  key={to}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium tracking-tight transition-colors duration-300 sm:px-4.5 sm:text-[16px]',
                      isActive ? 'text-accent-ink' : 'text-ink/80 hover:text-ink',
                    )
                  }
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span className="rounded-full bg-current/15 px-2 py-0.5 text-xs font-semibold leading-none">
                      {count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {completeness < 100 && (
              <Link
                to="/profile"
                className="glass-subtle hidden items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink transition hover:scale-[1.02] sm:inline-flex"
              >
                <span>Profile</span>
                <span className="font-semibold">{completeness}%</span>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Directional slide route stage */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 overflow-x-clip px-4 pb-8 pt-8 focus:outline-none sm:px-6 lg:px-8 lg:pt-10"
      >
        <div
          key={location.pathname}
          className={slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}
        >
          <Outlet />
        </div>
      </main>

      {/* Aligned glassmorphism brand footer */}
      <footer className="no-print mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <div className="glass-subtle flex flex-col items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-xs text-ink-muted sm:flex-row">
          <Logo to="/" size="sm" />
          <p className="text-center sm:text-right">
            Unified Scholarship Discovery, Explainable Eligibility Matching &amp; Application Management
          </p>
        </div>
      </footer>

      {/* Mobile floating glassmorphism dock */}
      <nav aria-label="Mobile navigation" className="pb-safe fixed inset-x-4 bottom-3 z-40 lg:hidden">
        <div className="glass-pill mx-auto grid max-w-md grid-cols-5 items-center gap-1 rounded-full p-1.5">
          {NAV_ITEMS.filter((n) => n.mobile).map(({ to, label, icon: Icon }) => {
            const count = badgeFor(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-medium transition-all duration-300',
                    isActive ? 'bg-accent text-accent-ink shadow-sm' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                <span>{label}</span>
                {count > 0 && (
                  <span className="absolute right-1/4 top-1.5 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
