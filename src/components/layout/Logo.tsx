import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Grantly wordmark. */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-lg" aria-label="Grantly home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lift">
        <GraduationCap aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink">Grantly</span>
    </Link>
  );
}

