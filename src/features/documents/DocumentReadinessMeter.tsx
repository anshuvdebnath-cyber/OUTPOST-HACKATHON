import { CheckCircle2, Circle, FileCheck2 } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DOCUMENT_LABELS } from '@/lib/constants';
import { useProfileStore } from '@/store/useProfileStore';
import type { Scholarship } from '@/types/scholarship';
import { computeDocumentReadiness } from './documentReadiness';

/**
 * Document Readiness Meter — shows how many required documents the student already has,
 * and lets them tick documents off directly (synced with their profile's document vault).
 */
export function DocumentReadinessMeter({ scholarship }: { scholarship: Scholarship }) {
  const owned = useProfileStore((s) => s.profile.documents);
  const toggleDocument = useProfileStore((s) => s.toggleDocument);
  const { percent } = computeDocumentReadiness(scholarship, owned);
  const tone = percent === 100 ? 'emerald' : percent >= 50 ? 'amber' : 'rose';

  return (
    <section aria-labelledby="docs-heading" className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <FileCheck2 aria-hidden="true" className="h-5 w-5 text-brand-600 dark:text-brand-300" />
        <h2 id="docs-heading" className="text-lg font-semibold text-ink">
          Document readiness
        </h2>
      </div>
      <ProgressBar value={percent} label="Documents ready" showValue tone={tone} />
      <p className="mt-2 text-sm text-ink-muted">
        {percent === 100 ? 'You have every document needed — you are ready to apply! 🎉' : 'Tick the documents you already have.'}
      </p>
      <ul className="mt-4 space-y-1">
        {scholarship.requiredDocuments.map((doc) => {
          const has = owned.includes(doc);
          return (
            <li key={doc}>
              <button
                type="button"
                onClick={() => toggleDocument(doc)}
                aria-pressed={has}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-surface-muted"
              >
                {has ? (
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle aria-hidden="true" className="h-5 w-5 shrink-0 text-ink-muted" />
                )}
                <span className={has ? 'text-ink' : 'text-ink-muted'}>{DOCUMENT_LABELS[doc]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

