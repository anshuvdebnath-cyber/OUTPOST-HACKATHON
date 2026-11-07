import { Link, NavLink, Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/cn';
import { useApplicationStore } from '@/store/useApplicationStore';
import { profileCompleteness, useProfileStore } from '@/store/useProfileStore';
import { useCompareStore } from '@/store/useCompareStore';
import { ProgressBar } from '@/components/ui/ProgressBar';

/**
 * Application shell:
 *  - Desktop (lg+): fixed left sidebar navigation
 *  - Mobile/tablet: sticky top bar + bottom tab bar
 */
export function AppShell() {
  const appCount = useApplicationStore((s) => Object.keys(s.applications).length);
  const compareCount = useCompareStore((s) => s.ids.length);
  const profile = useProfileStore((s) => s.profile);
  const completeness = profileCompleteness(profile);

  const badgeFor = (to: string) => (to === '/tracker' ? appCount : to === '/compare' ? compareCount : 0);

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo to="/dashboard" />
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                )
              }
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="flex-1">{label}</span>
              {badgeFor(to) > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {badgeFor(to)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {completeness < 100 && (
          <div className="m-3 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-4 text-white">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles aria-hidden="true" className="h-4 w-4" /> Sharpen your matches
            </p>
            <p className="mt-1 text-xs text-white/85">A complete profile unlocks accurate eligibility scores.</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${completeness}%` }} />
            </div>
            <Link to="/profile" className="mt-3 inline-block text-xs font-semibold underline underline-offset-2">
              Profile {completeness}% complete →
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <span className="text-xs text-ink-muted">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
        <Logo to="/dashboard" />
        <div className="flex items-center gap-2">
          {completeness < 100 && (
            <Link
              to="/profile"
              className="hidden w-32 sm:block"
              aria-label={`Profile ${completeness}% complete — open profile`}
            >
              <ProgressBar value={completeness} label="Profile completeness" />
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 focus:outline-none sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Mobile navigation"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      >
        {NAV_ITEMS.filter((n) => n.mobile).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition',
                isActive ? 'text-brand-600 dark:text-brand-300' : 'text-ink-muted',
              )
            }
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span>{label}</span>
            {badgeFor(to) > 0 && (
              <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
