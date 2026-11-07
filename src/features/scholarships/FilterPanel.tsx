import { RotateCcw } from 'lucide-react';
import { EDUCATION_LEVEL_LABELS, FIELD_LABELS, SCHOLARSHIP_TYPE_LABELS } from '@/lib/constants';
import { formatINRCompact } from '@/lib/currency';
import { cn } from '@/lib/cn';
import { useFilterStore } from '@/store/useFilterStore';
import type { EducationLevel, FieldOfStudy, ScholarshipType } from '@/types/scholarship';

const AMOUNT_STEPS = [0, 25000, 50000, 100000, 200000];
const DEADLINE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any time', value: null },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
];

/** Faceted filter panel for the Discover page (sidebar on desktop, drawer on mobile). */
export function FilterPanel() {
  const { filters, setFilter, toggleInList, resetFilters } = useFilterStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/30"
        >
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-brand-50 p-3 dark:bg-brand-900/20">
        <span className="text-sm font-medium text-ink">Only show scholarships I can apply for</span>
        <input
          type="checkbox"
          checked={filters.eligibleOnly}
          onChange={(e) => setFilter('eligibleOnly', e.target.checked)}
          className="h-5 w-5 rounded accent-brand-600"
        />
      </label>

      <ChipGroup<EducationLevel>
        legend="Education level"
        options={EDUCATION_LEVEL_LABELS}
        selected={filters.levels}
        onToggle={(v) => toggleInList('levels', v)}
      />
      <ChipGroup<ScholarshipType>
        legend="Scholarship type"
        options={SCHOLARSHIP_TYPE_LABELS}
        selected={filters.types}
        onToggle={(v) => toggleInList('types', v)}
      />
      <ChipGroup<FieldOfStudy>
        legend="Field of study"
        options={FIELD_LABELS}
        selected={filters.fields}
        onToggle={(v) => toggleInList('fields', v)}
      />

      <fieldset>
        <legend className="label">Minimum award</legend>
        <input
          type="range"
          min={0}
          max={AMOUNT_STEPS.length - 1}
          step={1}
          value={Math.max(0, AMOUNT_STEPS.indexOf(filters.minAmount))}
          onChange={(e) => setFilter('minAmount', AMOUNT_STEPS[Number(e.target.value)])}
          aria-valuetext={filters.minAmount ? `At least ${formatINRCompact(filters.minAmount)}` : 'Any amount'}
          aria-label="Minimum award amount"
          className="w-full accent-brand-600"
        />
        <p className="mt-1 text-xs text-ink-muted">
          {filters.minAmount ? `At least ${formatINRCompact(filters.minAmount)}` : 'Any amount'}
        </p>
      </fieldset>

      <fieldset>
        <legend className="label">Deadline within</legend>
        <div className="grid grid-cols-2 gap-2">
          {DEADLINE_OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={filters.deadlineWithinDays === o.value}
              onClick={() => setFilter('deadlineWithinDays', o.value)}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm transition',
                filters.deadlineWithinDays === o.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line text-ink-muted hover:text-ink',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

interface ChipGroupProps<T extends string> {
  legend: string;
  options: Record<T, string>;
  selected: T[];
  onToggle: (value: T) => void;
}

function ChipGroup<T extends string>({ legend, options, selected, onToggle }: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((key) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-ink',
              )}
            >
              {options[key]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

