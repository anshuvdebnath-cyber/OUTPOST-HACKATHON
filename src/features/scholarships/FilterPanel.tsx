import { memo } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { EDUCATION_LEVEL_LABELS, FIELD_LABELS, SCHOLARSHIP_TYPE_LABELS } from '../../lib/constants';
import { formatINRCompact } from '../../lib/currency';
import { cn } from '../../lib/cn';
import { useFilterStore } from '../../store/useFilterStore';
import type { EducationLevel, FieldOfStudy, ScholarshipType } from '../../types/scholarship';

const MAX_AWARD = 200000;
const AMOUNT_PRESETS = [0, 25000, 50000, 100000, 200000];
const DEADLINE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any time', value: null },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
];

/** Frosted glassmorphism filter panel for the Discover page. */
export const FilterPanel = memo(function FilterPanel() {
  const { filters, setFilter, toggleInList, resetFilters } = useFilterStore();
  const awardPct = Math.min(100, Math.max(0, (filters.minAmount / MAX_AWARD) * 100));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium tracking-[-0.02em] text-ink">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="glass-subtle inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-ink transition hover:scale-105"
        >
          <RotateCcw aria-hidden="true" className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Custom Glassmorphism Checkbox Toggle */}
      <label
        className={cn(
          'flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-3.5 transition-all duration-300',
          filters.eligibleOnly
            ? 'glass-pill ring-1 ring-accent/50'
            : 'glass-subtle hover:bg-surface/30',
        )}
      >
        <span className="text-xs font-medium leading-snug text-ink">
          Only show scholarships I qualify for
        </span>
        <input
          type="checkbox"
          checked={filters.eligibleOnly}
          onChange={(e) => setFilter('eligibleOnly', e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'grid h-5 w-5 shrink-0 place-items-center rounded-lg border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent',
            filters.eligibleOnly
              ? 'border-accent bg-accent text-accent-ink shadow-sm scale-105'
              : 'glass-subtle border-line/45 text-transparent',
          )}
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </span>
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

      {/* Custom Smooth Glassmorphism Minimum Award Slider */}
      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="text-sm font-medium tracking-tight text-ink">Minimum award</legend>
          <span className="glass-subtle rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink">
            {filters.minAmount > 0 ? `${formatINRCompact(filters.minAmount)}+` : 'Any amount'}
          </span>
        </div>

        <div className="relative flex h-7 items-center">
          {/* Custom frosted glass track */}
          <div className="glass-subtle relative h-2.5 w-full overflow-hidden rounded-full border border-line/35">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-75 ease-out"
              style={{ width: `${awardPct}%` }}
            />
          </div>
          {/* Custom glowing glassmorphism thumb */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-ink bg-accent shadow-md transition-transform duration-150"
            style={{ left: `clamp(10px, ${awardPct}%, calc(100% - 10px))` }}
          />
          {/* Native accessible range input layered invisibly on top for smooth dragging */}
          <input
            type="range"
            min={0}
            max={MAX_AWARD}
            step={1000}
            value={filters.minAmount}
            onChange={(e) => setFilter('minAmount', Number(e.target.value))}
            aria-valuetext={filters.minAmount ? `At least ${formatINRCompact(filters.minAmount)}` : 'Any amount'}
            aria-label="Minimum award amount"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        {/* Quick-select award preset chips */}
        <div className="mt-2 flex flex-wrap justify-between gap-1">
          {AMOUNT_PRESETS.map((amt) => {
            const active = filters.minAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => setFilter('minAmount', amt)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-200',
                  active
                    ? 'bg-accent text-accent-ink shadow-sm'
                    : 'glass-subtle text-ink-muted hover:text-ink',
                )}
              >
                {amt === 0 ? 'Any' : formatINRCompact(amt)}
              </button>
            );
          })}
        </div>
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
                  ? 'bg-accent text-accent-ink shadow-sm'
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
});

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
                  ? 'bg-accent text-accent-ink shadow-sm'
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
