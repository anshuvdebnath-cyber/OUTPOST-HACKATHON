import { Link } from 'react-router-dom';

/** Minimal typographic wordmark — no icon box. */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      aria-label="Grantly home"
      className="rounded-full px-3 py-1 font-display text-lg font-medium tracking-[-0.03em] text-ink transition hover:opacity-75"
    >
      Grantly
    </Link>
  );
}
