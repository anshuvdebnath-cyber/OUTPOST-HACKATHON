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

/** Frosted glass scholarship summary card with 0.8 specular glossiness. */
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
      className="card group relative flex h-full animate-fade-in-up flex-col p-6 hover:-translate-y-1 hover:shadow-lift"
      aria-labelledby={`title-${s.id}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <MatchBadge match={match} />
        <CountdownBadge deadline={s.deadline} />
      </div>

      <h3 id={`title-${s.id}`} className="text-lg font-normal leading-snug tracking-[-0.02em] text-ink">
        <Link to={`/scholarships/${s.id}`} className="after:absolute after:inset-0 after:rounded-3xl focus:outline-none">
          {s.title}
        </Link>
      </h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
        <Building2 aria-hidden="true" className="h-3.5 w-3.5" />
        {s.provider}
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-muted">{s.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="chip text-ink">{SCHOLARSHIP_TYPE_LABELS[s.type]}</span>
        <span className="chip capitalize text-ink-muted">{s.providerType}</span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-6">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-muted">Award</p>
          <p className="flex items-center font-display text-xl font-medium tracking-[-0.02em] text-ink">
            <IndianRupee aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">{formatINR(s.amount)}</span>
            <span aria-hidden="true">{formatINR(s.amount).replace('₹', '')}</span>
            <span className="ml-1 font-sans text-xs font-normal text-ink-muted">
              /{s.frequency === 'annual' ? 'yr' : 'once'}
            </span>
          </p>
        </div>
        <div className="relative z-10 flex gap-2">
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={isComparing}
            aria-label={isComparing ? `Remove ${s.title} from comparison` : `Add ${s.title} to comparison`}
            title="Compare"
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full transition-all duration-300',
              isComparing
                ? 'bg-accent text-accent-ink shadow-sm scale-105'
                : 'glass-subtle text-ink hover:scale-105',
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
              'grid h-10 w-10 place-items-center rounded-full transition-all duration-300',
              isSaved
                ? 'bg-accent text-accent-ink shadow-sm scale-105'
                : 'glass-subtle text-ink hover:scale-105',
            )}
          >
            {isSaved ? <BookmarkCheck aria-hidden="true" className="h-4 w-4" /> : <Bookmark aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
});
