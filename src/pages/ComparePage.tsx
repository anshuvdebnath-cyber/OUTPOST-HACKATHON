import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, GitCompareArrows, Trash2, X } from 'lucide-react';
import { Button, buttonClasses } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { getScholarshipById } from '../data/scholarships';
import { CountdownBadge } from '../features/deadlines/CountdownBadge';
import { computeDocumentReadiness } from '../features/documents/documentReadiness';
import { MatchBadge } from '../features/eligibility/MatchBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAllMatches } from '../hooks/useMatch';
import { useViewportBreakpoints } from '../hooks/useMediaQuery';
import { DOCUMENT_LABELS, EDUCATION_LEVEL_LABELS, FIELD_LABELS, SCHOLARSHIP_TYPE_LABELS } from '../lib/constants';
import { formatINR } from '../lib/currency';
import { formatDate } from '../lib/date';
import { useCompareStore } from '../store/useCompareStore';
import { useProfileStore } from '../store/useProfileStore';
import type { Scholarship } from '../types/scholarship';

/** Monochrome frosted-glass side-by-side comparison of up to 3 selected scholarships. */
export default function ComparePage() {
  useDocumentTitle('Compare scholarships');
  const { ids, toggle, clear } = useCompareStore();
  const matches = useAllMatches();
  const ownedDocs = useProfileStore((s) => s.profile.documents);
  const { isMobile } = useViewportBreakpoints();

  const items = useMemo(
    () => ids.map((id) => getScholarshipById(id)).filter((s): s is Scholarship => Boolean(s)),
    [ids],
  );

  return (
    <>
      <PageHeader
        title="Compare scholarships"
        description="Evaluate up to 3 scholarships side by side across award value, eligibility criteria, document readiness and benefits."
        actions={
          items.length > 0 && (
            <>
              <Link to="/discover" className={buttonClasses('secondary')}>
                <Compass aria-hidden="true" className="h-4 w-4" /> Add more
              </Link>
              <Button variant="secondary" onClick={clear}>
                <Trash2 aria-hidden="true" className="h-4 w-4" /> Clear all
              </Button>
            </>
          )
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={GitCompareArrows}
          title="Nothing to compare yet"
          description="Click the compare icon on up to 3 scholarship cards in Discover to inspect them side by side."
          action={
            <Link to="/discover" className={buttonClasses('primary')}>
              Browse scholarships
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Responsive mobile stacked comparison cards */}
          {isMobile && (
            <div className="grid gap-4 md:hidden" aria-label="Mobile scholarship comparison cards">
              {items.map((s) => {
                const m = matches.get(s.id);
                const r = computeDocumentReadiness(s, ownedDocs);
                return (
                  <article key={s.id} className="card space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/scholarships/${s.id}`} className="text-[16px] font-medium text-ink hover:underline">
                        {s.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-label={`Remove ${s.title} from comparison`}
                        className="glass-subtle rounded-full p-1.5 text-ink-muted hover:text-ink"
                      >
                        <X aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-ink-muted">{s.provider}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {m && <MatchBadge match={m} />}
                      <CountdownBadge deadline={s.deadline} />
                    </div>
                    <dl className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="glass-subtle rounded-xl p-2.5">
                        <dt className="text-ink-muted">Award</dt>
                        <dd className="mt-0.5 font-semibold text-ink">{formatINR(s.amount)}</dd>
                      </div>
                      <div className="glass-subtle rounded-xl p-2.5">
                        <dt className="text-ink-muted">Docs ready</dt>
                        <dd className="mt-0.5 font-semibold text-ink">{r.percent}%</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          )}

          <div className="card animate-fade-in-up overflow-x-auto p-2">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th scope="col" className="w-44 p-4 font-medium text-ink-muted">
                  Attribute
                </th>
                {items.map((s) => (
                  <th key={s.id} scope="col" className="p-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/scholarships/${s.id}`} className="font-normal text-[16px] tracking-[-0.02em] text-ink hover:underline">
                        {s.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-label={`Remove ${s.title} from comparison`}
                        className="glass-subtle rounded-full p-1.5 text-ink-muted hover:text-ink"
                      >
                        <X aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs font-normal text-ink-muted">{s.provider}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              <Row label="Your match">
                {items.map((s) => {
                  const m = matches.get(s.id);
                  return <td key={s.id} className="p-4">{m && <MatchBadge match={m} />}</td>;
                })}
              </Row>
              <Row label="Award amount">
                {items.map((s) => (
                  <td key={s.id} className="p-4 font-display text-lg font-medium text-ink">
                    {formatINR(s.amount)}{' '}
                    <span className="font-sans text-xs font-normal text-ink-muted">
                      ({s.frequency === 'annual' ? 'annual' : 'one-time'})
                    </span>
                  </td>
                ))}
              </Row>
              <Row label="Deadline">
                {items.map((s) => (
                  <td key={s.id} className="p-4">
                    <CountdownBadge deadline={s.deadline} />
                    <p className="mt-1 text-xs text-ink-muted">{formatDate(s.deadline)}</p>
                  </td>
                ))}
              </Row>
              <Row label="Type">
                {items.map((s) => (
                  <td key={s.id} className="p-4">
                    {SCHOLARSHIP_TYPE_LABELS[s.type]} · <span className="capitalize">{s.providerType}</span>
                  </td>
                ))}
              </Row>
              <Row label="Education level">
                {items.map((s) => (
                  <td key={s.id} className="p-4">
                    {s.eligibility.levels.map((l) => EDUCATION_LEVEL_LABELS[l]).join(', ')}
                  </td>
                ))}
              </Row>
              <Row label="Minimum marks">
                {items.map((s) => (
                  <td key={s.id} className="p-4">{s.eligibility.minPercentage ? `${s.eligibility.minPercentage}%` : 'None'}</td>
                ))}
              </Row>
              <Row label="Income ceiling">
                {items.map((s) => (
                  <td key={s.id} className="p-4">
                    {s.eligibility.maxFamilyIncome ? formatINR(s.eligibility.maxFamilyIncome) : 'No limit'}
                  </td>
                ))}
              </Row>
              <Row label="Fields of study">
                {items.map((s) => (
                  <td key={s.id} className="p-4">
                    {s.eligibility.fields?.length ? s.eligibility.fields.map((f) => FIELD_LABELS[f]).join(', ') : 'All fields'}
                  </td>
                ))}
              </Row>
              <Row label="Document readiness">
                {items.map((s) => {
                  const r = computeDocumentReadiness(s, ownedDocs);
                  return (
                    <td key={s.id} className="p-4">
                      <p className="font-semibold text-ink">{r.percent}% ready</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {s.requiredDocuments.map((d) => DOCUMENT_LABELS[d]).join(', ')}
                      </p>
                    </td>
                  );
                })}
              </Row>
              <Row label="Key benefits">
                {items.map((s) => (
                  <td key={s.id} className="p-4">
                    <ul className="list-disc space-y-1 pl-4 text-xs text-ink-muted">
                      {s.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </Row>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr>
      <th scope="row" className="p-4 font-medium text-ink-muted">
        {label}
      </th>
      {children}
    </tr>
  );
}
