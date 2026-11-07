import { CalendarClock, Compass, GitCompareArrows, KanbanSquare, LayoutDashboard, UserRound, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom navigation bar. */
  mobile: boolean;
}

/** Single source of truth for app navigation (sidebar + mobile bar). */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, mobile: true },
  { to: '/discover', label: 'Discover', icon: Compass, mobile: true },
  { to: '/tracker', label: 'Applications', icon: KanbanSquare, mobile: true },
  { to: '/deadlines', label: 'Deadlines', icon: CalendarClock, mobile: true },
  { to: '/compare', label: 'Compare', icon: GitCompareArrows, mobile: false },
  { to: '/profile', label: 'Profile', icon: UserRound, mobile: true },
];

