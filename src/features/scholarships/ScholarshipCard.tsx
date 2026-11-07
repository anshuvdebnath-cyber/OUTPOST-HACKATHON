import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Building2, GitCompareArrows, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/currency';
import { SCHOLARSHIP_TYPE_LABELS } from '@/lib/constants';
import { CountdownBadge } from '@/features/deadlines/CountdownBadge';
import { MatchBadge } from '@/features/eligibility/MatchBadge';
import type { MatchResult } from '@/features/eligibility/matchEngine';
import { useApplicationStore } from '@/store/useApplicationStore';
import { MAX_COMPARE, useCompareStore } from '@/store/useCompareStore';
import { toast } from '@/store/useToastStore';
import type { Scholarship } from '@/types/scholarship';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  match: MatchResult;
}

/** Summary card for a scholarship in the Discover grid. Memoised for list performance. */
export const ScholarshipCard = memo(function ScholarshipCard({ scholarship: s, match }: ScholarshipCardProps) {
  const isSaved = useApplicationStore((st) => Boolean(st.applications[s.id]));
  const saveScholarship = useApplicationStore((st) => st.saveScholarship);
  const removeApplication = useApplicationStore((st) => st.removeApplication);
  const isComparing = useCompareStore((st) => st.ids.includes(s.id));
  const compareFull = useCompareStore((st) => st.ids.length >= MAX_COMPARE);
  const toggleCompare = useCompareStore((st) => st.toggle);

  const onSave = () => {
    if (isSaved) {
      removeApplication(s.id);
      toast('Removed from your applications', 'info');
    } else {
      saveScholarship(s);
      toast('Saved to your application tracker');
    }
  };

  const onCompare = () => {
    if (!isComparing && compareFull) {
      toast(`You can compare up to ${MAX_COMPARE} scholarships`, 'error');
      return;
    }
    toggleCompare(s.id);
  };

  return (
    <article
      className="card group relative flex h-full animate-fade-in-up flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700"
      aria-labelledby={`title-${s.id}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <MatchBadge match={match} />
        <CountdownBadge deadline={s.deadline} />
      </div>

      <h3 id={`title-${s.id}`} className="text-base font-semibold leading-snug text-ink">
        {/* Stretched link makes the whole card clickable while keeping a single accessible link */}
        <Link to={`/scholarships/${s.id}`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
          {s.title}
        </Link>
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
        <Building2 aria-hidden="true" className="h-3.5 w-3.5" />
        {s.provider}
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{s.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          {SCHOLARSHIP_TYPE_LABELS[s.type]}
        </span>
        <span className="chip bg-surface-muted capitalize text-ink-muted">{s.providerType}</span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-5">
        <div>
          <p className="text-xs text-ink-muted">Award</p>
          <p className="flex items-center text-lg font-bold text-ink">
            <IndianRupee aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">{formatINR(s.amount)}</span>
            <span aria-hidden="true">{formatINR(s.amount).replace('₹', '')}</span>
            <span className="ml-1 text-xs font-normal text-ink-muted">/{s.frequency === 'annual' ? 'yr' : 'once'}</span>
          </p>
        </div>
        {/* Action buttons sit above the stretched link (relative z-10) */}
        <div className="relative z-10 flex gap-1.5">
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={isComparing}
            aria-label={isComparing ? `Remove ${s.title} from comparison` : `Add ${s.title} to comparison`}
            title="Compare"
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl border transition',
              isComparing
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                : 'border-line text-ink-muted hover:text-ink',
            )}
          >
            <GitCompareArrows aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onSave}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Unsave ${s.title}` : `Save ${s.title}`}
            title={isSaved ? 'Saved' : 'Save'}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl border transition',
              isSaved
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line text-ink-muted hover:border-brand-400 hover:text-brand-600',
            )}
          >
            {isSaved ? <BookmarkCheck aria-hidden="true" className="h-4 w-4" /> : <Bookmark aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
});

