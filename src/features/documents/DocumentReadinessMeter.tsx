import { CheckCircle2, Circle, FileCheck2 } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DOCUMENT_LABELS } from '@/lib/constants';
import { useProfileStore } from '@/store/useProfileStore';
import type { Scholarship } from '@/types/scholarship';
import { computeDocumentReadiness } from './documentReadiness';

/**
 * Document Readiness Meter — monochrome frosted glass card synced with the student's Document Vault.
 */
export function DocumentReadinessMeter({ scholarship }: { scholarship: Scholarship }) {
  const owned = useProfileStore((s) => s.profile.documents);
  const toggleDocument = useProfileStore((s) => s.toggleDocument);
  const { percent } = computeDocumentReadiness(scholarship, owned);

  return (
    <section aria-labelledby="docs-heading" className="card p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <FileCheck2 aria-hidden="true" className="h-5 w-5 text-ink" />
        <h2 id="docs-heading" className="text-lg font-normal tracking-[-0.02em] text-ink">
          Document readiness
        </h2>
      </div>
      <ProgressBar value={percent} label="Documents ready" showValue />
      <p className="mt-2.5 text-xs text-ink-muted">
        {percent === 100 ? 'You have every document needed — ready to apply.' : 'Tick the documents you already have ready.'}
      </p>
      <ul className="mt-4 space-y-1.5">
        {scholarship.requiredDocuments.map((doc) => {
          const has = owned.includes(doc);
          return (
            <li key={doc}>
              <button
                type="button"
                onClick={() => toggleDocument(doc)}
                aria-pressed={has}
                className="glass-subtle flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs transition duration-300 hover:scale-[1.01]"
              >
                {has ? (
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-ink" />
                ) : (
                  <Circle aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
                )}
                <span className={has ? 'font-medium text-ink' : 'text-ink-muted'}>{DOCUMENT_LABELS[doc]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
