import { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SortOption } from '@/types/scholarship';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options: Record<SortOption, string>;
  className?: string;
}

/**
 * High-density frosted glassmorphism custom sort dropdown:
 *  - Uses `.glass-popover` so underlying scholarship cards never bleed through
 *  - Accessible keyboard navigation and click-outside dismissal
 */
export function SortDropdown({ value, onChange, options, className }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectedLabel = options[value] ?? 'Best match';

  return (
    <div ref={containerRef} className={cn('relative z-40', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="sort-options-listbox"
        aria-label={`Sort by: ${selectedLabel}`}
        className={cn(
          'glass-pill flex h-12 w-full items-center justify-between gap-3 rounded-full px-4 text-sm font-medium text-ink transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] sm:w-64 sm:px-5',
          open && 'ring-2 ring-accent/60',
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <span className="text-xs font-normal text-ink-muted">Sort:</span>
          <span className="truncate font-semibold text-ink">{selectedLabel}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300',
            open && 'rotate-180 text-ink',
          )}
        />
      </button>

      {open && (
        <ul
          id="sort-options-listbox"
          role="listbox"
          aria-label="Sort options"
          className="glass-popover animate-fade-in-up absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-[16rem] origin-top-right space-y-1 rounded-2xl p-2 sm:w-64"
        >
          <li role="presentation" className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Sort scholarships by
          </li>
          {(Object.keys(options) as SortOption[]).map((key) => {
            const isSelected = key === value;
            return (
              <li key={key} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-150',
                    isSelected
                      ? 'bg-accent text-accent-ink shadow-sm'
                      : 'text-ink hover:bg-accent/15',
                  )}
                >
                  <span>{options[key]}</span>
                  {isSelected && <Check aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[2.5]" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

