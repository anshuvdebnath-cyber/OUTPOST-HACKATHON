import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/cn';
import { useApplicationStore } from '@/store/useApplicationStore';
import { profileCompleteness, useProfileStore } from '@/store/useProfileStore';
import { useCompareStore } from '@/store/useCompareStore';

/**
 * Floating glassmorphism navigation shell:
 *  - Suspended frosted-glass pill navbar at top with generous spacing & no logo icon box
 *  - Smooth route & scroll transitions on every tab/page change
 *  - Floating frosted-glass bottom dock on mobile screens
 */
export function AppShell() {
  const location = useLocation();
  const appCount = useApplicationStore((s) => Object.keys(s.applications).length);
  const compareCount = useCompareStore((s) => s.ids.length);
  const profile = useProfileStore((s) => s.profile);
  const completeness = profileCompleteness(profile);

  // Smooth scroll to top on route transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const badgeFor = (to: string) => (to === '/tracker' ? appCount : to === '/compare' ? compareCount : 0);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Floating glassmorphism pill navbar */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4 sm:top-6 sm:px-6">
        <div className="glass-pill flex items-center justify-between gap-3 rounded-full px-4 py-2.5 sm:px-6 sm:py-3">
          <Link
            to="/"
            className="px-2 font-display text-base font-medium tracking-[-0.03em] text-ink transition hover:opacity-70 sm:text-lg"
          >
            Grantly
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1.5 lg:flex">
            {NAV_ITEMS.map(({ to, label }) => {
              const count = badgeFor(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-all duration-300',
                      isActive
                        ? 'bg-ink text-surface shadow-sm scale-[1.02]'
                        : 'text-ink-muted hover:bg-ink/10 hover:text-ink',
                    )
                  }
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span className="rounded-full bg-ink/15 px-2 py-0.5 text-[11px] font-semibold leading-none text-current">
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

      {/* Animated route stage */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-8 focus:outline-none sm:px-6 lg:px-8 lg:pb-16 lg:pt-12"
      >
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile floating glassmorphism dock */}
      <nav
        aria-label="Mobile navigation"
        className="pb-safe fixed inset-x-4 bottom-3 z-40 lg:hidden"
      >
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
                    isActive ? 'bg-ink text-surface shadow-sm' : 'text-ink-muted hover:text-ink',
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
