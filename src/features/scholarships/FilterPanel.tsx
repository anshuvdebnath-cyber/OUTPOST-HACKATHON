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

/** Monochrome glassmorphism filter panel for the Discover page. */
export function FilterPanel() {
  const { filters, setFilter, toggleInList, resetFilters } = useFilterStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-normal tracking-[-0.02em] text-ink">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="glass-subtle inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-ink transition hover:scale-105"
        >
          <RotateCcw aria-hidden="true" className="h-3 w-3" /> Reset
        </button>
      </div>

      <label className="glass-subtle flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-3.5 transition hover:scale-[1.01]">
        <span className="text-xs font-medium text-ink">Only show scholarships I qualify for</span>
        <input
          type="checkbox"
          checked={filters.eligibleOnly}
          onChange={(e) => setFilter('eligibleOnly', e.target.checked)}
          className="h-4 w-4 rounded accent-ink"
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
          className="w-full accent-ink"
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
                'rounded-full px-3 py-2 text-xs font-medium transition-all duration-300',
                filters.deadlineWithinDays === o.value
                  ? 'bg-ink text-surface shadow-sm'
                  : 'glass-subtle text-ink-muted hover:text-ink',
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
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(options) as T[]).map((key) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300',
                active
                  ? 'bg-ink text-surface shadow-sm'
                  : 'glass-subtle text-ink-muted hover:text-ink',
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
